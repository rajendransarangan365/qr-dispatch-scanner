import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const Calendar = ({ startDate, endDate, onRangeSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date(startDate || new Date()));
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [hoverDate, setHoverDate] = useState(null);

    // Derived state for the month grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Helper to format date consistent with state strings
    const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const handleMouseDown = (dateStr) => {
        setIsDragging(true);
        setDragStart(dateStr);
        setHoverDate(dateStr); // Initialize hover for single-click case
        onRangeSelect(dateStr, dateStr); // Update preview immediately
    };

    const handleMouseEnter = (dateStr) => {
        if (!isDragging) return;
        setHoverDate(dateStr);
    };

    // Global mouse up to catch drags ending outside cells
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                // If we have a valid range in progress, commit it
                if (dragStart && hoverDate) {
                    let start = dragStart;
                    let end = hoverDate;
                    if (new Date(start) > new Date(end)) {
                        [start, end] = [end, start];
                    }
                    onRangeSelect(start, end);
                }
                setHoverDate(null);
                setDragStart(null); // Clean up
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging, dragStart, hoverDate, onRangeSelect]);

    // Determine visual state of a day
    const getDayState = (dateStr) => {
        // Effective range is either (startDate, endDate) OR (dragStart, hoverDate) if dragging
        let s = startDate;
        let e = endDate;

        if (isDragging && dragStart && hoverDate) {
            s = dragStart;
            e = hoverDate;
            if (new Date(s) > new Date(e)) [s, e] = [e, s];
        }

        if (!s || !e) return { isSelected: false, isRange: false, isStart: false, isEnd: false };

        const d = new Date(dateStr);
        const start = new Date(s);
        const end = new Date(e);

        // Normalize time
        d.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (d.getTime() === start.getTime() && d.getTime() === end.getTime())
            return { isSelected: true, isRange: false, isStart: true, isEnd: true, single: true };

        if (d.getTime() === start.getTime()) return { isSelected: true, isRange: false, isStart: true, isEnd: false };
        if (d.getTime() === end.getTime()) return { isSelected: true, isRange: false, isStart: false, isEnd: true };
        if (d > start && d < end) return { isSelected: false, isRange: true, isStart: false, isEnd: false };

        return { isSelected: false };
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden select-none" onMouseLeave={() => setIsDragging(false)}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl text-gray-500 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-500" />
                    {monthName} {year}
                </h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl text-gray-500 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Grid */}
            <div className="p-4">
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400 uppercase py-2">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                    {/* Empty slots */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = formatDate(year, month, day);
                        const { isSelected, isRange, isStart, isEnd, single } = getDayState(dateStr);
                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                        return (
                            <div
                                key={day}
                                onMouseDown={() => handleMouseDown(dateStr)}
                                onMouseEnter={() => handleMouseEnter(dateStr)}
                                className={`
                                    h-10 flex items-center justify-center cursor-pointer transition-all duration-200 relative
                                    ${isRange ? 'bg-blue-100' : ''}
                                    ${isStart && !single ? 'bg-blue-600 text-white rounded-l-xl shadow-md z-10 animate-pop' : ''}
                                    ${isEnd && !single ? 'bg-blue-600 text-white rounded-r-xl shadow-md z-10 animate-pop' : ''}
                                    ${single ? 'bg-blue-600 text-white rounded-xl shadow-md z-10 animate-pop' : ''}
                                    ${!isSelected && !isRange ? 'hover:bg-gray-100 rounded-xl hover:scale-105 active:scale-95' : ''}
                                    ${isToday && !isSelected && !isRange ? 'text-blue-600 font-bold bg-blue-50' : ''}
                                `}
                            >
                                <span className={`text-sm ${isSelected || isRange ? 'font-bold' : ''}`}>
                                    {day}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-3 text-center text-xs text-gray-400">
                    Click and drag to select a date range
                </div>
            </div>
        </div>
    );
};

export default Calendar;
