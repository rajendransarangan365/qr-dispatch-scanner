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
  lesseeId: 'TNJ254713' // Added based on image, user can edit
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
