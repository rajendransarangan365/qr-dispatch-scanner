import React, { useState } from 'react';
import { QrCode, Zap } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { parseQRData } from '../utils/parser';

const ScanPage = ({ onScanSuccess, showScanner, setShowScanner }) => {

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
                <p className="text-gray-500">Select an action to proceed.</p>
            </div>

            {/* Content Area - Responsive Grid */}
            <div className="flex-1 flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

                {/* 1. New Scan Card */}
                <button
                    onClick={() => setShowScanner(true)}
                    className="
                        group relative overflow-hidden
                        bg-white p-6 rounded-3xl shadow-sm border border-gray-100 
                        text-left hover:shadow-xl hover:border-blue-100 transition-all duration-300
                        flex flex-col justify-between h-48 md:h-64
                    "
                >
                    {/* Background Icon Decoration */}
                    <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                        <QrCode size={160} />
                    </div>

                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform origin-left border border-blue-100">
                        <QrCode size={32} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">New Scan</h3>
                        <p className="text-sm text-gray-500 font-medium">Open camera to scan dispatch QR code.</p>
                    </div>
                </button>

                {/* 2. Simulate Demo Card */}
                <button
                    onClick={() => {
                        const testData = `TN05423869,TNJ254713,DISP${Math.floor(Math.random() * 10000)},ERDN0051,31-10-2025 09:09,450kms,9hrs,Gravel(${Math.floor(Math.random() * 50)}MT),TN36 AY0948,ERODE`;
                        handleScan(testData);
                    }}
                    className="
                        group relative overflow-hidden
                        bg-white p-6 rounded-3xl shadow-sm border border-gray-100 
                        text-left hover:shadow-xl hover:border-purple-100 transition-all duration-300
                        flex flex-col justify-between h-48 md:h-64
                    "
                >
                    {/* Background Icon Decoration */}
                    <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                        <Zap size={160} />
                    </div>

                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform origin-left border border-purple-100">
                        <Zap size={32} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">Quick Demo</h3>
                        <p className="text-sm text-gray-500 font-medium">Simulate a scan with random data.</p>
                    </div>
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
