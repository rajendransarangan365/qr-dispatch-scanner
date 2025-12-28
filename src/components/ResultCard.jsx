import React from 'react';
import { CheckCircle, Truck, MapPin, Clock, Calendar, Box, ArrowRight, FileText } from 'lucide-react';

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
    if (!data) return null;

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

            {/* Main Info Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transport Details</h3>
                </div>
                <div className="p-2 space-y-1">
                    <InfoRow icon={Truck} label="Vehicle Number" value={data.vehicleNo} highlight={true} />
                    <InfoRow icon={Box} label="Material" value={data.material} />
                    <InfoRow icon={MapPin} label="Destination" value={data.destination} />
                </div>
            </div>

            {/* Secondary Info Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trip Details</h3>
                </div>
                <div className="p-2">
                    <InfoRow icon={Clock} label="Duration & Distance" value={`${data.duration} • ${data.distance}`} />
                    <InfoRow icon={Calendar} label="Dispatch Time" value={data.dateTime} />
                    <InfoRow icon={FileText} label="Dispatch Slip" value={data.dispatchNo} />
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={onScanAgain}
                className="w-full py-4 bg-gray-900 active:bg-gray-800 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all mb-8"
            >
                <ArrowRight size={20} />
                Scan Next
            </button>

            <p className="text-center text-xs text-gray-400 mt-6">
                System v1.0 • Erode Mines
            </p>
        </div>
    );
};

export default ResultCard;
