import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Database, ChevronLeft } from 'lucide-react';
import SettingsPanel from '../components/SettingsPanel';
import DriverManager from '../components/settings/DriverManager';
import ListManager from '../components/settings/ListManager';
import QRFieldManager from '../components/settings/QRFieldManager';
import { QrCode } from 'lucide-react';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Application Settings', icon: Settings },
        { id: 'drivers', label: 'Driver Management', icon: Users },
        { id: 'qr', label: 'QR Mapping', icon: QrCode },
        { id: 'masters', label: 'Master Lists', icon: Database },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
            <div className="w-full flex flex-col h-full">
                {/* Tab Navigation */}
                <div className="bg-white border-b sticky top-0 z-10 px-4 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                    </div>
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 pb-3 px-1 border-b-2 transition-all whitespace-nowrap
                                        ${isActive
                                            ? 'border-blue-600 text-blue-600 font-bold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium'}
                                    `}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                    <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                        {activeTab === 'general' && (
                            <SettingsPanel />
                        )}

                        {activeTab === 'drivers' && (
                            <DriverManager />
                        )}

                        {activeTab === 'qr' && (
                            <QRFieldManager />
                        )}

                        {activeTab === 'masters' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ListManager
                                    title="Vehicle Types"
                                    settingKey="vehicleTypes"
                                    placeholder="e.g. Tipper, Lorry"
                                />
                                <ListManager
                                    title="Land Types"
                                    settingKey="landTypes"
                                    placeholder="e.g. Patta Land"
                                />
                                <ListManager
                                    title="Mineral Classifications"
                                    settingKey="mineralTypes"
                                    placeholder="e.g. Rough Stone"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
