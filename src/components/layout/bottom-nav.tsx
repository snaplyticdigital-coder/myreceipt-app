import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, PieChart, FileText, Camera, Upload, PenLine } from 'lucide-react';
import { NAV_COLORS } from '../../lib/design-tokens';

// Import nav icon for proper Vite bundling
import duitrackNavIcon from '/duitrack-nav-icon.png';

interface BottomNavProps {
    onAddClick: (mode?: 'scan' | 'import' | 'manual') => void;
}

/**
 * Custom Duitrack Icon Component
 * Uses CSS filters to colorize the white icon for gray/purple states
 * Supports the liquid fill animation effect
 */
const DuitrackIcon = ({ size = 24, color = "currentColor", className = "" }: {
    size?: number;
    strokeWidth?: number;
    color?: string;
    className?: string;
}) => {
    const isActive = color === NAV_COLORS.active;

    // CSS filters to colorize white icon
    // Gray-400 (#9CA3AF) for inactive
    const grayFilter = 'brightness(0) saturate(100%) invert(70%) sepia(5%) saturate(400%) hue-rotate(180deg) brightness(95%) contrast(90%)';
    // Purple-600 (#7c3aed) for active
    const purpleFilter = 'brightness(0) saturate(100%) invert(29%) sepia(98%) saturate(2000%) hue-rotate(250deg) brightness(95%) contrast(100%)';

    return (
        <img
            src={duitrackNavIcon}
            alt=""
            className={className}
            style={{
                width: size,
                height: size,
                objectFit: 'contain',
                filter: isActive ? purpleFilter : grayFilter,
                transition: 'filter 350ms ease-out',
            }}
        />
    );
};

const NAV_ITEMS = [
    { label: 'Duitrack', icon: DuitrackIcon, to: '/' },
    { label: 'Analytics', icon: PieChart, to: '/analytics' },
    { label: 'Tax', icon: FileText, to: '/tax-relief' },
    { label: 'Search', icon: Search, to: '/search' },
];

