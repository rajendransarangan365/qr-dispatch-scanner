import React, { useState, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { X, Edit3, Printer, Check, RefreshCw, Info, CheckCircle, Save, Copy } from 'lucide-react';

import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import BottomNav from './components/BottomNav';
import ResultCard from './components/ResultCard'; // Or just PrintLayout directly used in Preview
import BulkGenerationModal from './components/BulkGenerationModal';
import PrintLayout from './components/PrintLayout';
import { parseQRData } from './utils/parser';
import { useSettings } from './contexts/SettingsContext';
import QRScanner from './components/QRScanner'; // Only if needed in App? Moved to ScanPage.

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showScanner, setShowScanner] = useState(true); // Re-add this
  // States for Preview/Print Flow (still global to allow access from History)
  const [scannedData, setScannedData] = useState(null); // The QR data for preview
  const [showPreview, setShowPreview] = useState(false); // The Confirm Panel
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); // State for Bulk Generation Modal

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { settings } = useSettings();
  const printRef = useRef();

  // Use proxy for local dev (relative path), or env var for prod
  const API_URL = import.meta.env.VITE_API_BASE_URL || '';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Dispatch_${scannedData?.permitNo || 'Slip'}`,
  });

  // Helper: Save/Update Scan
  const saveScanToBackend = async (dataToSave, isUpdate = false, existingId = null) => {
    // Map to Backend Schema Keys
    const dynamicData = dataToSave.raw ? (typeof dataToSave.raw === 'string' ? parseQRData(dataToSave.raw) : dataToSave) : dataToSave;

    const schemaData = {
      serialNo: dynamicData.permitNo,
      dispatchNo: dynamicData.dispatchSlipNo,
      mineCode: dynamicData.mineCode,
      dateTime: dynamicData.dispatchDate,
      distance: dynamicData.distance,
      duration: dynamicData.duration,
      material: dynamicData.mineralQty,
      vehicleNo: dynamicData.vehicleNo,
      destination: dynamicData.district,
      raw: dynamicData.raw,
      ...dynamicData // Include any other dynamic fields
    };

    const mergedData = { ...schemaData, ...settings };
    if (!isUpdate) { mergedData.scannedAt = new Date(); } // Only set scannedAt on initial save

    const url = isUpdate ? `${API_URL}/api/scans/${existingId}` : `${API_URL}/api/scans`;
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mergedData)
    });

    if (!res.ok) throw new Error("Failed to save");
    return await res.json();
  };

  // New: Handles the manual save action from the preview modal
  const handleSaveScan = async () => {
    if (!scannedData) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      // If scannedData already has an _id, it means it was loaded from history
      // and we might be re-saving after an edit, so we update.
      const savedRecord = await saveScanToBackend(scannedData, scannedData._id ? true : false, scannedData._id);

      // Update state with backend record (has _id)
      setScannedData(savedRecord);
      setIsSaved(true);

    } catch (error) {
      console.error("Save error:", error);
      setSaveError("Failed to save scan: " + error.message);
      setIsSaved(false); // Ensure it's not marked as saved if an error occurred
    } finally {
      setIsSaving(false);
    }
  };

  // New: Handles discarding the current scan result
  const handleDiscard = () => {
    setScannedData(null);
    setShowPreview(false);
    setIsSaved(false);
    setSaveError(null);
    setShowScanner(true); // Re-enable scanner
    navigate('/'); // Go back to the scan page
  };

  // Refactored: This was handleConfirmAndPrint, now just handles printing
  const handlePrintAction = () => {
    if (isSaved && scannedData) { // Only allow printing if data is saved
      handlePrint();
      // Optional: You might want to update the record in backend to mark as printed
    } else {
      alert("Please save the record before printing.");
    }
  };

  // New: handleScanSuccess for ScanPage
  const handleScanSuccess = (data) => {
    // 1. Process Raw Data
    // handle data being string or object
    const parsed = (typeof data === 'string') ? parseQRData(data) : data;
    const rawVal = (typeof data === 'string') ? data : (data.raw || JSON.stringify(data));

    // Add raw data and a timestamp for preview
    const previewData = {
      ...parsed,
      raw: rawVal, // Store the raw QR string
      scannedAt: new Date().toISOString() // Use scannedAt for initial timestamp
    };

    setScannedData(previewData);
    setIsSaved(false); // Reset save state
    setIsSaving(false);
    setSaveError(null);
    setShowPreview(true);
    setShowScanner(false); // Hide scanner when preview is shown
  };


  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-4 sm:py-8 px-4 font-sans text-gray-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-md md:max-w-5xl lg:max-w-7xl bg-gray-50/95 backdrop-blur-xl min-h-[calc(100vh-2rem)] shadow-2xl rounded-3xl relative overflow-hidden border border-white/20 ring-1 ring-black/5 pb-safe transition-all duration-300">

        {/* === CONFIRM / PREVIEW PANEL (Global Overlay) === */}
        {showPreview && scannedData && (
          <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col max-w-md mx-auto shadow-2xl">
            <div className="bg-white p-4 shadow-sm flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                {isSaved ? <CheckCircle className="text-green-500" size={20} /> : <Info className="text-blue-500" size={20} />}
                {isSaved ? "Saved Successfully!" : "Scan Result"}
              </h2>
              <button onClick={handleDiscard} className="text-gray-500"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative">
              {/* Save Error Banner */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center justify-center gap-2 text-red-700 animate-in fade-in zoom-in-50 duration-300">
                  <div className="bg-red-100 p-1 rounded-full"><X size={16} /></div>
                  <span className="font-bold text-sm">{saveError}</span>
                </div>
              )}

              {/* Bulk Generation Option */}
              {(scannedData.permitNo || scannedData.serialNo) && (scannedData.permitNo?.startsWith("TN") || scannedData.serialNo?.startsWith("TN")) && (
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="w-full mb-4 py-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Copy size={18} />
                  Generate Bulk Trip Sheets
                </button>
              )}

              {/* Live Print Preview Rendering */}
              <div className="bg-white shadow-lg p-2 scale-75 origin-top mb-4 border inset-0 mx-auto w-fit">
                <PrintLayout
                  ref={printRef}
                  settings={settings}
                  qrData={scannedData.raw ? parseQRData(scannedData.raw) : scannedData}
                />
              </div>

              <div className="text-center text-sm text-gray-500 mb-20">
                Check details above.
              </div>
            </div>

            <div className="p-4 bg-white border-t flex flex-col gap-3">
              {!isSaved ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleDiscard}
                    className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-bold flex justify-center items-center gap-2 border border-red-200 hover:bg-red-200 active:scale-95 transition-transform"
                  >
                    <X size={18} />
                    Discard
                  </button>
                  <button
                    onClick={handleSaveScan}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg hover:bg-green-700 active:scale-95 transition-transform"
                  >
                    {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? "Saving..." : "Save Result"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrintAction}
                      className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
                    >
                      <Printer size={20} />
                      Print Slip
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setScannedData(null);
                        setShowPreview(false);
                        setIsSaved(false);
                        setSaveError(null);
                        setShowScanner(true);
                        navigate('/');
                      }}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-200 active:scale-95 transition-transform"
                    >
                      <RefreshCw size={18} />
                      Scan Next
                    </button>

                    <button
                      onClick={() => {
                        setShowPreview(false);
                        navigate('/settings');
                      }}
                      className="flex-1 py-3 bg-yellow-50 text-yellow-700 rounded-xl font-bold flex justify-center items-center gap-2 border border-yellow-200 hover:bg-yellow-100 active:scale-95 transition-transform"
                    >
                      <Edit3 size={18} />
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
            {/* Bulk Modal */}
            <BulkGenerationModal
              isOpen={isBulkModalOpen}
              onClose={() => setIsBulkModalOpen(false)}
              baseData={{ ...scannedData, serialNo: scannedData.serialNo || scannedData.permitNo }} // Correctly handle serialNo/permitNo
              onSuccess={() => {
                setIsBulkModalOpen(false);
                navigate('/history');
              }}
            />
          </div>
        )}

        {/* === ROUTES === */}
        <Routes>
          <Route path="/" element={
            <ScanPage onScanSuccess={handleScanSuccess} showScanner={showScanner} setShowScanner={setShowScanner} />
          } />
          <Route path="/history" element={
            <HistoryPage onPrint={(item) => {
              setScannedData(item);
              setIsSaved(true); // Items from history are considered saved
              setShowPreview(true);
              setShowScanner(false); // Hide scanner when preview is shown
            }} />
          } />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>

        <BottomNav />
      </div>
    </div>
  );
}

// Wrap with Provider
import { SettingsProvider } from './contexts/SettingsContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
