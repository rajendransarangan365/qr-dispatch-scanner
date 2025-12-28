import React, { useState, useEffect } from 'react';
import QRScanner from './components/QRScanner';
import ResultCard from './components/ResultCard';
import BottomNav from './components/BottomNav';
import HistoryView from './components/HistoryView';
import SearchBar from './components/SearchBar';
import { parseQRData } from './utils/parser';
import { QrCode, RefreshCw } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Data State
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first

  const API_URL = import.meta.env.VITE_API_BASE_URL || '';

  // 1. Fetch History from Backend
  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        sort: 'scannedAt',
        order: sortOrder
      });

      const res = await fetch(`${API_URL}/api/scans?${params}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("API Error:", err);
      // Fallback to local if server down? For phase 2 we focus on server.
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm, sortOrder, activeTab]); // Reload when tab changes too

  // 2. Save Scan to Backend
  const handleScan = async (decodedText) => {
    if (decodedText) {
      console.log("Raw Scan Data:", decodedText);
      const parsed = parseQRData(decodedText);

      if (parsed) {
        try {
          console.log("Parsed Data:", parsed);

          // Optimistic UI Update
          setHistory(prev => [parsed, ...prev]);

          // Show Result immediately
          setSelectedResult(parsed);
          setShowScanner(false);
          setActiveTab('scan');

          // Send to Server
          console.log("Sending to server...");
          const response = await fetch(`${API_URL}/api/scans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed)
          });

          if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
          }

          console.log("Saved to server successfully");

          // Refresh list to get 'real' data (ID, dates)
          fetchHistory();

        } catch (e) {
          console.error("Save Error:", e);
          alert(`Save Failed: ${e.message}`);
        }
      } else {
        console.error("Failed to parse data");
        alert("Could not parse QR code data");
      }
    }
  };

  const handleSimulate = () => {
    const testData = `TN05423869,DISP${Math.floor(Math.random() * 10000)},ERDN0051,31-10-2025 09:09,450kms,9hrs ,Gravel(${Math.floor(Math.random() * 50)}MT),TN${Math.floor(Math.random() * 99)} ZZ${Math.floor(Math.random() * 9999)},ERODE`;
    handleScan(testData);
  };

  const handleBack = () => {
    setSelectedResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative font-sans pb-safe">

        {/* Detail View Overlay */}
        {selectedResult && (
          <div className="absolute inset-0 z-50 bg-gray-50 overflow-y-auto">
            <ResultCard
              data={selectedResult}
              onScanAgain={() => {
                console.log("Scan Next Clicked - Resetting State");
                setSelectedResult(null);
                setShowScanner(true);
              }}
            />
            <button
              onClick={handleBack}
              className="fixed top-4 left-4 p-2 bg-white rounded-full shadow-md text-gray-600 z-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
            </button>
          </div>
        )}

        {/* Main Content Areas */}
        {activeTab === 'scan' && !showScanner && !selectedResult && (
          <div className="flex flex-col h-screen p-6 relative">
            <div className="mt-12 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Code</h1>
              <p className="text-gray-500">Point your camera at a dispatch slip.</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6 mb-24">
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
                onClick={handleSimulate}
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600 font-medium active:scale-95 transition-transform"
              >
                <RefreshCw size={18} />
                Simulate Demo Scan
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col h-full bg-gray-50">
            <div className="px-4 pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">History</h2>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortOrder={sortOrder}
                onSortToggle={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              />
            </div>
            <HistoryView history={history} onItemClick={setSelectedResult} />
          </div>
        )}

        {/* Scanner Overlay */}
        {showScanner && (
          <QRScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        <BottomNav activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          setShowScanner(false);
        }} />

      </div>
    </div>
  );
}

export default App;
