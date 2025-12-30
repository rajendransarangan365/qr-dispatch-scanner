import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Save, RotateCcw, Check } from 'lucide-react';

const SettingsPanel = () => {
    const { settings, updateSetting, resetSettings } = useSettings();
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    const handleChange = (key, value) => {
        updateSetting(key, value);
    };

    const handleManualSave = () => {
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
    };

    const fields = [
        { key: 'lesseeName', label: 'Lessee Name', type: 'text' },
        { key: 'lesseeId', label: 'Lessee ID', type: 'text' },
        { key: 'lesseeAddress', label: 'Lessee Address', type: 'textarea' },
        { key: 'mineCode', label: 'Mine Code', type: 'text' },
        { key: 'mineralClassification', label: 'Mineral Classification', type: 'text' },
        { key: 'leasePeriod', label: 'Lease Period', type: 'date-range' },
        { key: 'district', label: 'District', type: 'text' },
        { key: 'taluk', label: 'Taluk', type: 'text' },
        { key: 'village', label: 'Village', type: 'text' },
        { key: 'sfNo', label: 'SF No / Extent', type: 'text' },
        { key: 'hsnCode', label: 'HSN Code', type: 'text' },
        { key: 'bulkPermitNo', label: 'Bulk Permit No', type: 'text' },
        { key: 'vehicleType', label: 'Vehicle Type', type: 'text' },
        { key: 'driverName', label: 'Driver Name', type: 'text' },
        { key: 'driverLicense', label: 'Driver License No', type: 'text' },
        { key: 'routeVia', label: 'Via', type: 'text' },
        { key: 'driverPhone', label: 'Driver Phone No', type: 'text' },
        { key: 'authPerson', label: 'Lessee / Authorized Person', type: 'text' },
        { key: 'destinationAddress', label: 'Default Destination (Optional)', type: 'textarea' },
        { key: 'withinTN', label: 'Within Tamil Nadu', type: 'select', options: ['Yes', 'No'] },
    ];

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-full">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Application Settings</h2>
                    <button
                        onClick={() => { if (confirm('Reset all settings to default?')) resetSettings(); }}
                        className="text-red-500 text-sm flex items-center gap-1 hover:bg-red-50 p-2 rounded-lg"
                        title="Reset Defaults"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>

                            {/* Special Logic for Driver Selection */}
                            {field.key === 'driverName' ? (
                                <select
                                    value={settings.driverName || ''}
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const driver = settings.drivers?.find(d => d.name === selectedName);
                                        if (driver) {
                                            // Batch update all driver fields
                                            updateSetting('driverName', driver.name);
                                            updateSetting('driverLicense', driver.license);
                                            updateSetting('driverPhone', driver.phone);
                                            // Optional: update vehicle info if associated with driver defaults?
                                            // User asked "all remain details associated with it need to be changed"
                                            if (driver.vehicleNo) updateSetting('vehicleNo', driver.vehicleNo); // Is 'vehicleNo' a setting key? Ah, bulkPermitNo is. But 'vehicleType' is. 
                                            // Wait, SettingsPanel doesn't expose 'vehicleNo' as a field in the list, only vehicleType.
                                            // But let's check the fields list. 'vehicleType' is there.
                                            if (driver.vehicleType) updateSetting('vehicleType', driver.vehicleType);
                                        } else {
                                            handleChange(field.key, selectedName);
                                        }
                                    }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select Driver</option>
                                    {settings.drivers?.map(d => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            ) : field.key === 'mineralClassification' ? (
                                <select
                                    value={settings[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select Classification</option>
                                    {settings.mineralTypes?.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    value={settings[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    value={settings[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : field.type === 'date-range' ? (
                                (() => {
                                    // Parse: "DD-MM-YYYY to DD-MM-YYYY"
                                    const val = settings[field.key] || '';
                                    const [startVal, endVal] = val.includes(' to ') ? val.split(' to ') : [val, ''];

                                    // Helper: DD-MM-YYYY to YYYY-MM-DD for input
                                    const toInput = (d) => d && d.includes('-') && d.split('-')[0].length === 2 ? d.split('-').reverse().join('-') : (d || '');

                                    // Helper: YYYY-MM-DD to DD-MM-YYYY for storage
                                    const fromInput = (d) => d ? d.split('-').reverse().join('-') : '';

                                    const sInput = toInput(startVal);
                                    const eInput = toInput(endVal);

                                    const updateRange = (newStartInput, newEndInput) => {
                                        const s = fromInput(newStartInput);
                                        const e = fromInput(newEndInput);
                                        // Requirement: "DD-MM-YYYY to DD-MM-YYYY"
                                        handleChange(field.key, (s || e) ? `${s}${s && e ? ' to ' : ''}${e}` : '');
                                    };

                                    return (
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">From Date</label>
                                                <input
                                                    type="date"
                                                    value={sInput}
                                                    onChange={(e) => updateRange(e.target.value, eInput)}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">To Date</label>
                                                <input
                                                    type="date"
                                                    value={eInput}
                                                    onChange={(e) => updateRange(sInput, e.target.value)}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <input
                                    type={field.type}
                                    value={settings[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 sticky bottom-4 space-y-3">
                    {showSaveMessage ? (
                        <div className="flex items-center justify-center text-green-600 gap-2 text-base font-bold bg-green-100 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                            <Check size={24} />
                            Settings Saved Successfully!
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleManualSave}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold p-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                <Save size={20} />
                                Save Settings
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        // Use relative path to leverage proxy or global API_URL if defined
                                        const res = await fetch(`/api/scans?limit=1`);
                                        if (res.ok) alert("✅ Server Connection Successful!");
                                        else alert("❌ Connection Failed: " + res.statusText);
                                    } catch (e) {
                                        alert("❌ Connection Error: " + e.message + "\nEnsure your phone is on the same Wi-Fi and the server is running.");
                                    }
                                }}
                                className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={16} /> Test Server Connection
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
