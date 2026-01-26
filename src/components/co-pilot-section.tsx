import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { TrendingUp, Wallet, Star, ChevronRight, Zap, Upload, Sparkles } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import {
    getEmptyStateMessage,
    getLiveDataMessage,
    resetSessionIndices,
    type LiveDataContext,
} from '../lib/copilot-randomization';

// ============ TYPE DEFINITIONS ============

interface CoPilotCardProps {
    type: 'progress' | 'habit' | 'budget';
    title: string;
    message: string;
    emoji: string;
    icon: React.ReactNode;
    glowClass: string;
    iconBgClass: string;
    href: string;
    isGhostMode?: boolean;
}

interface CardMessage {
    template: string;
    emoji: string;
}

// ============ CO-PILOT CARD COMPONENT ============

function CoPilotCard({
    title,
    message,
    emoji,
    icon,
    glowClass,
    iconBgClass,
    href,
    isGhostMode = false,
}: CoPilotCardProps) {
    return (
        <Link
            to={href}
            className={`block p-4 rounded-3xl glass-surface ${glowClass} transition-all active:scale-[0.97] group relative overflow-hidden premium-card-shadow`}
        >
            {/* Subtle Gradient Glow */}
            <div
                className={`absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${iconBgClass.replace('bg-', 'from-').replace('/90', '')} to-transparent blur-2xl`}
            />

            {/* Ghost Mode Overlay for Empty State */}
            {isGhostMode && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-[1px] rounded-3xl z-0" />
            )}

            <div className="flex items-start gap-3.5 relative z-10">
                <div
                    className={`shrink-0 p-2.5 ${iconBgClass} backdrop-blur-md rounded-2xl shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300 ${isGhostMode ? 'opacity-60' : ''}`}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3
                        className={`text-xs font-black uppercase tracking-widest mb-2 leading-none ${isGhostMode ? 'text-gray-400/70' : 'text-gray-400'}`}
                    >
                        {title}
                    </h3>
                    <p
                        className={`text-sm font-semibold leading-snug ${isGhostMode ? 'text-gray-600/70' : 'text-gray-800'}`}
                    >
                        {emoji} {message}
                    </p>
                </div>
                <div
                    className={`shrink-0 self-center group-hover:translate-x-0.5 transition-all ${isGhostMode ? 'opacity-20' : 'opacity-40 group-hover:opacity-80'}`}
                >
                    <ChevronRight size={18} className="text-gray-400" />
                </div>
            </div>
        </Link>
    );
}

// ============ EMPTY STATE CTA COMPONENT ============

