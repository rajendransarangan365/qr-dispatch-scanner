import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { FileText, Upload, Copy, Check, UploadCloud } from 'lucide-react';

const DocumentSettings = () => {
    const { uploadTemplate } = useSettings();
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);
        try {
            await uploadTemplate(file);
            setMessage({ type: 'success', text: 'Template uploaded successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload: ' + err.message });
        } finally {
            setUploading(false);
        }
    };

    const placeholders = [
        {
            category: "Core Details",
            items: [
                { label: 'Serial No', tag: '<Serial No>' },
                { label: 'Dispatch No', tag: '<Dispatch No>' },
                { label: 'Mine Code', tag: '<Mine Code>' },
                { label: 'Date', tag: '<Dispatch DT>' },
                { label: 'Vehicle No', tag: '<Vehicle No>' },
                { label: 'Vehicle Type', tag: '<Vehicle Type>' },
                { label: 'Material', tag: '<Material>' },
                { label: 'Bulk Permit No', tag: '<Bulk Permit No>' },
                { label: 'Order Ref', tag: '<Order Ref>' },
            ]
        },
        {
            category: "Lease/Mine Info",
            items: [
                { label: 'Lessee Id', tag: '<Lessee Id>' },
                { label: 'Lessee Name', tag: '<Lease Name>' },
                { label: 'Lessee Addr', tag: '<Lease Address>' },
                { label: 'Auth Person', tag: '<LAP>' },
                { label: 'District', tag: '<District>' },
                { label: 'Taluk', tag: '<Taluk>' },
                { label: 'Village', tag: '<Village>' },
                { label: 'Survey No', tag: '<Survey No>' },
                { label: 'Limit', tag: '<Limit>' },
                { label: 'Lease Period', tag: '<Lease Period>' },
                { label: 'Classification', tag: '<Land Classification>' },
                { label: 'HSN Code', tag: '<HSN code>' },
                { label: 'Within TN', tag: '<WIT>' },
            ]
        },
        {
            category: "Driver & Trip",
            items: [
                { label: 'Driver Name', tag: '<Driver Name>' },
                { label: 'License', tag: '<Driver License>' },
                { label: 'Phone', tag: '<Driver Phone>' },
                { label: 'Destination', tag: '<Des Add>' },
                { label: 'Distance', tag: '<Distance>' },
                { label: 'Duration', tag: '<Req Time>' },
                { label: 'Travel Date', tag: '<Travelling Date>' },
                { label: 'Delivered To', tag: '<Delivered To>' },
                { label: 'Transport Via', tag: '<Transport Via>' },
            ]
        },
        {
            category: "Special",
            items: [
                { label: 'QR Image', tag: '<%qr>' },
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} />
                    Word Template Configuration
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                    Upload a <strong>.docx</strong> file to be used as a template for generating dispatch slips.
                    Use the placeholders below in your Word document to automatically fill in data.
                </p>

                {/* Upload Area */}
                <div className="mb-8">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer bg-blue-50/50 hover:bg-blue-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <UploadCloud className="animate-bounce text-blue-500 mb-2" size={32} />
                            ) : (
                                <UploadCloud className="text-blue-500 mb-2" size={32} />
                            )}
                            <p className="mb-2 text-sm text-gray-600 font-semibold">
                                {uploading ? "Uploading..." : "Click to upload template (.docx)"}
                            </p>
                            <p className="text-xs text-gray-400">Word Document only</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept=".docx"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                    {message && (
                        <div className={`mt-3 text-sm font-medium text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Reference Table */}
                <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider border-b pb-2">Available Placeholders</h4>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <th className="p-3 rounded-tl-xl">Description</th>
                                    <th className="p-3 rounded-tr-xl">Tag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {placeholders.map((categoryItem, categoryIndex) => (
                                    <React.Fragment key={categoryIndex}>
                                        {categoryItem.items.map((item, itemIndex) => (
                                            <tr key={`${categoryIndex}-${itemIndex}`} className="hover:bg-gray-50 text-sm">
                                                {itemIndex === 0 && (
                                                    <td rowSpan={categoryItem.items.length} className="p-3 text-gray-800 font-semibold bg-gray-50 border-r border-gray-100">
                                                        {categoryItem.category}
                                                    </td>
                                                )}
                                                <td className="p-3 text-gray-600">{item.label}</td>
                                                <td className="p-3 font-mono text-blue-600 font-bold select-all cursor-pointer"
                                                    onClick={() => { navigator.clipboard.writeText(item.tag); alert('Copied!') }}
                                                    title="Click to copy"
                                                >
                                                    {item.tag}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <h4 className="font-bold text-yellow-800 text-sm mb-2">How to use format tags?</h4>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                        • For <strong>Images/QR Code</strong>: Use <code>&lt;%qr&gt;</code> exactly as shown (type it in your Word doc).<br />
                        • For <strong>Text</strong>: Copy the tags like <code>&lt;Serial No&gt;</code> and paste them into your Word document.<br />
                        • Make sure not to change the text inside the brackets.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DocumentSettings;
