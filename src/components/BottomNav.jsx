import React from 'react';
import { Scan, History, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="
            /* Mobile: Fixed Bottom Bar */
            fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40
            bg-white border-t border-gray-100 flex justify-around items-center p-2 pb-safe
            bg-opacity-95 backdrop-blur-lg
            
            /* Desktop: Left Sidebar (Inside Relative Container) */
            md:absolute md:top-0 md:bottom-0 md:left-0 md:w-64 md:flex-col md:justify-start
            md:border-t-0 md:border-r md:border-white/20 md:bg-white/50 md:p-6 md:gap-2
            md:items-stretch md:m-0 md:max-w-none md:rounded-l-3xl
        ">
            {/* Desktop Logo Area */}
            <div className="hidden md:flex items-center gap-3 px-4 py-4 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <Scan size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-gray-900 leading-tight">Dispatch</h1>
                    <p className="text-xs text-gray-500">Scanner Pro</p>
                </div>
            </div>

            <Link
                to="/"
                className={`flex flex-col md:flex-row md:gap-3 items-center p-2 md:px-4 md:py-3 rounded-xl transition-all ${currentPath === '/'
                    ? 'text-blue-600 bg-blue-50 md:bg-white/80 md:shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50 md:hover:bg-white/40'
                    }`}
            >
                <Scan size={24} className="md:w-5 md:h-5" strokeWidth={currentPath === '/' ? 2.5 : 2} />
                <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Scan</span>
            </Link>

            <Link
                to="/history"
                className={`flex flex-col md:flex-row md:gap-3 items-center p-2 md:px-4 md:py-3 rounded-xl transition-all ${currentPath === '/history'
                    ? 'text-blue-600 bg-blue-50 md:bg-white/80 md:shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50 md:hover:bg-white/40'
                    }`}
            >
                <History size={24} className="md:w-5 md:h-5" strokeWidth={currentPath === '/history' ? 2.5 : 2} />
                <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">History</span>
            </Link>

            <Link
                to="/settings"
                className={`flex flex-col md:flex-row md:gap-3 items-center p-2 md:px-4 md:py-3 rounded-xl transition-all ${currentPath === '/settings'
                    ? 'text-blue-600 bg-blue-50 md:bg-white/80 md:shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50 md:hover:bg-white/40'
                    }`}
            >
                <Settings size={24} className="md:w-5 md:h-5" strokeWidth={currentPath === '/settings' ? 2.5 : 2} />
                <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Settings</span>
            </Link>

            {/* Desktop Footer Info */}
            <div className="hidden md:flex flex-col mt-auto pt-6 border-t border-gray-200/50">
                <p className="text-xs text-gray-400 px-4">v1.2.0 • Online</p>
            </div>
        </div>
    );
};

export default BottomNav;
