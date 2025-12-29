import React from 'react';
import { Scan, History, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center p-2 pb-safe bg-opacity-90 backdrop-blur-lg z-40">
            <Link
                to="/"
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentPath === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
            >
                <Scan size={24} strokeWidth={currentPath === '/' ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1">Scan</span>
            </Link>

            <Link
                to="/history"
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentPath === '/history' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
            >
                <History size={24} strokeWidth={currentPath === '/history' ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1">History</span>
            </Link>

            <Link
                to="/settings"
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentPath === '/settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
            >
                <Settings size={24} strokeWidth={currentPath === '/settings' ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1">Settings</span>
            </Link>
        </div>
    );
};

export default BottomNav;
