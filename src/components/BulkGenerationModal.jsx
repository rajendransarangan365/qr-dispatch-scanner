import React, { useState } from 'react';
import { X, Users, Truck, Phone, FileText, CheckCircle, AlertCircle, Copy, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const BulkGenerationModal = ({ isOpen, onClose, baseData, onSuccess }) => {
    const { settings } = useSettings();
    const drivers = settings.drivers || [];
    const vehicleTypes = settings.vehicleTypes || [];
    const mineralTypes = settings.mineralTypes || [];

    const [step, setStep] = useState(1); // 1: Count, 2: Verification
    const [count, setCount] = useState(10);
    // Initialize defaults from Base Data (QR) -> Settings -> Empty
    const [formData, setFormData] = useState({
        driverName: baseData?.driverName || settings.driverName || '',
        driverLicense: baseData?.driverLicense || settings.driverLicense || '',
        driverPhone: baseData?.driverPhone || settings.driverPhone || '',
        vehicleNo: baseData?.vehicleNo || '', // settings doesn't have a single default vehicleNo, usually tied to driver
        vehicleType: baseData?.vehicleType || settings.vehicleType || '',
        material: baseData?.material || '', // Map to mineralClassification default?
        destination: baseData?.destination || settings.destinationAddress || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Use proxy for local dev or env var
    const API_URL = import.meta.env.VITE_API_BASE_URL || '';

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDriverSelect = (e) => {
        const driverId = e.target.value;
        if (!driverId) return;

        const selectedDriver = drivers.find(d => d.id === driverId);
        if (selectedDriver) {
            setFormData(prev => ({
                ...prev,
                driverName: selectedDriver.name,
                driverLicense: selectedDriver.license,
                driverPhone: selectedDriver.phone,
                vehicleNo: selectedDriver.vehicleNo,
                vehicleType: selectedDriver.vehicleType || prev.vehicleType // Use driver's type or keep existing
            }));
        }
    };

    const handleNext = () => {
        if (count < 1) {
            setError("Please enter a valid number of sheets.");
            return;
        }
        setError(null);
        setStep(2);
    };

    const handleGenerate = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                startSerialNo: baseData.serialNo || baseData.permitNo, // Ensure we have the start serial
                count: parseInt(count),
                templateData: {
                    ...baseData,
                    ...formData, // Overwrite/Add editable fields
                    tripSheetStatus: 'generated'
                }
            };

            const res = await fetch(`${API_URL}/api/scans/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to generate");
            }

            const result = await res.json();
            onSuccess(result);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-900">
                        {step === 1 ? 'Bulk Trip Sheets' : 'Verify Details'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-800 font-medium mb-1">Base Serial Number</p>
                                <p className="text-2xl font-mono font-bold text-blue-900 tracking-wider">
                                    {baseData.serialNo || baseData.permitNo}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                    Sequence will start from this number.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Number of Sheets to Generate
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={count}
                                    onChange={(e) => setCount(e.target.value)}
                                    className="w-full px-4 py-3 text-lg font-bold border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Will generate serials from <span className="font-mono font-medium">{baseData.serialNo}</span> to <span className="font-mono font-medium">...{parseInt(baseData.serialNo?.match(/\d+/)?.[0] || 0) + parseInt(count || 0) - 1}</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-2">
                                Please verify and fill in the driver details. These will be applied to all <strong>{count}</strong> trip sheets.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Driver Name</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                                            <Users size={18} />
                                        </div>
                                        <select
                                            name="driverName"
                                            value={formData.driverName}
                                            onChange={(e) => {
                                                const selectedName = e.target.value;
                                                const selectedDriver = drivers.find(d => d.name === selectedName);

                                                if (selectedDriver) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        driverName: selectedDriver.name,
                                                        driverLicense: selectedDriver.license,
                                                        driverPhone: selectedDriver.phone,
                                                        vehicleNo: selectedDriver.vehicleNo,
                                                        vehicleType: selectedDriver.vehicleType || prev.vehicleType
                                                    }));
                                                } else {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select Driver</option>
                                            {drivers.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                            <option value="__manual__" disabled>──────────</option>
                                        </select>
                                        <div className="absolute right-3 top-4 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">License No</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                name="driverLicense"
                                                value={formData.driverLicense}
                                                onChange={handleInputChange}
                                                placeholder="License No"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Phone No</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                name="driverPhone"
                                                value={formData.driverPhone}
                                                onChange={handleInputChange}
                                                placeholder="Phone No"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Vehicle Number</label>
                                        <div className="relative">
                                            <Truck className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                name="vehicleNo"
                                                value={formData.vehicleNo}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Vehicle Type</label>
                                        <select
                                            name="vehicleType"
                                            value={formData.vehicleType || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Select Type</option>
                                            {vehicleTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Material</label>
                                        <select
                                            name="material"
                                            value={formData.material}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select Material</option>
                                            {mineralTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Destination</label>
                                        <input
                                            name="destination"
                                            value={formData.destination}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex gap-3">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl active:scale-95 transition-transform"
                        >
                            Back
                        </button>
                    )}

                    <button
                        onClick={step === 1 ? handleNext : handleGenerate}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Generating...
                            </>
                        ) : (
                            <>
                                {step === 1 ? 'Next' : 'Confirm & Generate'}
                                {step === 1 && <Copy size={18} />}
                                {step === 2 && <CheckCircle size={18} />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default BulkGenerationModal;
