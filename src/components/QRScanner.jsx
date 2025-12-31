import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, X, AlertTriangle, RefreshCw, ZoomIn, ZoomOut, Plus, Minus } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const scannerId = "reader";

    const [zoom, setZoom] = useState(1);
    const [zoomRange] = useState({ min: 0.5, max: 3, step: 0.1 });

    // Lock to prevent race conditions during React StrictMode (mount/unmount)
    const operationLock = useRef(Promise.resolve());

    // Execute an async operation with a lock to ensure serialization
    const withLock = (operation) => {
        const result = operationLock.current.then(() => operation().catch(e => {
            // Log but don't crash the chain
            console.warn("Camera operation failed:", e);
        }));
        operationLock.current = result;
        return result;
    };

    const handleZoom = (delta) => {
        setZoom(prev => {
            const newZoom = Math.min(Math.max(prev + delta, zoomRange.min), zoomRange.max);
            return newZoom;
        });
    };

    useEffect(() => {
        if (!window.isSecureContext) {
            setError("Page not secure (HTTPS required).");
            return;
        }

        // Initialize Scanner Instance
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        const startScanning = async () => {
            // Poll for DOM element availability (fixes clientWidth error)
            let attempts = 0;
            const checkDom = () => document.getElementById(scannerId)?.clientWidth > 0;

            while (!checkDom() && attempts < 10) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }

            if (!checkDom()) {
                console.warn("Scanner DOM element not ready.");
                return;
            }

            try {
                const config = {
                    fps: 10,
                    aspectRatio: window.innerWidth / window.innerHeight,
                    // qrbox: undefined // Full screen scanning
                };

                // Helper to start camera with specific constraints
                const tryStartCamera = async (constraints) => {
                    try {
                        await scanner.start(constraints, config,
                            (decodedText) => {
                                withLock(async () => {
                                    if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
                                        await scanner.stop();
                                        scanner.clear();
                                        onScan(decodedText);
                                    }
                                });
                            },
                            (err) => { /* ignore frame errors */ }
                        );

                        // Note: visual zoom handled by CSS now

                    } catch (err) {
                        // Explicitly ignore this specific AbortError from video element
                        if (err.name === 'AbortError' || err.message?.includes('interrupted')) {
                            console.debug("Camera start interrupted (safe to ignore).");
                            return; // Do not throw
                        }
                        throw err;
                    }
                };

                // Attempt 1: Environment Camera
                try {
                    await tryStartCamera({ facingMode: "environment" });
                } catch (envErr) {
                    if (envErr.name === 'AbortError' || envErr.message?.includes('interrupted')) return;

                    console.warn("Environment camera failed/timed out, retrying with any camera...", envErr);
                    // Attempt 2: Fallback to Any Camera after slight delay
                    await new Promise(r => setTimeout(r, 500));
                    try {
                        await tryStartCamera(true);
                    } catch (finalErr) {
                        if (finalErr.name === 'AbortError' || finalErr.message?.includes('interrupted')) return;
                        throw finalErr;
                    }
                }

            } catch (err) {
                // Ignore AbortError (common in React StrictMode/Hot Reload)
                if (err.name === 'AbortError' || err.message?.includes('interrupted')) return;

                console.error("Start failed", err);
                // Map common errors
                let msg = "Failed to start camera.";
                if (err?.name === 'NotAllowedError') msg = "Access denied. Please allow camera permission.";
                else if (err?.name === 'NotFoundError') msg = "No camera found.";
                else if (err?.name === 'NotReadableError') msg = "Camera is busy.";

                setError(msg);
            }
        };

        // Mount: Start Camera (Serialized)
        withLock(() => startScanning());

        // Unmount: Stop & Clear (Serialized)
        return () => {
            withLock(async () => {
                if (scannerRef.current) {
                    try {
                        const state = scannerRef.current.getState();
                        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                            await scannerRef.current.stop();
                        }
                        scannerRef.current.clear();
                    } catch (e) {
                        // Ignore errors during cleanup to prevent "AbortError" noise
                        console.warn("Cleanup warning (safe to ignore)", e);
                    }
                }
            });
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-end">
                <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 bg-black relative overflow-hidden">
                <div id="reader" className="w-full h-full"></div>

                {/* Visual Overlay (Pointer Events None) */}
                {!error && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        {/* Dynamic Scan Box Visualization */}
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-2 border-white/40 rounded-3xl overflow-hidden">
                            <div className="scan-line"></div>
                            {/* Corners for focus feel */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-green-500 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-green-500 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-green-500 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-green-500 rounded-br-xl"></div>
                        </div>
                        <p className="mt-8 text-white/90 font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                            Scan any code
                        </p>

                        {/* Zoom Control Buttons - pointer-events-auto needed */}
                        <div className="mt-6 flex items-center gap-6 pointer-events-auto">
                            <button
                                onClick={() => handleZoom(-0.5)}
                                className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white active:scale-95 transition-all"
                            >
                                <Minus size={24} />
                            </button>

                            <div className="bg-black/50 px-3 py-1 rounded-full text-xs text-white/80 font-mono">
                                {zoom.toFixed(1)}x
                            </div>

                            <button
                                onClick={() => handleZoom(0.5)}
                                className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white active:scale-95 transition-all"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS Injection for Video Object Fit and Zoom */}
            <style>{`
                #reader { width: 100% !important; height: 100% !important; border: none !important; }
                #reader video { 
                    object-fit: cover !important; 
                    width: 100% !important; 
                    height: 100% !important;
                    transform: scale(${zoom}) !important;
                    transition: transform 0.2s ease-out; /* Smooth zoom transition */
                }
            `}</style>


            {/* Error UI */}
            {error && (
                <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Camera Error</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold active:scale-95 transition-transform">
                            <RefreshCw size={20} /> Reload App
                        </button>
                        <button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold active:scale-95 transition-transform">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
