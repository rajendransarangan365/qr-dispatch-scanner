import React, { useState, useEffect } from 'react';
import { X, Printer, Save, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const EditPrintModal = ({ isOpen, onClose, data, onConfirm }) => {
    const { settings } = useSettings();
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helpers to parse DD-MM-YYYY HH:mm:ss to YYYY-MM-DDTHH:mm for input
    const toInputDate = (dateStr) => {
        if (!dateStr) return '';
        // formats: "31-12-2025 10:30 am" or "31-12-2025 10:30:00"
        const parts = dateStr.split(/[- :]/);
        // parts: [31, 12, 2025, 10, 30, ...]
        if (parts.length >= 5) {
            const d = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
            if (!isNaN(d)) {
                // Return YYYY-MM-DDTHH:mm
                const pad = n => n.toString().padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
        }
        return '';
    };

    // Helper to format Date Object or Input String back to "DD-MM-YYYY HH:mm:ss"
    const fromInputDate = (inputStr) => {
        if (!inputStr) return '';
        const d = new Date(inputStr);
        if (isNaN(d)) return inputStr;
        const pad = n => n.toString().padStart(2, '0');
        return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    useEffect(() => {
        if (data) {
            setFormData({
                ...data,
                // Store raw input value for date field mostly
                rawDate: toInputDate(data.dateTime),

                driverName: data.driverName || '',
                driverLicense: data.driverLicense || '',
                driverPhone: data.driverPhone || '',
                vehicleNo: data.vehicleNo || '',
                destination: data.destination || settings.destinationAddress || '',
                deliveredTo: data.deliveredTo || settings.deliveredTo || '',
                material: data.material || '',
                dispatchNo: data.dispatchNo || '',
                mineCode: data.mineCode || settings.mineCode || '',
                lesseeId: data.lesseeId || ''
            });
        }
    }, [data, settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-fill Driver Details
        if (name === 'driverName') {
            const selectedDriver = settings.drivers?.find(d => d.name === value);
            if (selectedDriver) {
                setFormData(prev => ({
                    ...prev,
                    driverName: selectedDriver.name,
                    driverLicense: selectedDriver.license || prev.driverLicense,
                    driverPhone: selectedDriver.phone || prev.driverPhone,
                    vehicleNo: selectedDriver.vehicleNo || prev.vehicleNo,
                    // If vehicle type exists in settings, maybe use it?
                }));
            }
        }
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({
            ...prev,
            rawDate: e.target.value,
            dateTime: fromInputDate(e.target.value)
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(formData);
        } catch (error) {
            console.error(error);
            alert("Failed to update: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDriverSelect = (e) => {
        const selectedName = e.target.value;
        if (!selectedName) return;

        const selectedDriver = settings.drivers?.find(d => d.name === selectedName);
        if (selectedDriver) {
            setFormData(prev => ({
                ...prev,
                driverName: selectedDriver.name,
                driverLicense: selectedDriver.license || prev.driverLicense,
                driverPhone: selectedDriver.phone || prev.driverPhone,
                vehicleNo: selectedDriver.vehicleNo || prev.vehicleNo,
                vehicleType: selectedDriver.vehicleType || prev.vehicleType,
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Confirm & Edit Details</h2>
                        <p className="text-sm text-gray-500">Review details before printing</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Datalists with scoped IDs */}
                    <datalist id="edit-modal-drivers">
                        {settings.drivers?.map(d => <option key={d.id} value={d.name} />)}
                    </datalist>
                    <datalist id="edit-modal-vehicles">
                        {settings.drivers?.map(d => <option key={d.id + '_v'} value={d.vehicleNo} />)}
                    </datalist>
                    <datalist id="edit-modal-destinations">
                        {settings.destinationAddress && <option value={settings.destinationAddress} />}
                    </datalist>
                    <datalist id="edit-modal-delivered">
                        {settings.deliveredTo && <option value={settings.deliveredTo} />}
                    </datalist>
                    <datalist id="edit-modal-materials">
                        {settings.mineralTypes?.map(m => <option key={m} value={m} />)}
                    </datalist>
                    <datalist id="edit-modal-mines">
                        {settings.mineCode && <option value={settings.mineCode} />}
                    </datalist>
                    <datalist id="edit-modal-vehicle-types">
                        {settings.vehicleTypes?.map(v => <option key={v} value={v} />)}
                    </datalist>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Serial No (Read Only)</label>
                            <input
                                value={formData.serialNo || ''}
                                disabled
                                className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Date & Time</label>
                            <input
                                type="datetime-local"
                                value={formData.rawDate || ''}
                                onChange={handleDateChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Vehicle No</label>
                            <input
                                name="vehicleNo"
                                value={formData.vehicleNo}
                                onChange={handleChange}
                                list="edit-modal-vehicles"
                                autoComplete="off"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Vehicle Type</label>
                            <input
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                list="edit-modal-vehicle-types"
                                autoComplete="off"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Dispatch Slip No</label>
                            <input
                                name="dispatchNo"
                                value={formData.dispatchNo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-bold text-gray-900">Driver Details</h3>
                            <div className="w-64">
                                <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Quick Fill Saved Driver</label>
                                <select
                                    onChange={handleDriverSelect}
                                    className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Saved Driver...</option>
                                    {settings.drivers?.length > 0 ? (
                                        settings.drivers.map(d => (
                                            <option key={d.id} value={d.name}>{d.name} - {d.vehicleNo}</option>
                                        ))
                                    ) : (
                                        <option disabled>No drivers in settings</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                <input
                                    name="driverName"
                                    value={formData.driverName}
                                    onChange={handleChange}
                                    list="edit-modal-drivers"
                                    autoComplete="off"
                                    placeholder="Type name..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">License</label>
                                <input
                                    name="driverLicense"
                                    value={formData.driverLicense}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                <input
                                    name="driverPhone"
                                    value={formData.driverPhone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900">Delivery Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Destination Address</label>
                                <input
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    list="edit-modal-destinations"
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Delivered To (Person/Client)</label>
                                <input
                                    name="deliveredTo"
                                    value={formData.deliveredTo}
                                    onChange={handleChange}
                                    list="edit-modal-delivered"
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Material</label>
                                <input
                                    name="material"
                                    value={formData.material}
                                    onChange={handleChange}
                                    list="edit-modal-materials"
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Mine Code</label>
                                <input
                                    name="mineCode"
                                    value={formData.mineCode}
                                    onChange={handleChange}
                                    list="edit-modal-mines"
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Printer size={18} />
                                Confirm & Print
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPrintModal;
