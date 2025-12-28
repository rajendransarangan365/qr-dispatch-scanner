import React from 'react';
import { Search, ArrowUpDown, Filter } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange, onSortToggle, sortOrder }) => {
    return (
        <div className="sticky top-0 bg-gray-50 pt-2 pb-4 px-1 z-30">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search vehicle, material..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <button
                    onClick={onSortToggle}
                    className={`p-3 bg-white border border-gray-200 rounded-xl shadow-sm active:bg-gray-50 flex items-center justify-center transition-colors ${sortOrder === 'asc' ? 'text-blue-600 border-blue-200' : 'text-gray-500'}`}
                >
                    <ArrowUpDown size={18} />
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
