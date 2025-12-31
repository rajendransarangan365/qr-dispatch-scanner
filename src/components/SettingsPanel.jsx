import React, { useState } from 'react';
import { Settings, Sliders, Database, FileText, Check, Save, RotateCcw } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import QRFieldManager from './settings/QRFieldManager';
import DocumentSettings from './settings/DocumentSettings';

const SettingsPanel = () => {
    const [activeTab, setActiveTab] = useState('fields'); // fields | general | document
    const { settings, updateSetting, resetSettings, isLoading } = useSettings();
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    const handleManualSave = () => {
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
    };

    const handleChange = (key, value) => {
        updateSetting(key, value);
    };

    const fields = [
        { key: 'lesseeName', label: 'Lessee Name / Lease Name', type: 'text' },
        { key: 'lesseeId', label: 'Lessee ID', type: 'text' },
        { key: 'lesseeAddress', label: 'Lessee / Lease Address', type: 'textarea' },
        { key: 'mineCode', label: 'Mine Code', type: 'text' },
        { key: 'mineralClassification', label: 'Mineral Classification', type: 'text' },
        { key: 'landClassification', label: 'Land Classification', type: 'text' }, // Added as per user request
        { key: 'leasePeriod', label: 'Lease Period', type: 'date-range' },
        { key: 'limit', label: 'Limit (Qty)', type: 'text' },
        { key: 'district', label: 'District', type: 'text' },
        { key: 'taluk', label: 'Taluk', type: 'text' },
        { key: 'village', label: 'Village', type: 'text' },
        { key: 'sfNo', label: 'SF No / Extent', type: 'text' },
        { key: 'hsnCode', label: 'HSN Code', type: 'text' },
        { key: 'bulkPermitNo', label: 'Bulk Permit No', type: 'text' },
        { key: 'dispatchNo', label: 'Dispatch Slip No (Default)', type: 'text' },
        { key: 'orderRef', label: 'Order Ref', type: 'text' },
        { key: 'vehicleType', label: 'Vehicle Type', type: 'text' },
        { key: 'driverName', label: 'Driver Name', type: 'text' },
        { key: 'driverLicense', label: 'Driver License No', type: 'text' },
        { key: 'routeVia', label: 'Via', type: 'text' },
        { key: 'driverPhone', label: 'Driver Phone No', type: 'text' },
        { key: 'authPerson', label: 'Lessee / Authorized Person', type: 'text' },
        { key: 'destinationAddress', label: 'Default Destination (Optional)', type: 'textarea' },
        { key: 'deliveredTo', label: 'Delivered To (Person/Client)', type: 'text' },
        { key: 'withinTN', label: 'Within Tamil Nadu', type: 'select', options: ['Yes', 'No'] },
    ];

    const tabs = [
        { id: 'fields', label: 'QR Fields', icon: <Sliders size={18} /> },
        { id: 'general', label: 'Application Settings', icon: <Settings size={18} /> },
        { id: 'document', label: 'Document Template', icon: <FileText size={18} /> }
    ];

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="w-full max-w-2xl mx-auto p-4 pb-32">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === 'fields' && (
                    <QRFieldManager />
                )}

                {activeTab === 'document' && (
                    <DocumentSettings />
                )}

                {activeTab === 'general' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h3 className="font-bold text-gray-800">Application Configuration</h3>
                            <button
                                onClick={() => { if (confirm('Reset all settings to default?')) resetSettings(); }}
                                className="text-red-500 text-xs flex items-center gap-1 hover:bg-red-50 p-2 rounded-lg"
                                title="Reset Defaults"
                            >
                                <RotateCcw size={14} /> Reset
                            </button>
                        </div>


                        {/* Static Fields Editor */}
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
                                            {/* Allow manual entry fallback if current value isn't in list? 
                                                Actually standard select doesn't allow manual unless we make it a combobox. 
                                                For now we stick to the select loop.
                                            */}
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
                                    ) : field.key === 'landClassification' ? (
                                        <select
                                            value={settings[field.key] || ''}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select Land Type</option>
                                            {settings.landTypes?.map(type => (
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
                                            const val = settings[field.key] || '';
                                            const [startVal, endVal] = val.includes(' to ') ? val.split(' to ') : [val, ''];
                                            const toInput = (d) => d && d.includes('-') && d.split('-')[0].length === 2 ? d.split('-').reverse().join('-') : (d || '');
                                            const fromInput = (d) => d ? d.split('-').reverse().join('-') : '';
                                            const sInput = toInput(startVal);
                                            const eInput = toInput(endVal);
                                            const updateRange = (newStartInput, newEndInput) => {
                                                const s = fromInput(newStartInput);
                                                const e = fromInput(newEndInput);
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

                            <div className="pt-4 border-t sticky bottom-0 bg-white pb-2">
                                {showSaveMessage ? (
                                    <div className="flex items-center justify-center text-green-600 gap-2 text-base font-bold bg-green-100 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                        <Check size={24} />
                                        Settings Saved Successfully!
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleManualSave}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold p-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                                    >
                                        <Save size={20} />
                                        Save All Settings
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPanel;
