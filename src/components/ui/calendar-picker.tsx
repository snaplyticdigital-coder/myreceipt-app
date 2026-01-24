import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
    isOpen: boolean;
    onClose: () => void;
    value: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    anchorRef: React.RefObject<HTMLElement | null>;
    maxDate?: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarPicker({
    isOpen,
    onClose,
    value,
    onChange,
    anchorRef,
    maxDate = new Date()
}: CalendarPickerProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; width: number; direction: 'down' | 'up' }>({
        top: 0,
        left: 0,
        width: 280,
        direction: 'down'
    });

    // Parse initial date from value
    const initialDate = value ? new Date(value) : new Date();
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

    // Haptic feedback helper
    const triggerHaptic = useCallback(() => {
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
    }, []);

    // Calculate position based on anchor element
    useEffect(() => {
        if (isOpen && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const menuHeight = 340; // Approximate calendar height
            const spaceBelow = viewportHeight - rect.bottom;

            const direction = spaceBelow < menuHeight && rect.top > menuHeight ? 'up' : 'down';

            setPosition({
                top: direction === 'down' ? rect.bottom + 8 : rect.top - menuHeight - 8,
                left: rect.left,
                width: Math.max(rect.width, 280),
                direction
            });

            // Reset view to selected date's month/year
            if (value) {
                const d = new Date(value);
                setViewMonth(d.getMonth());
                setViewYear(d.getFullYear());
            }
        }
    }, [isOpen, anchorRef, value]);

    // Handle click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 10);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    // Get days in month
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday)
    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Check if date is in the future
    const isFutureDate = (day: number, month: number, year: number) => {
        const date = new Date(year, month, day);
        const today = new Date(maxDate);
        today.setHours(23, 59, 59, 999);
        return date > today;
    };

    // Check if date is selected
    const isSelected = (day: number, month: number, year: number) => {
        if (!selectedDate) return false;
        return selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;
    };

    // Check if date is today
    const isToday = (day: number, month: number, year: number) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
    };

    // Handle date selection
    const handleSelectDate = (day: number) => {
        if (isFutureDate(day, viewMonth, viewYear)) return;

        triggerHaptic();
        const newDate = new Date(viewYear, viewMonth, day);
        setSelectedDate(newDate);

        // Format as YYYY-MM-DD for internal storage
        const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(formatted);
        onClose();
    };

    // Navigate months
    const goToPrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    // Generate calendar grid
    const renderCalendarGrid = () => {
        const daysInMonth = getDaysInMonth(viewMonth, viewYear);
        const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
        const days: React.ReactNode[] = [];

        // Empty cells for days before first of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-9" />);
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const isFuture = isFutureDate(day, viewMonth, viewYear);
            const selected = isSelected(day, viewMonth, viewYear);
            const today = isToday(day, viewMonth, viewYear);

            days.push(
                <button
                    key={day}
                    type="button"
                    disabled={isFuture}
                    onClick={() => handleSelectDate(day)}
                    className={`
                        h-9 w-9 rounded-full text-sm font-medium
                        flex items-center justify-center
                        transition-all duration-150
                        ${isFuture
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-gray-100 active:scale-95'
                        }
                        ${selected
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : ''
                        }
                        ${today && !selected
                            ? 'border-2 border-purple-300 text-purple-600'
                            : ''
                        }
                        ${!isFuture && !selected && !today
                            ? 'text-gray-700'
                            : ''
                        }
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className={`
                fixed z-[200] bg-white rounded-xl shadow-xl border border-gray-100
                overflow-hidden
                transition-all duration-200 ease-out
                origin-top
            `}
            style={{
                top: position.top,
                left: position.left,
                width: position.width,
            }}
        >
            {/* Header: Month/Year + Navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button
                    type="button"
                    onClick={goToPrevMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <span className="text-sm font-bold text-gray-800">
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                    type="button"
                    onClick={goToNextMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight size={18} className="text-gray-600" />
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-0 px-3 py-2 border-b border-gray-100">
                {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-0 px-3 py-2">
                {renderCalendarGrid()}
            </div>
        </div>
    );
}
