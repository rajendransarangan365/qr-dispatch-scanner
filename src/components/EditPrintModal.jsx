import React, { useState, useEffect } from 'react';
import { X, Printer, Save, Loader2, Download } from 'lucide-react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import saveAs from 'file-saver';
import QRCodeLib from 'qrcode';
import ImageModule from 'docxtemplater-image-module-free';
// polyfill buffer if needed, usually vite/webpack handles it or we use specific package
import { useSettings } from '../contexts/SettingsContext';

// Helper to convert Base64 to ArrayBuffer (Browser Safe)
function base64DataURLToArrayBuffer(dataURL) {
    const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    if (!base64Regex.test(dataURL)) {
        return new Uint8Array(atob(dataURL).split("").map(c => c.charCodeAt(0))).buffer;
    }
    const stringBase64 = dataURL.replace(base64Regex, "");
    let binaryString;
    if (typeof window !== "undefined") {
        binaryString = window.atob(stringBase64);
    } else {
        binaryString = new Buffer(stringBase64, "base64").toString("binary");
    }
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

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
            // Ensure we have a date. If missing (e.g. from old scan or empty QR field), default to NOW.
            let initialDate = data.dateTime;
            if (!initialDate || initialDate === "N/A" || initialDate.trim() === "") {
                const now = new Date();
                const pad = n => n.toString().padStart(2, '0');
                initialDate = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
                console.log("[Modal] Missing Date detected, defaulting to:", initialDate);
            }

            setFormData({
                ...data,
                dateTime: initialDate, // Ensure this is set to the valid date string
                // Store raw input value for date field mostly
                rawDate: toInputDate(initialDate),

                driverName: data.driverName || '',
                driverLicense: data.driverLicense || '',
                driverPhone: data.driverPhone || '',
                vehicleNo: data.vehicleNo || '',
                // Prioritize Settings (Configuration) over scanned data as per user request
                // Prioritize Settings (Configuration) over scanned data as per user request
                destination: settings.destinationAddress || data.destination || '',
                deliveredTo: settings.deliveredTo || data.deliveredTo || '',
                material: settings.mineralClassification || data.material || '', // Default to Mineral Classification Setting
                dispatchNo: data.dispatchNo || '',
                mineCode: settings.mineCode || data.mineCode || '',
                lesseeId: settings.lesseeId || data.lesseeId || '',
                via: settings.routeVia || data.routeVia || '',
                vehicleType: settings.vehicleType || data.vehicleType || '',
                landClassification: settings.landClassification || '' // Initialize Land Classification from Settings
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
                    vehicleType: selectedDriver.vehicleType || prev.vehicleType,
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

    // --- WORD GENERATION LOGIC ---
    const generateWordDoc = async () => {
        // Debugging Lease Period
        // alert(`Debug: settings.leasePeriod is "${settings.leasePeriod}"`);


        // Helper to format Lease Period specifically as "DD-MM-YY to DD-MM-YYYY"
        const formatLeasePeriod = (periodStr) => {
            if (!periodStr || periodStr === 'undefined' || periodStr === 'null') return '';
            const parts = periodStr.split(' to ');
            if (parts.length !== 2) return periodStr;

            const [start, end] = parts;
            // Assume input is DD-MM-YYYY. We want Start: DD-MM-YY, End: DD-MM-YYYY

            // Format Start (23-09-2025 -> 23-09-25)
            const startParts = start.split('-');
            let newStart = start;
            if (startParts.length === 3 && startParts[2].length === 4) {
                newStart = `${startParts[0]}-${startParts[1]}-${startParts[2].slice(2)}`;
            }

            // Format End (Keep as DD-MM-YYYY)
            return `${newStart} to ${end}`;
        };

        setIsSubmitting(true);
        try {
            // 1. Fetch Template
            const API_URL = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${API_URL}/api/settings/template`);
            if (response.status === 404) {
                alert("No template uploaded! Please go to Settings -> Document Template to upload one.");
                setIsSubmitting(false);
                return;
            }
            if (!response.ok) throw new Error("Failed to download template");

            const content = await response.arrayBuffer();
            const zip = new PizZip(content);

            // 2. Prepare QR Code Image
            const qrDataStr = JSON.stringify({
                serialNo: formData.serialNo,
                vehicleNo: formData.vehicleNo ? formData.vehicleNo.replace(/\s+/g, '') : '',
                date: formData.dateTime
            });
            const qrDataURL = await QRCodeLib.toDataURL(qrDataStr, { margin: 0, width: 500 });


            // 3. Image Module Options
            const imageOptions = {
                centered: false,
                getImage: (tagValue, tagName) => {
                    // tagValue is base64 string from data map
                    // We need to return an ArrayBuffer
                    // Re-add prefix for helper if missing, or handle raw base64
                    return base64DataURLToArrayBuffer(tagValue);
                },
                getSize: () => [52, 52]
            };

            const imageModule = new ImageModule(imageOptions);

            // 4. Init Doc
            const doc = new Docxtemplater(zip, {
                modules: [imageModule],
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '<', end: '>' }, // Native custom delimiters
                nullGetter: () => { return ""; } // Return empty string instead of "undefined"
            });

            // 5. Data Mapping - User Requested Custom Tags
            // doc.setOptions removed as it causes error with v4 constructor pattern

            const docData = {
                // Core
                "Serial No": formData.serialNo || '',
                "Dispatch No": formData.dispatchNo || '',
                "Mine Code": formData.mineCode || settings.mineCode || '',
                "Dispatch DT": formData.dateTime || formData.rawDate || '', // <Date> replaced by <Dispatch DT>
                "Vehicle No": formData.vehicleNo || '',
                "Material": formData.material || '',
                "Des Add": settings.destinationAddress || '', // Strict mapping as requested
                "Ded Add": settings.destinationAddress || '', // Typo support for user request

                // Lease / Static
                "Lessee Id": formData.lesseeId || settings.lesseeId || '',
                "Lease Name": settings.lesseeName || '',
                "Lease Address": settings.lesseeAddress || '',
                "Lease Area Details": settings.sfNo || '', // Mapping Extent/SFNo here too
                "Lease Period": formatLeasePeriod(settings.leasePeriod),
                "Lease Period ": formatLeasePeriod(settings.leasePeriod), // User requested <Lease Period >


                // Fixed/Requested Specifics
                "Bulk Permit No": settings.bulkPermitNo || '',
                "Order Ref": settings.orderRef || '',
                "Vehicle Type": formData.vehicleType || settings.vehicleType || '',
                "WIT": settings.withinTN || '',
                "LAP": settings.authPerson || '',
                "Req Time": formData.duration || '',
                "Travelling Date": formData.dateTime || '',
                "Travelling Date": formData.dateTime || '',
                "Classification": formData.landClassification || '', // Updated to use editable Form Data
                "Land Classification": formData.landClassification || '',
                "HSN Code": settings.hsnCode || '',
                "HSN code": settings.hsnCode || '',

                // Standard Fields
                "Limit": settings.limit || '',
                "District": settings.district || formData.district || '',
                "Taluk": settings.taluk || '',
                "Village": settings.village || '',
                "Survey No": settings.sfNo || '',

                // Driver
                "Driver Name": formData.driverName || '',
                "Driver License": formData.driverLicense || '',
                "Driver Phone": formData.driverPhone || '',
                "Distance": formData.distance || '',
                "Quantity": settings.limit || formData.quantity || '', // Mapped Limit setting to <Quantity> as requested
                "Transport Via": formData.via || settings.routeVia || '', // Fixed mapping
                "Delivered To": formData.deliveredTo || '',


                // Image - Pass full Data URL or Base64?
                // we'll pass Base64 because getImage helper expects it or DataURL
                "qr": qrDataURL // Passing full Data URL "data:image/png;base64,..."
            };

            // 6. Render
            doc.render(docData);

            // 7. Output
            const out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            saveAs(out, `Dispatch_${formData.serialNo || 'Slip'}.docx`);

        } catch (error) {
            console.error("Doc Gen Error:", error);
            if (error.properties && error.properties.errors) {
                const errorMessages = error.properties.errors.map(e => e.message).join('\n');
                console.error("Template Errors:", errorMessages);
                alert("Template Error:\n" + errorMessages);
            } else {
                alert("Error generating document: " + error.message);
            }
        } finally {
            setIsSubmitting(false);
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
                    <div className="p-6 space-y-6">
                        {/* Datalists with scoped IDs - Hidden */}
                        <datalist id="edit-modal-drivers">{settings.drivers?.map(d => <option key={d.id} value={d.name} />)}</datalist>
                        <datalist id="edit-modal-vehicles">{settings.drivers?.map(d => <option key={d.id + '_v'} value={d.vehicleNo} />)}</datalist>
                        <datalist id="edit-modal-destinations">{settings.destinationAddress && <option value={settings.destinationAddress} />}</datalist>
                        <datalist id="edit-modal-delivered">{settings.deliveredTo && <option value={settings.deliveredTo} />}</datalist>
                        <datalist id="edit-modal-materials">{settings.mineralTypes?.map(m => <option key={m} value={m} />)}</datalist>
                        <datalist id="edit-modal-mines">{settings.mineCode && <option value={settings.mineCode} />}</datalist>
                        <datalist id="edit-modal-vehicle-types">{settings.vehicleTypes?.map(v => <option key={v} value={v} />)}</datalist>
                        <datalist id="edit-modal-land-types">{settings.landTypes?.map(l => <option key={l} value={l} />)}</datalist>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Serial No</label>
                                <input
                                    value={formData.serialNo || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-gray-500 font-mono shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.rawDate || ''}
                                    onChange={handleDateChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Vehicle No</label>
                                <input
                                    name="vehicleNo"
                                    value={formData.vehicleNo}
                                    onChange={handleChange}
                                    list="edit-modal-vehicles"
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Vehicle Type</label>
                                <input
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    list="edit-modal-vehicle-types"
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Dispatch Slip No</label>
                                <input
                                    name="dispatchNo"
                                    value={formData.dispatchNo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 mt-2 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                                <h3 className="text-sm font-bold text-gray-900 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">Driver Details</h3>
                                <div className="w-full sm:w-64">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block tracking-wider">Quick Fill Saved Driver</label>
                                    <select
                                        onChange={handleDriverSelect}
                                        className="w-full px-3 py-2 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer shadow-sm"
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Name</label>
                                    <input
                                        name="driverName"
                                        value={formData.driverName}
                                        onChange={handleChange}
                                        list="edit-modal-drivers"
                                        autoComplete="off"
                                        placeholder="Type name..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">License</label>
                                    <input
                                        name="driverLicense"
                                        value={formData.driverLicense}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Phone</label>
                                    <input
                                        name="driverPhone"
                                        value={formData.driverPhone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg w-fit">Delivery Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Destination Address</label>
                                    <input
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        list="edit-modal-destinations"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Delivered To (Person/Client)</label>
                                    <input
                                        name="deliveredTo"
                                        value={formData.deliveredTo}
                                        onChange={handleChange}
                                        list="edit-modal-delivered"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Material</label>
                                    <input
                                        name="material"
                                        value={formData.material}
                                        onChange={handleChange}
                                        list="edit-modal-materials"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Land Classification</label>
                                    <input
                                        name="landClassification"
                                        value={formData.landClassification || ''}
                                        onChange={handleChange}
                                        list="edit-modal-land-types"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Mine Code</label>
                                    <input
                                        name="mineCode"
                                        value={formData.mineCode}
                                        onChange={handleChange}
                                        list="edit-modal-mines"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200/50 bg-gray-50/50 backdrop-blur-sm sticky bottom-0 z-10 flex flex-col gap-3 rounded-b-2xl">
                        <button
                            onClick={generateWordDoc}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-95 transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download size={22} />
                                    Download Word Document
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPrintModal;