export function BottomNav({ onAddClick }: BottomNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGiggling, setIsGiggling] = useState(false);
    const ACTIVE_COLOR = NAV_COLORS.active;
    const INACTIVE_COLOR = NAV_COLORS.inactive;

    const triggerHaptic = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // Light impact
        }
    };

    const handleAction = (mode: 'scan' | 'import' | 'manual') => {
        onAddClick(mode);
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsGiggling(true);
        setTimeout(() => setIsGiggling(false), 400);
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
                <div className="relative w-full pointer-events-auto">

                    {/* --- 1. SUB-ACTION STACK --- */}
                    {/* Lowered by 6px from previous 28px -> 22px */}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out ${isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-10 invisible"
                            }`}
                        style={{ bottom: "calc(38px + 70px + env(safe-area-inset-bottom))" }}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => handleAction('manual')}
                                className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform"
                            >
                                <span className="text-sm font-semibold text-gray-700">Manual</span>
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <PenLine size={16} />
                                </div>
                            </button>

                            <button
                                onClick={() => handleAction('import')}
                                className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform delay-75"
                            >
                                <span className="text-sm font-semibold text-gray-700">Import</span>
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Upload size={16} />
                                </div>
                            </button>

                            <button
                                onClick={() => handleAction('scan')}
                                className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform delay-100"
                            >
                                <span className="text-sm font-semibold text-gray-700">Scan</span>
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Camera size={16} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* --- 2. FAB (Docked Geometry) --- */}
                    {/* Positioned deeper in the notch for the 'BigPay' docked effect */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 z-50"
                        style={{ bottom: "calc(32px + env(safe-area-inset-bottom))" }}
                    >
                        <button
                            onClick={toggleMenu}
                            className={`
                                w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-200 
                                transition-all duration-300 active:scale-95
                                ${isOpen ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-600 to-purple-600'}
                                ${isGiggling ? 'animate-giggle' : ''}
                            `}
                        >
                            {isOpen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18" />
                                    <path d="M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                    <rect width="10" height="8" x="7" y="8" rx="1" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* --- 3. BIGPAY-STYLE GEOMETRIC NAV BAR --- */}
                    <div className="relative nav-ambient-shadow">
                        <svg
                            viewBox="0 0 375 64"
                            className="w-full h-[64px] block"
                            preserveAspectRatio="none"
                            style={{
                                backdropFilter: 'blur(25px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                                backgroundColor: 'transparent'
                            }}
                        >
                            {/* 
                                CONTINUOUS BEZIER CURVE GEOMETRY:
                                M: Start at top left
                                L: Line to start of transition (140)
                                C: Cubic Bezier entry (Continuous slope)
                                C: Concave dip (Circular feel but Bezier math)
                                C: Cubic Bezier exit (Continuous slope)
                                L: Line to top right
                            */}
                            <path
                                d="M 0 0
                                   L 142 0
                                   C 158 0, 162 -2, 165 6
                                   C 175 24, 200 24, 210 6
                                   C 213 -2, 217 0, 233 0
                                   L 375 0
                                   V 64
                                   H 0
                                   Z"
                                fill="rgba(255, 255, 255, 0.9)"
                            />
                        </svg>

                        {/* Safe Area Extension (Frosted) */}
                        <div className="h-[env(safe-area-inset-bottom)] w-full glass-effect" />
                    </div>

                    {/* --- 4. NAVIGATION ICONS (Liquid Flow) --- */}
                    <div className="absolute bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
                        <div className="h-16 flex items-center px-1">

                            {/* Left Group */}
                            <div className="flex-1 flex justify-around items-center pl-2 pr-6">
                                {NAV_ITEMS.slice(0, 2).map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className="flex flex-col items-center group w-14"
                                        onClick={() => {
                                            triggerHaptic();
                                            setIsOpen(false);
                                        }}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className="relative w-6 h-6 mb-2">
                                                    {/* Layer 1: Base Grey Outline (Always visible as background, or 'replaced'?) 
                                                        Prompt: "icon's grey outline must be 'replaced' by... fluid liquid-filling motion"
                                                        This means the grey one should disappear? No, usually liquid fill means filling UP the stroke.
                                                        If we leave grey behind, it looks like filling a container.
                                                        If we remove grey, the grey part disappears as purple appears.
                                                        Let's keep grey static behind. It looks better and 'replaced' metaphor works visually.
                                                    */}
                                                    <item.icon
                                                        size={24}
                                                        color={INACTIVE_COLOR}
                                                        strokeWidth={1.5}
                                                        className="absolute inset-0"
                                                    />

                                                    {/* Layer 2: Active Purple (Clipped Animation) */}
                                                    <item.icon
                                                        size={24}
                                                        color={ACTIVE_COLOR}
                                                        strokeWidth={2}
                                                        className={`absolute inset-0 ${isActive ? 'nav-icon-liquid-fill' : 'opacity-0'}`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-xs font-medium transition-colors duration-350 ${isActive ? 'text-purple-600' : 'text-gray-400'}`}
                                                >
                                                    {item.label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>

                            {/* Center Spacer */}
                            <div className="w-16 flex-shrink-0" />

                            {/* Right Group */}
                            <div className="flex-1 flex justify-around items-center pl-6 pr-2">
                                {NAV_ITEMS.slice(2, 4).map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className="flex flex-col items-center group w-14"
                                        onClick={() => {
                                            triggerHaptic();
                                            setIsOpen(false);
                                        }}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className="relative w-6 h-6 mb-2">
                                                    <item.icon
                                                        size={24}
                                                        color={INACTIVE_COLOR}
                                                        strokeWidth={1.5}
                                                        className="absolute inset-0"
                                                    />
                                                    <item.icon
                                                        size={24}
                                                        color={ACTIVE_COLOR}
                                                        strokeWidth={2}
                                                        className={`absolute inset-0 ${isActive ? 'nav-icon-liquid-fill' : 'opacity-0'}`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-xs font-medium transition-colors duration-350 ${isActive ? 'text-purple-600' : 'text-gray-400'}`}
                                                >
                                                    {item.label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}