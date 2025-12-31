import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, MapPin, Clock, Calendar, Box, ArrowRight, FileText, Copy, List } from 'lucide-react';
import BulkGenerationModal from './BulkGenerationModal';

const InfoRow = ({ icon: Icon, label, value, highlight = false }) => (
    <div className={`flex items-start p-3 ${highlight ? 'bg-blue-50 border-blue-100 border rounded-xl' : 'border-b border-gray-100 last:border-0'}`}>
        <div className={`p-2 rounded-lg mr-3 ${highlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            <Icon size={highlight ? 24 : 18} />
        </div>
        <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
            <p className={`font-semibold ${highlight ? 'text-lg text-blue-900' : 'text-gray-800'}`}>{value}</p>
        </div>
    </div>
);

const ResultCard = ({ data, onScanAgain }) => {
    const navigate = useNavigate();
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    if (!data) return null;

    // Check if this is a valid QR for bulk generation (Starts with TN)
    const canGenerateBulk = data.serialNo && data.serialNo.startsWith("TN");

    const handleBulkSuccess = (result) => {
        // Redirect to History Page to see the generated items
        navigate('/history');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20 animate-in fade-in zoom-in duration-300">
            {/* Header Status */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 text-center border-l-4 border-green-500">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-3">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verified Dispatch</h2>
                <p className="text-sm text-gray-500 mt-1">Serial No: <span className="font-mono font-medium text-gray-700">{data.serialNo}</span></p>
            </div>

            {/* Bulk Generation Option */}
            {canGenerateBulk && (
                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="w-full mb-4 py-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Copy size={18} />
                    Generate Bulk Trip Sheets
                </button>
            )}

            {/* Main Info Card */}
            return (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-gray-100 animate-pop">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 shadow-inner border border-white/20">
                            <CheckCircle size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Scan Successful</h2>
                        <p className="text-blue-100 text-sm mt-1 font-medium">Data captured successfully</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Vehicle Number</label>
                            <div className="font-mono text-lg font-bold text-gray-800 tracking-tight">{data.vehicleNo || 'N/A'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Date & Time</label>
                            <div className="font-mono text-sm font-semibold text-gray-800 mt-1">{data.dateTime || 'N/A'}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onEdit}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group"
                        >
                            <Printer size={18} className="group-hover:animate-pulse" />
                            Print Dispatch Slip
                        </button>

                        <button
                            onClick={onBulk}
                            className="w-full py-3.5 bg-white border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 group"
                        >
                            <Files size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                            Generate Bulk Trip Sheets
                        </button>

                        <button
                            onClick={onScanAgain}
                            className="w-full py-3 text-gray-400 hover:text-gray-600 font-medium text-xs transition-colors flex justify-center items-center gap-1.5"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
                            Scan New Code
                        </button>
                    </div>
                </div>
            </div>
            <BulkGenerationModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                baseData={data}
                onSuccess={handleBulkSuccess}
            />
        </div>
    );
};

export default ResultCard;
