import React from 'react';
import QRCode from 'react-qr-code';
import { Truck, Calendar, ChevronRight, Box, Trash2, RotateCcw, XCircle, FileDown, Printer, CheckCircle } from 'lucide-react';

const HistoryItem = ({ item, onPrint, isBin, onDelete, onRestore, onHardDelete, onStatusUpdate }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleExportDoc = (e) => {
        e.stopPropagation();
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Dispatch Slip</title></head>
            <body>
                <h2>Dispatch Slip Details</h2>
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <tr><td><strong>Serial No</strong></td><td>${item.serialNo || '-'}</td></tr>
                    <tr><td><strong>Mine Code</strong></td><td>${item.mineCode || '-'}</td></tr>
                    <tr><td><strong>Date</strong></td><td>${item.dateTime || '-'}</td></tr>
                    <tr><td><strong>Destination</strong></td><td>${item.destination || '-'}</td></tr>
                    <tr><td><strong>Distance</strong></td><td>${item.distance || '-'}</td></tr>
                    <tr><td><strong>Material</strong></td><td>${item.material || '-'}</td></tr>
                    <tr><td><strong>Vehicle No</strong></td><td>${item.vehicleNo || '-'}</td></tr>
                    <tr><td><strong>Driver License</strong></td><td>${item.driverLicense || '-'}</td></tr>
                </table>
                <br/>
                <p><strong>Raw Data:</strong> ${item.raw || 'N/A'}</p>
            </body>
            </html>
        `;
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Dispatch_${item.serialNo || 'Slip'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Status Badge Logic
    const getStatusParams = (status) => {
        switch (status) {
            case 'given': return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Given' };
            case 'printed': return { color: 'bg-yellow-100 text-yellow-700', icon: Printer, label: 'Printed' };
            default: return { color: 'bg-gray-100 text-gray-600', icon: FileDown, label: 'Generated' };
        }
    };
    const statusParams = getStatusParams(item.tripSheetStatus || 'generated');
    const StatusIcon = statusParams.icon;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
            {/* Header / Summary Row */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-500'} transition-colors`}>
                        <Truck size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {item.vehicleNo}
                            {/* Status Badge in Header */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${statusParams.color} border border-black/5`}>
                                <StatusIcon size={10} /> {statusParams.label}
                            </span>
                        </h4>
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
                    {/* Delete Actions - Stop Propagation to prevent toggle */}
                    <div onClick={(e) => e.stopPropagation()} className="flex gap-1">
                        {!isBin ? (
                            <button onClick={(e) => onDelete(item._id, e)} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
                                <Trash2 size={18} />
                            </button>
                        ) : (
                            <>
                                <button onClick={(e) => onRestore(item._id, e)} className="p-2 text-blue-400 hover:text-blue-600 rounded-full"><RotateCcw size={18} /></button>
                                <button onClick={(e) => onHardDelete(item._id, e)} className="p-2 text-red-400 hover:text-red-600 rounded-full"><XCircle size={18} /></button>
                            </>
                        )}
                    </div>
                    <ChevronRight size={16} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-50 bg-gray-50/50">
                    <div className="flex gap-4 py-4">
                        {/* QR Code */}
                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                            <QRCode value={item.raw || item.serialize || 'N/A'} size={80} />
                        </div>
                        {/* Data Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600">
                            <div><span className="font-semibold text-gray-500">Serial No:</span> <br />{item.serialNo || '-'}</div>
                            <div><span className="font-semibold text-gray-500">Mine Code:</span> <br />{item.mineCode || '-'}</div>
                            <div><span className="font-semibold text-gray-500">Destination:</span> <br />{item.destination || '-'}</div>
                            <div><span className="font-semibold text-gray-500">Driver:</span> <br />{item.driverName || '-'}</div>
                        </div>
                    </div>

                    {/* Raw Data Box */}
                    <div className="mb-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Raw QR Data</div>
                        <div className="p-2 bg-gray-100 rounded-lg text-[10px] font-mono break-all text-gray-600 border border-gray-200 select-all">
                            {item.raw || 'N/A'}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {item.tripSheetStatus !== 'given' && (
                            <button
                                onClick={() => onStatusUpdate(item._id, 'given')}
                                className="flex-1 py-3 bg-green-100 text-green-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-200 active:scale-[0.98] transition-all border border-green-200"
                            >
                                <CheckCircle size={18} />
                                Mark Given
                            </button>
                        )}

                        <button
                            onClick={() => {
                                onPrint(item);
                                // Optimistically update to printed if strict flow needed
                                if (item.tripSheetStatus === 'generated') onStatusUpdate(item._id, 'printed');
                            }}
                            className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md"
                        >
                            <Printer size={18} />
                            Print Slip
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HistoryView = ({ history, onPrint, isBin = false, onDelete, onRestore, onHardDelete, onStatusUpdate }) => {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Box size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{isBin ? 'Recycle Bin Empty' : 'No scans for this date'}</h3>
                <p className="text-gray-500 text-sm">
                    {isBin ? 'Items deleted will appear here for 30 days.' : 'Select a date or change filters.'}
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3 pb-24">
            {history.map((item, index) => (
                <HistoryItem
                    key={item._id || index}
                    item={item}
                    onPrint={onPrint}
                    isBin={isBin}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onHardDelete={onHardDelete}
                    onStatusUpdate={onStatusUpdate}
                />
            ))}
        </div>
    );
};

export default HistoryView;
