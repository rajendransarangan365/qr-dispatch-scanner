import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Zap, AlertTriangle } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        // 1. Check if the environment is secure (HTTPS or localhost)
        if (!window.isSecureContext) {
            setError("unsecure_context");
            return;
        }

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // 2. Start scanner immediately. This triggers the permission prompt.
        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                onScan(decodedText);
            },
            (errorMessage) => {
                // partial errors, ignore
            }
        ).catch(err => {
            console.error("Error starting scanner", err);
            let msg = "Failed to start camera.";
            if (err?.name === "NotAllowedError") {
                msg = "Permission denied. Please allow camera access in your browser settings.";
            } else if (err?.name === "NotFoundError") {
                msg = "No camera found on this device.";
            } else if (err?.name === "NotReadableError") {
                msg = "Camera is already in use by another app.";
            }
            setError(msg);
        });

        return () => {
            if (scannerRef.current) {
                // We use a flag or try/catch because stopping an unstarted scanner can throw
                try {
                    scannerRef.current.stop().catch(e => console.warn(e));
                    scannerRef.current.clear();
                } catch (e) { console.warn(e); }
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-50">
            {/* Header / Close Button */}
            <div className="absolute top-4 right-4 z-20">
                <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm">
                    <X size={24} />
                </button>
            </div>

            {/* Scanner Container */}
            <div className="absolute inset-0 bg-black">
                <div id="reader" className="w-full h-full"></div>
                {/* Force video to cover via inline style injection since library controls DOM */}
                <style>{`
          #reader video {
            object-fit: cover;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
          }
        `}</style>
            </div>

            {/* Overlay Instructions - Only show if no error */}
            {!error && (
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                    {/* Dark Background Mask with "Hole" */}
                    {/* We can't easily do a true hole with simple CSS overlays without SVG/Canvas opacity tricks. 
                    Instead, we just use a semi-transparent background and a clear borders box. 
                    For a 'hole' effect, we'd need a big border hack. */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Clear Scan Area - Matches JS config size of 250px */}
                    <div
                        className="relative z-20 border-2 border-green-500 rounded-2xl overflow-hidden shadow-[0_0_0_100vw_rgba(0,0,0,0.5)] bg-transparent"
                        style={{ width: '250px', height: '250px' }}
                    >
                        <div className="scan-line"></div>

                        {/* Corners for visual cue */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-green-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-green-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-green-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-green-500 rounded-br-lg"></div>
                    </div>

                    <p className="relative z-20 mt-8 text-white font-medium bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">
                        Align QR Code within frame
                    </p>
                </div>
            )}

            {error === "unsecure_context" && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md z-50">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-800 font-bold mb-2 text-lg">Connection Not Secure</p>
                    <div className="text-sm text-gray-600 mb-6 text-left space-y-2">
                        <p>Your browser blocked camera access because this page is not secure (HTTP).</p>
                        <button onClick={() => window.location.reload()} className="w-full py-3 mt-4 bg-gray-900 text-white rounded-xl font-medium">Reload Page</button>
                    </div>
                </div>
            )}

            {error && error !== "unsecure_context" && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl text-center w-80 z-50">
                    <Camera className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-800 font-semibold mb-2">Camera Error</p>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <button onClick={onClose} className="w-full py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">Cancel</button>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
