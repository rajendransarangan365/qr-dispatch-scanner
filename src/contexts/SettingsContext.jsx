import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const DEFAULT_SETTINGS = {
  lesseeName: 'Nicholas',
  lesseeId: 'TNJ254713', // Default
  lesseeAddress: 'No.76, Gonkulam New Street, Pudupattinam, Thanjavur district',
  mineralClassification: 'Porampoke Land',
  leasePeriod: '23-09-2025 to 22-09-2026',
  taluk: 'Badalur',
  village: 'Veeramarasanpettai',
  sfNo: '96, /00001.00.00',
  hsnCode: '0002271',
  bulkPermitNo: 'TNJ2500000017',
  dispatchNo: 'DISP0004003323', // Default
  orderRef: '',
  vehicleType: 'TIPPER',
  driverName: 'MADHAN',
  driverLicense: 'TN4222035355426',
  driverPhone: '9876543210',
  routeVia: 'Pattukottai',
  mineCode: 'PDKN0012', // Default Mine Code
  authPerson: 'Nicholas',
  destinationAddress: 'Kattumavadi',
  deliveredTo: 'Kattumavadi', // Default
  withinTN: 'Yes',
  drivers: [], // { id, name, license, phone, vehicleNo, vehicleType }
  vehicleTypes: ['Tipper', 'Lorry', 'Tractor'],
  landTypes: ['Porampoke Land', 'Patta Land', 'Leased Land'],
  mineralTypes: ['Rough Stone', 'Gravel', 'Savudu'], // Added default mineral types
  mineralTypes: ['Rough Stone', 'Gravel', 'Savudu'], // Added default mineral types
  qrFieldMapping: [
    { id: 'serialNo', label: 'Serial No', enabled: true },
    { id: 'dispatchNo', label: 'Dispatch Slip No', enabled: true },
    { id: 'mineCode', label: 'Mine Code', enabled: true },
    { id: 'dateTime', label: 'Date & Time', enabled: true },
    { id: 'distance', label: 'Travelling Distance', enabled: true },
    { id: 'duration', label: 'Travel Time', enabled: true },
    { id: 'material', label: 'Mineral & Quantity', enabled: true },
    { id: 'vehicleNo', label: 'Vehicle Number', enabled: true },
    { id: 'destination', label: 'Destination Address', enabled: true }
  ]
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Use proxy or env var logic (replicated from Modal)
  const API_URL = import.meta.env.VITE_API_BASE_URL || '';

  // 1. Fetch Settings on Load
  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          // Merge fetched data with defaults to ensure new fields are present
          setSettings(prev => ({ ...DEFAULT_SETTINGS, ...data }));
        }
      })
      .catch(err => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  // 2. Save Settings to Backend (Debounced or Optimistic)
  const saveSettingsToBackend = async (newSettings) => {
    try {
      await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  // Save on change with debounce
  useEffect(() => {
    if (loading) return; // Don't save initial load
    const timer = setTimeout(() => {
      saveSettingsToBackend(settings);
    }, 1000); // 1s debounce
    return () => clearTimeout(timer);
  }, [settings, loading]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // --- List Management (Vehicle Types, Land Types) ---
  const addListItem = (key, item) => {
    if (!item.trim()) return;
    setSettings(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), item.trim()]
    }));
  };

  const removeListItem = (key, itemToRemove) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key].filter(i => i !== itemToRemove)
    }));
  };

  // --- Driver Management ---
  const addDriver = (driver) => {
    const newDriver = { ...driver, id: Date.now().toString() };
    setSettings(prev => ({
      ...prev,
      drivers: [...(prev.drivers || []), newDriver]
    }));
  };

  const updateDriver = (id, updatedDriver) => {
    setSettings(prev => ({
      ...prev,
      drivers: prev.drivers.map(d => d.id === id ? { ...d, ...updatedDriver } : d)
    }));
  };

  const deleteDriver = (id) => {
    setSettings(prev => ({
      ...prev,
      drivers: prev.drivers.filter(d => d.id !== id)
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      addListItem,
      removeListItem,
      addDriver,
      updateDriver,
      deleteDriver,
      updateQRMapping: (newMapping) => updateSetting('qrFieldMapping', newMapping)
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
