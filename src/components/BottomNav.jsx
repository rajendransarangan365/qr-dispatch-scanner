import React from 'react';
import { Camera, History } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-safe flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <button
                onClick={() => onTabChange('scan')}
                className={`flex flex-col items-center p-2 transition-colors duration-200 ${activeTab === 'scan' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <div className={`p-2 rounded-2xl mb-1 ${activeTab === 'scan' ? 'bg-blue-50' : 'bg-transparent'}`}>
                    <Camera size={24} strokeWidth={activeTab === 'scan' ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium tracking-wide">Scan</span>
            </button>

            <button
                onClick={() => onTabChange('history')}
                className={`flex flex-col items-center p-2 transition-colors duration-200 ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <div className={`p-2 rounded-2xl mb-1 ${activeTab === 'history' ? 'bg-blue-50' : 'bg-transparent'}`}>
                    <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium tracking-wide">History</span>
            </button>
        </div>
    );
};

export default BottomNav;
