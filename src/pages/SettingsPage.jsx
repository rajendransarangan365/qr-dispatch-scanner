import React from 'react';
import SettingsPanel from '../components/SettingsPanel';

const SettingsPage = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 overflow-y-auto">
            <SettingsPanel />
        </div>
    );
};

export default SettingsPage;
