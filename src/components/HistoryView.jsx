import React from 'react';
import { Truck, Calendar, ChevronRight, Box, Trash2, RotateCcw, XCircle } from 'lucide-react';

const HistoryItem = ({ item, onClick, isBin, onDelete, onRestore, onHardDelete }) => (
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
                <div className="flex flex-col text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">{item.material}</span>
                        <span>•</span>
                        <span>{new Date(item.scannedAt || item.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    {isBin && <span className="text-red-400 text-[10px]">Deleted: {new Date(item.deletedAt).toLocaleDateString()}</span>}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
            {!isBin ? (
                <button
                    onClick={(e) => onDelete(item._id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            ) : (
                <>
                    <button
                        onClick={(e) => onRestore(item._id, e)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Restore"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={(e) => onHardDelete(item._id, e)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Forever"
                    >
                        <XCircle size={18} />
                    </button>
                </>
            )}
            <ChevronRight size={16} className="text-gray-300" />
        </div>
    </div>
);

const HistoryView = ({ history, onItemClick, isBin = false, onDelete, onRestore, onHardDelete }) => {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Box size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{isBin ? 'Recycle Bin Empty' : 'No scans yet'}</h3>
                <p className="text-gray-500 text-sm">
                    {isBin ? 'Items deleted will appear here for 30 days.' : 'Scan a QR code to start building your history.'}
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3 pb-24">
            {/* Header handled in App.jsx now to include toggle */}
            {history.map((item, index) => (
                <HistoryItem
                    key={item._id || index}
                    item={item}
                    onClick={onItemClick}
                    isBin={isBin}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onHardDelete={onHardDelete}
                />
            ))}
        </div>
    );
};

export default HistoryView;
