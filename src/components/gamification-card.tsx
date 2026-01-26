import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { ChevronRight } from 'lucide-react';
import { TIER_COLORS } from '../lib/design-tokens';

// Strict Tier Definitions using Design Tokens
const TIERS = [
    {
        name: 'Bronze Member',
        icon: '🥉',
        color: `bg-gradient-to-r ${TIER_COLORS.bronze.bg}`,
        minPoints: 0
    },
    {
        name: 'Silver Member',
        icon: '🥈',
        color: `bg-gradient-to-r ${TIER_COLORS.silver.bg}`,
        minPoints: 500
    },
    {
        name: 'Gold Member',
        icon: '🥇',
        color: `bg-gradient-to-r ${TIER_COLORS.gold.bg}`,
        minPoints: 2500
    },
    {
        name: 'Diamond Member',
        icon: '💎',
        color: `bg-gradient-to-r ${TIER_COLORS.diamond.bg}`,
        minPoints: 7500
    },
];

export function GamificationCard() {
    const { points } = useStore();

    // Find current tier
    const currentTierIndex = TIERS.findIndex((t, i) =>
        points >= t.minPoints && (i === TIERS.length - 1 || points < TIERS[i + 1].minPoints)
    );
    const currentTier = TIERS[currentTierIndex];
    const nextTier = TIERS[currentTierIndex + 1];

    // Progress
    const tierProgress = nextTier
        ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
        : 100;

    return (
        <Link to="/achievements" className="block w-full">
            {/* Strict Visual Replication */}
            <div className={`w-full ${currentTier.color} rounded-2xl px-5 py-3 shadow-md flex items-center justify-between relative overflow-hidden transition-all active:scale-[0.98]`}>

                {/* Left Section: Icon + Text/Progress */}
                <div className="flex items-center gap-3">
                    {/* Icon (Medal/Diamond) */}
                    <div className="text-2xl filter drop-shadow-md">
                        {currentTier.icon}
                    </div>

                    {/* Middle Section: Label + Progress Bar */}
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-white uppercase tracking-wide drop-shadow-sm leading-none">
                            {currentTier.name}
                        </span>

                        {/* Dark Semi-Transparent Progress Bar directly under text */}
                        <div className="w-32 h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/40 rounded-full"
                                style={{ width: `${tierProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section: Points + Chevron */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white drop-shadow-sm tabular-nums">
                        {points.toLocaleString()} pts
                    </span>
                    <ChevronRight size={18} className="text-white opacity-80" />
                </div>
            </div>
        </Link>
    );
}
