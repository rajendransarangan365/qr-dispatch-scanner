import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, List, CheckCircle, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import HistoryView from '../components/HistoryView';
import SearchBar from '../components/SearchBar';
import Calendar from '../components/Calendar'; // Import the new Calendar component
import { useSettings } from '../contexts/SettingsContext';

const HistoryPage = ({ onPrint }) => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'list', 'bin'
    const [showCalendar, setShowCalendar] = useState(true); // Control visibility of calendar grid
    const [history, setHistory] = useState([]);
    const [binHistory, setBinHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [toast, setToast] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Use proxy for local dev, or env var for prod
    const API_URL = import.meta.env.VITE_API_BASE_URL || '';

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                q: searchTerm,
                sort: 'scannedAt',
                order: sortOrder,
                page: page.toString(),
                limit: '50',
                ...(viewMode === 'calendar' ? {
                    startDate: startDate,
                    endDate: endDate
                } : {
                    startDate,
                    endDate
                })
            });

            const res = await fetch(`${API_URL}/api/scans?${params}`);
            if (res.ok) {
                const data = await res.json();
                if (data.pagination) {
                    setHistory(data.data);
                    setTotalPages(data.pagination.totalPages);
                } else {
                    setHistory(data);
                }
            }
        } catch (err) {
            console.error("API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBinHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bin`);
            if (res.ok) setBinHistory(await res.json());
        } catch (err) { console.error("Bin Fetch Error:", err); }
    };

    // Soft Delete
    const handleSoftDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Move to Recycle Bin?")) return;
        try {
            await fetch(`${API_URL}/api/scans/${id}/delete`, { method: 'PUT' });
            fetchHistory();
            fetchBinHistory();
            setToast({ message: "Moved to Recycle Bin", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { alert(err.message); }
    };

    // Restore
    const handleRestore = async (id, e) => {
        e.stopPropagation();
        try {
            await fetch(`${API_URL}/api/scans/${id}/restore`, { method: 'PUT' });
            fetchBinHistory();
            fetchHistory();
            setToast({ message: "Restored successfully", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { alert(err.message); }
    };

    // Hard Delete
    const handleHardDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Permanently delete this item? This cannot be undone.")) return;
        try {
            await fetch(`${API_URL}/api/scans/${id}`, { method: 'DELETE' });
            fetchBinHistory();
            setToast({ message: "Permanently deleted", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { alert(err.message); }
    };

    // Status Update (Trip Sheet Given)
    const handleStatusUpdate = async (id, newStatus, e) => {
        if (e) e.stopPropagation();
        try {
            await fetch(`${API_URL}/api/scans/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripSheetStatus: newStatus,
                    tripSheetGivenAt: newStatus === 'given' ? new Date() : null
                })
            });
            fetchHistory(); // Refresh to show new status
            setToast({ message: `Status updated to ${newStatus}`, type: "success" });
            setTimeout(() => setToast(null), 2000);
        } catch (err) { console.error(err); }
    }

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, sortOrder, viewMode, startDate, endDate]);

    // Fetch on mount and when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (viewMode === 'bin') fetchBinHistory();
            else fetchHistory();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, sortOrder, startDate, endDate, viewMode, page]);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 relative">
            {/* Toast Notification */}
            {toast && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-50">
                    <CheckCircle size={18} className="text-green-400" />
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <div className="px-4 pt-4 bg-gray-50 z-10 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {viewMode === 'bin' ? 'Recycle Bin' : 'History'}
                            {viewMode === 'calendar' && (
                                <button
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="text-xs font-normal text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-200 transition-colors"
                                >
                                    <CalendarIcon size={12} />
                                    {startDate === endDate ? startDate : `${startDate} to ${endDate}`}
                                    <span className={`transform transition-transform ${showCalendar ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                            )}
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setViewMode('calendar');
                                setShowCalendar(true);
                            }}
                            className={`p-2 rounded-xl border transition-colors ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-white text-gray-400 border-gray-200'}`}
                        >
                            <CalendarIcon size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl border transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-white text-gray-400 border-gray-200'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode(prev => prev === 'bin' ? 'calendar' : 'bin')}
                            className={`p-2 rounded-xl border transition-colors ${viewMode === 'bin' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-gray-400 border-gray-200 hover:text-red-500'}`}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar View */}
                {viewMode === 'calendar' && showCalendar && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 origin-top">
                        <Calendar
                            startDate={startDate}
                            endDate={endDate}
                            onRangeSelect={(start, end) => {
                                console.log('Range Selected:', start, end);
                                setStartDate(start);
                                setEndDate(end);
                                // kept open for better UX
                            }}
                        />
                    </div>
                )}

                {/* Legacy Search Bar */}
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortOrder={sortOrder}
                    onSortToggle={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={(type, val) => type === 'start' ? setStartDate(val) : setEndDate(val)}
                    hideDates={viewMode === 'calendar'}
                />
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto mt-2">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <HistoryView
                        history={viewMode === 'bin' ? binHistory : history}
                        onPrint={onPrint}
                        isBin={viewMode === 'bin'}
                        onDelete={handleSoftDelete}
                        onRestore={handleRestore}
                        onHardDelete={handleHardDelete}
                        onStatusUpdate={handleStatusUpdate}
                    />
                )}
            </div>

            {/* Pagination Controls */}
            {viewMode !== 'bin' && (
                <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-gray-700 font-medium"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 font-medium">Page {page} of {totalPages || 1}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 disabled:opacity-50 rounded-lg font-medium"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
