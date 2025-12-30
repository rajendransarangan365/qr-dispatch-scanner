import React from 'react';
import { Search, ArrowUpDown, Filter } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange, onSortToggle, sortOrder, startDate, endDate, onDateChange, hideDates = false }) => {
    const [showFilters, setShowFilters] = React.useState(false);

    return (
        <div className="sticky top-0 bg-gray-50 pt-2 pb-4 px-1 z-30 shadow-sm">
            <div className="flex gap-2 mb-2">
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
                {!hideDates && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 border border-gray-200 rounded-xl shadow-sm active:bg-gray-50 flex items-center justify-center transition-colors ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500'}`}
                    >
                        <Filter size={18} />
                    </button>
                )}
            </div>

            {showFilters && !hideDates && (
                <div className="bg-white p-3 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-1">
                    <div className="flex gap-2 items-center text-xs text-gray-500 mb-1">
                        <span className="font-semibold">Filter by Date:</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                            value={startDate}
                            onChange={(e) => onDateChange('start', e.target.value)}
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="date"
                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                            value={endDate}
                            onChange={(e) => onDateChange('end', e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
