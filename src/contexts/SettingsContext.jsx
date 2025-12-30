import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const DEFAULT_SETTINGS = {
  lesseeName: 'Nicholas',
  lesseeAddress: 'No.76, Gonkulam New Street, Pudupattinam, Thanjavur district',
  mineralClassification: 'Porampoke Land',
  leasePeriod: '23-09-2025 to 22-09-2026',
  taluk: 'Badalur',
  village: 'Veeramarasanpettai',
  sfNo: '96, /00001.00.00',
  hsnCode: '0002271',
  bulkPermitNo: 'TNJ2500000017',
  vehicleType: 'TIPPER',
  driverName: 'MADHAN',
  driverLicense: 'TN4222035355426',
  driverPhone: '9876543210',
  routeVia: 'Pattukottai',
  authPerson: 'Nicholas',
  destinationAddress: 'Kattumavadi',
  withinTN: 'Yes',
  drivers: [], // { id, name, license, phone, vehicleNo, vehicleType }
  vehicleTypes: ['Tipper', 'Lorry', 'Tractor'],
  landTypes: ['Porampoke Land', 'Patta Land', 'Leased Land'],
  mineralTypes: ['Rough Stone', 'Gravel', 'Savudu'] // Added default mineral types
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    // Merge saved settings with defaults to ensure new keys exist
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

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
      deleteDriver
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
