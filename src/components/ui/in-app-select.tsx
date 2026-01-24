import { useEffect, useRef, useState, useCallback } from 'react';
import { Check } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface PopoverSelectProps {
    isOpen: boolean;
    onClose: () => void;
    options: SelectOption[];
    value: string;
    onSelect: (value: string) => void;
    anchorRef: React.RefObject<HTMLElement | null>;
    showIcons?: boolean;
}

export function PopoverSelect({
    isOpen,
    onClose,
    options,
    value,
    onSelect,
    anchorRef,
    showIcons = false
}: PopoverSelectProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; width: number; direction: 'down' | 'up' }>({
        top: 0,
        left: 0,
        width: 200,
        direction: 'down'
    });
    const [isAnimating, setIsAnimating] = useState(false);

    // Haptic feedback helper
    const triggerHaptic = useCallback((type: 'light' | 'selection') => {
        if ('vibrate' in navigator) {
            navigator.vibrate(type === 'light' ? 10 : 5);
        }
    }, []);

    // Calculate position based on anchor element
    useEffect(() => {
        if (isOpen && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const menuHeight = Math.min(options.length * 48 + 16, 300); // Estimate menu height

            // Determine direction: flip if not enough space below
            const direction = spaceBelow < menuHeight && rect.top > menuHeight ? 'up' : 'down';

            setPosition({
                top: direction === 'down' ? rect.bottom + 8 : rect.top - menuHeight - 8,
                left: rect.left,
                width: rect.width,
                direction
            });

            setIsAnimating(true);
            triggerHaptic('light');
        }
    }, [isOpen, anchorRef, options.length, triggerHaptic]);

    // Handle selection
    const handleSelect = (optionValue: string) => {
        triggerHaptic('selection');
        onSelect(optionValue);
        onClose();
    };

    // Handle click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        // Add listener with slight delay to prevent immediate close
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 10);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className={`
                fixed z-[200] bg-white rounded-xl shadow-xl border border-gray-100
                overflow-hidden
                transition-all duration-200 ease-out
                ${isAnimating
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }
                ${position.direction === 'up' ? 'origin-bottom' : 'origin-top'}
            `}
            style={{
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: '300px',
            }}
            onAnimationEnd={() => setIsAnimating(true)}
        >
            <div className="overflow-y-auto max-h-[300px] py-1">
                {options.map((option, index) => {
                    const isSelected = option.value === value;
                    const isLast = index === options.length - 1;

                    return (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`
                                w-full flex items-center justify-between px-4 min-h-[44px]
                                transition-colors duration-100
                                ${isSelected
                                    ? 'bg-blue-50'
                                    : 'hover:bg-gray-50 active:bg-gray-100'
                                }
                                ${!isLast ? 'border-b border-gray-100' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {showIcons && option.icon && (
                                    <span className="text-gray-500">{option.icon}</span>
                                )}
                                <span className={`text-sm ${isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                                    {option.label}
                                </span>
                            </div>
                            {isSelected && (
                                <Check size={18} className="text-blue-600" strokeWidth={2.5} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Legacy Bottom Sheet component - kept for backwards compatibility
export { PopoverSelect as InAppSelect };
