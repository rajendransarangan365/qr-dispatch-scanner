import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { ArrowUp, ArrowDown, GripVertical, Check, X } from 'lucide-react';

const QRFieldManager = () => {
    const { settings, updateQRMapping } = useSettings();
    const mapping = settings.qrFieldMapping || [];

    const toggleField = (id) => {
        const newMapping = mapping.map(field =>
            field.id === id ? { ...field, enabled: !field.enabled } : field
        );
        updateQRMapping(newMapping);
    };

    const moveField = (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === mapping.length - 1)
        ) {
            return;
        }

        const newMapping = [...mapping];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newMapping[index], newMapping[swapIndex]] = [newMapping[swapIndex], newMapping[index]];
        updateQRMapping(newMapping);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">QR Code Field Mapping</h3>
                <span className="text-xs text-gray-500">Enable and reorder fields to customize QR output</span>
            </div>

            <div className="divide-y divide-gray-100">
                {mapping.map((field, index) => (
                    <div
                        key={field.id}
                        className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${!field.enabled ? 'opacity-50' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1 text-gray-400">
                                <button
                                    onClick={() => moveField(index, 'up')}
                                    disabled={index === 0}
                                    className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button
                                    onClick={() => moveField(index, 'down')}
                                    disabled={index === mapping.length - 1}
                                    className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                >
                                    <ArrowDown size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 w-6 text-center">
                                    {index + 1}
                                </span>
                                <span className={`font-medium ${field.enabled ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                                    {field.label}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleField(field.id)}
                            className={`
                                p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold
                                ${field.enabled
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}
                            `}
                        >
                            {field.enabled ? (
                                <>
                                    <Check size={14} /> Enabled
                                </>
                            ) : (
                                <>
                                    <X size={14} /> Disabled
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QRFieldManager;
