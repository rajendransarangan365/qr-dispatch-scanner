import React, { useState } from 'react';
import { QrCode, RefreshCw } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { parseQRData } from '../utils/parser';

const ScanPage = ({ onScanSuccess, showScanner, setShowScanner }) => {
    // Removed local state, using props from App.jsx

    const handleScan = (decodedText) => {
        if (decodedText) {
            const parsed = parseQRData(decodedText);
            if (parsed) {
                setShowScanner(false);
                onScanSuccess(parsed);
            } else {
                alert("Could not parse QR code data");
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] p-6 relative overflow-y-auto">
            <div className="mt-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispatch Scanner</h1>
                <p className="text-gray-500">Scan QR to generate slip.</p>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-6 mb-12">
                <button
                    onClick={() => setShowScanner(true)}
                    className="aspect-square bg-white rounded-[2rem] shadow-xl border border-blue-50 flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform"
                >
                    <div className="p-6 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200">
                        <QrCode size={48} />
                    </div>
                    <span className="font-bold text-lg text-gray-800">Tap to Scan</span>
                </button>

                <button
                    onClick={() => {
                        const testData = `TN05423869,DISP${Math.floor(Math.random() * 10000)},ERDN0051,31-10-2025 09:09,450kms,9hrs ,Gravel(${Math.floor(Math.random() * 50)}MT),TN${Math.floor(Math.random() * 99)} ZZ${Math.floor(Math.random() * 9999)},ERODE`;
                        handleScan(testData);
                    }}
                    className="flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600 font-medium active:scale-95 transition-transform"
                >
                    <RefreshCw size={18} />
                    Simulate Demo Scan
                </button>
            </div>

            {/* Scanner Overlay */}
            {showScanner && (
                <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            )}
        </div>
    );
};

export default ScanPage;