function CoPilotEmptyCTA() {
    const [ctaMessage, setCtaMessage] = useState<CardMessage | null>(null);

    useEffect(() => {
        // Get a random encouragement message on mount
        const message = getEmptyStateMessage('unlock_perk');
        setCtaMessage(message);
    }, []);

    return (
        <Link
            to="/add-receipt"
            className="block p-5 rounded-3xl glass-surface glass-glow-purple transition-all active:scale-[0.98] group relative overflow-hidden"
        >
            {/* Ghost Placeholder Illustration */}
            <div className="absolute top-4 right-4 opacity-10">
                <Sparkles size={64} className="text-purple-500" />
            </div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 p-3 bg-gradient-to-br from-purple-500 to-indigo-600 backdrop-blur-md rounded-2xl shadow-lg shadow-purple-200">
                    <Upload size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">
                        {ctaMessage?.emoji || '📱'} {ctaMessage?.template || "Hey boss, upload your transaction now!"}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        I need to <span className="font-semibold text-purple-600">kenal</span> your habit better before I can give solid advice lah.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                        <span>Upload First Receipt</span>
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ============ MAIN CO-PILOT SECTION ============

export function CoPilotSection() {
    const { budget, getMonthTotal, receipts, points } = useStore();
    const budgetUsed = getMonthTotal();

    // Check if user has any transactions (dual-state logic)
    const hasTransactions = receipts.length > 0;

    // State for randomized messages
    const [cardMessages, setCardMessages] = useState<{
        unlockPerk: CardMessage;
        spendingShift: CardMessage;
        dailyRunway: CardMessage;
    } | null>(null);

    // Calculate live data context
    const liveContext = useMemo((): LiveDataContext => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysRemaining = lastDay.getDate() - now.getDate();
        const budgetRemaining = Math.max(0, budget.total - budgetUsed);
        const dailyAllowance = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;

        // Calculate spending shift (comparing this month vs last month)
        const thisMonthReceipts = receipts.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthReceipts = receipts.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
        });

        // Category spending comparison
        const categorySpending: Record<string, { current: number; last: number }> = {};

        thisMonthReceipts.forEach(r => {
            const cat = r.spendingCategory || r.merchantCategory || 'Others';
            if (!categorySpending[cat]) categorySpending[cat] = { current: 0, last: 0 };
            categorySpending[cat].current += r.amount;
        });

        lastMonthReceipts.forEach(r => {
            const cat = r.spendingCategory || r.merchantCategory || 'Others';
            if (!categorySpending[cat]) categorySpending[cat] = { current: 0, last: 0 };
            categorySpending[cat].last += r.amount;
        });

        // Find biggest shift category
        let topCategory = 'Dining';
        let savedAmount = 0;
        let overspentAmount = 0;
        let percentChange = 0;

        Object.entries(categorySpending).forEach(([cat, data]) => {
            const diff = data.last - data.current;
            if (diff > savedAmount) {
                topCategory = cat;
                savedAmount = diff;
                percentChange = data.last > 0 ? Math.round((diff / data.last) * 100) : 0;
            }
            if (diff < 0 && Math.abs(diff) > overspentAmount) {
                overspentAmount = Math.abs(diff);
            }
        });

        // Calculate achievements progress
        const receiptsToGoal = Math.max(0, 10 - receipts.length);
        const xpToNextLevel = 100 - (points % 100);
        const currentStreak = receipts.length > 0 ? Math.min(receipts.length, 7) : 0; // Simplified

        return {
            // Unlock Perk context
            receiptsToGoal,
            goalName: 'Super Saver',
            currentStreak,
            badgeName: 'Budget Boss',
            xpToNextLevel,

            // Spending Shift context
            savedAmount: Math.abs(savedAmount),
            overspentAmount,
            topCategory,
            percentChange: Math.abs(percentChange),
            comparisonPeriod: 'month',

            // Daily Runway context
            dailyAllowance,
            daysRemaining,
            budgetRemaining,
            projectedSavings: dailyAllowance > 50 ? budgetRemaining * 0.1 : 0,
        };
    }, [receipts, budget, budgetUsed, points]);

    // Generate randomized messages on mount and refresh
    useEffect(() => {
        // Reset indices on component mount (simulates app launch / dashboard refresh)
        resetSessionIndices();

        if (hasTransactions) {
            // Live data mode - use real context
            setCardMessages({
                unlockPerk: getLiveDataMessage('unlock_perk', liveContext),
                spendingShift: getLiveDataMessage('spending_shift', liveContext),
                dailyRunway: getLiveDataMessage('daily_runway', liveContext),
            });
        } else {
            // Empty state mode - encouragement copy with ghost styling
            setCardMessages({
                unlockPerk: getEmptyStateMessage('unlock_perk'),
                spendingShift: getEmptyStateMessage('spending_shift'),
                dailyRunway: getEmptyStateMessage('daily_runway'),
            });
        }
    }, [hasTransactions, liveContext]);

    // Don't render until messages are ready
    if (!cardMessages) return null;

    return (
        <div className="space-y-4 px-1">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200">
                        <Zap size={16} className="text-white" fill="currentColor" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800 tracking-tight">Financial Co-Pilot</h2>
                </div>
                <div className="px-2 py-0.5 bg-purple-100 rounded-md">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-tighter">
                        {hasTransactions ? 'AI Analysis' : 'Waiting for Data'}
                    </span>
                </div>
            </div>

            {/* Cards Grid - Always visible, style changes based on state */}
            <div className="grid grid-cols-1 gap-3.5">
                {/* Card 1: Unlock Perk / Progress Nudge */}
                <CoPilotCard
                    type="progress"
                    title="Unlock Perk"
                    message={cardMessages.unlockPerk.template}
                    emoji={cardMessages.unlockPerk.emoji}
                    icon={<Star size={18} className={`text-amber-500 ${!hasTransactions ? 'opacity-60' : ''}`} fill="currentColor" />}
                    glowClass={hasTransactions ? "glass-glow-amber" : "glass-glow-amber/50"}
                    iconBgClass="bg-amber-50/90"
                    href={hasTransactions ? "/achievements" : "/add-receipt"}
                    isGhostMode={!hasTransactions}
                />

                {/* Card 2: Spending Shift / Habit */}
                <CoPilotCard
                    type="habit"
                    title="Spending Shift"
                    message={cardMessages.spendingShift.template}
                    emoji={cardMessages.spendingShift.emoji}
                    icon={<TrendingUp size={18} className={`text-emerald-500 ${!hasTransactions ? 'opacity-60' : ''}`} />}
                    glowClass={hasTransactions ? "glass-glow-emerald" : "glass-glow-emerald/50"}
                    iconBgClass="bg-emerald-50/90"
                    href={hasTransactions ? "/analytics" : "/add-receipt"}
                    isGhostMode={!hasTransactions}
                />

                {/* Card 3: Daily Runway / Budget Guide */}
                <CoPilotCard
                    type="budget"
                    title="Daily Runway"
                    message={cardMessages.dailyRunway.template}
                    emoji={cardMessages.dailyRunway.emoji}
                    icon={<Wallet size={18} className={`text-blue-500 ${!hasTransactions ? 'opacity-60' : ''}`} />}
                    glowClass={hasTransactions ? "glass-glow-blue" : "glass-glow-blue/50"}
                    iconBgClass="bg-blue-50/90"
                    href={hasTransactions ? "/budget" : "/add-receipt"}
                    isGhostMode={!hasTransactions}
                />
            </div>

            {/* Additional CTA for empty state */}
            {!hasTransactions && (
                <div className="mt-2">
                    <CoPilotEmptyCTA />
                </div>
            )}
        </div>
    );
}
