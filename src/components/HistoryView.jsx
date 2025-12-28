import React from 'react';
import { Truck, Calendar, ChevronRight, Box } from 'lucide-react';

const HistoryItem = ({ item, onClick }) => (
    <div
        onClick={() => onClick(item)}
        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.99] transition-transform"
    >
        <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-3 rounded-xl text-gray-500">
                <Truck size={20} />
            </div>
            <div>
                <h4 className="font-bold text-gray-900 text-sm">{item.vehicleNo}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">{item.material}</span>
                    <span>•</span>
                    <span>{item.dateTime.split(' ')[0]}</span>
                </div>
            </div>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
    </div>
);

const HistoryView = ({ history, onItemClick }) => {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Box size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No scans yet</h3>
                <p className="text-gray-500 text-sm">Scan a QR code to start building your history.</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3 pb-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 px-1">History</h2>
            {history.map((item, index) => (
                <HistoryItem key={index} item={item} onClick={onItemClick} />
            ))}
        </div>
    );
};

export default HistoryView;
