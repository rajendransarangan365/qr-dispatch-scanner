import React, { useState } from 'react';
import { Plus, Trash2, Edit2, User, FileText, Phone, Truck, Check, X } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const DriverManager = () => {
    const { settings, addDriver, updateDriver, deleteDriver } = useSettings();
    const drivers = settings.drivers || [];
    const vehicleTypes = settings.vehicleTypes || [];

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        license: '',
        phone: '',
        vehicleNo: '',
        vehicleType: ''
    });

    const resetForm = () => {
        setFormData({ name: '', license: '', phone: '', vehicleNo: '', vehicleType: '' });
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (driver) => {
        setFormData(driver);
        setEditId(driver.id);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.license) return alert("Name and License are required");

        if (editId) {
            updateDriver(editId, formData);
        } else {
            addDriver(formData);
        }
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">Manage Drivers</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-transform shadow-sm"
                    >
                        <Plus size={16} /> Add Driver
                    </button>
                )}
            </div>

            {/* Form Section */}
            {isEditing && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        {editId ? <Edit2 size={16} className="text-blue-500" /> : <Plus size={16} className="text-green-500" />}
                        {editId ? 'Edit Driver' : 'New Driver Details'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Driver Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Name"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">License No</label>
                            <input
                                value={formData.license}
                                onChange={e => setFormData({ ...formData, license: e.target.value })}
                                placeholder="TN..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="98...."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Vehicle No</label>
                            <input
                                value={formData.vehicleNo}
                                onChange={e => setFormData({ ...formData, vehicleNo: e.target.value })}
                                placeholder="TN...."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Vehicle Type</label>
                            <select
                                value={formData.vehicleType}
                                onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">Select Type</option>
                                {vehicleTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-transform flex items-center gap-2"
                        >
                            <Check size={18} /> Save Driver
                        </button>
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="grid grid-cols-1 gap-3">
                {drivers.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <User className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-500 text-sm">No drivers added yet.</p>
                    </div>
                ) : (
                    drivers.map(driver => (
                        <div key={driver.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{driver.name}</h4>
                                    <div className="flex flex-wrap text-xs text-gray-500 gap-x-3 gap-y-1 mt-1">
                                        <span className="flex items-center gap-1"><FileText size={12} /> {driver.license}</span>
                                        <span className="flex items-center gap-1"><Phone size={12} /> {driver.phone}</span>
                                        <span className="flex items-center gap-1"><Truck size={12} /> {driver.vehicleNo} • {driver.vehicleType}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(driver)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm("Delete this driver?")) deleteDriver(driver.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DriverManager;
