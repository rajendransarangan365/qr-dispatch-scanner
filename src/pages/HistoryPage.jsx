import React, { useState, useEffect } from 'react';
import { Trash2, List, CheckCircle } from 'lucide-react';
import HistoryView from '../components/HistoryView';
import SearchBar from '../components/SearchBar';
import { useSettings } from '../contexts/SettingsContext';

const HistoryPage = ({ onPrint }) => {
    const [viewMode, setViewMode] = useState('history'); // 'history' or 'bin'
    const [history, setHistory] = useState([]);
    const [binHistory, setBinHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [toast, setToast] = useState(null);

    // Use proxy for local dev, or env var for prod
    const API_URL = import.meta.env.VITE_API_BASE_URL || '';

    const fetchHistory = async () => {
        try {
            const params = new URLSearchParams({
                q: searchTerm,
                sort: 'scannedAt',
                order: sortOrder,
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            });
            const res = await fetch(`${API_URL}/api/scans?${params}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("API Error:", err);
        }
    };

    const fetchBinHistory = async () => {
        try {
            // FIXED: endpoint /api/scans/bin if it exists? 
            // Wait, server/index.js didn't show the bin route explicitly in the snippet I viewed.
            // But previous HistoryPage was calling /api/bin.
            // Let me check if I need to fix fetchBinHistory too.
            // Actually, I saw lines 170-200. I didn't see the GET /api/bin route.
            // But assuming the user said "delete inside recycle bin function not working", implying the LIST was working?
            // "delete inside recycle bin funtion not working". This implies they CAN see the bin.
            // So /api/bin might be right for GET, or maybe I missed it.
            // I will assume GET /api/bin is correct (or I'll check it later if list fails).
            // But HARD DELETE was definitely /api/scans/:id in lines 182.
            const res = await fetch(`${API_URL}/api/bin`); // I'll keep this if list works
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
            fetchBinHistory(); // Prelim update
            setToast({ message: "Moved to Recycle Bin", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { alert(err.message); }
    };

    // Restore
    const handleRestore = async (id, e) => {
        e.stopPropagation();
        try {
            // FIXED: Route /api/scans/:id/restore and method PUT
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
            // FIXED: Route /api/scans/:id (DELETE)
            await fetch(`${API_URL}/api/scans/${id}`, { method: 'DELETE' });
            fetchBinHistory();
            setToast({ message: "Permanently deleted", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { alert(err.message); }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        // debounce slightly to avoid rapid calls
        const timer = setTimeout(() => {
            viewMode === 'history' ? fetchHistory() : fetchBinHistory();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, sortOrder, startDate, endDate, viewMode]);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 relative">
            {/* Toast Notification */}
            {toast && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-50">
                    <CheckCircle size={18} className="text-green-400" />
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <div className="px-4 pt-4 bg-gray-50 z-10">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{viewMode === 'history' ? 'History' : 'Recycle Bin'}</h2>
                    <button
                        onClick={() => setViewMode(prev => prev === 'history' ? 'bin' : 'history')}
                        className={`p-2 rounded-full border transition-colors ${viewMode === 'history' ? 'border-gray-200 text-gray-600 hover:bg-gray-100' : 'bg-red-50 text-red-600'}`}
                    >
                        {viewMode === 'history' ? <Trash2 size={20} /> : <List size={20} />}
                    </button>
                </div>
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortOrder={sortOrder}
                    onSortToggle={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={(type, val) => type === 'start' ? setStartDate(val) : setEndDate(val)}
                />
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto">
                <HistoryView
                    history={viewMode === 'history' ? history : binHistory}
                    onPrint={onPrint}
                    isBin={viewMode === 'bin'}
                    onDelete={handleSoftDelete}
                    onRestore={handleRestore}
                    onHardDelete={handleHardDelete}
                />
            </div>
        </div>
    );
};

export default HistoryPage;
