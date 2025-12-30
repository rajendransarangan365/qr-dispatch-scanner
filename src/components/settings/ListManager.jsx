import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const ListManager = ({ title, settingKey, placeholder }) => {
    const { settings, addListItem, removeListItem } = useSettings();
    const items = settings[settingKey] || [];
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            addListItem(settingKey, newItem);
            setNewItem('');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">{title}</h3>
                <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-200">
                    {items.length} Items
                </span>
            </div>

            <div className="p-4">
                <div className="flex gap-2 mb-4">
                    <input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newItem.trim()}
                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                            <span>{item}</span>
                            <button
                                onClick={() => removeListItem(settingKey, item)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-xs text-gray-400 italic w-full text-center py-2">No items added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListManager;
