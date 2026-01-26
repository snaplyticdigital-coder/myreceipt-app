import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { TrendingUp, Wallet, Star, ChevronRight, Zap, Receipt, Lock, Crown } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import {
    getEmptyStateMessage,
    getLiveDataMessage,
    resetSessionIndices,
    type LiveDataContext,
} from '../lib/copilot-randomization';
import { getTopTaxInsight, type TaxInsight } from '../lib/lhdn-logic';

// ============ FREEMIUM TAX MARKETING TEASERS ============

const TAX_MARKETING_TEASERS = [
    {
        message: "Did you know our app can help to utilize your LHDN tax relief? Unlock Pro to see how!",
        emoji: "💡",
    },
    {
        message: "Upload your receipt and let Duitrack tolong kira the tax for you. Don't miss out on refunds!",
        emoji: "🧾",
    },
    {
        message: "Eh boss, want to get the max LHDN refund? Upgrade now to unlock the Tax Expert!",
        emoji: "💰",
    },
    {
        message: "Your tax relief untapped lah! Go Pro to see exactly how much you can claim this year!",
        emoji: "📊",
    },
    {
        message: "LHDN got RM2,500 Lifestyle relief waiting for you. Upgrade to track it automatically!",
        emoji: "🎯",
    },
];

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

// ============ FREEMIUM TAX LOCK CARD (Marketing Hook) ============

interface FreemiumTaxCardProps {
    teaser: { message: string; emoji: string };
}

function FreemiumTaxCard({ teaser }: FreemiumTaxCardProps) {
    return (
        <div className="block p-4 rounded-3xl glass-surface glass-glow-teal relative overflow-hidden premium-card-shadow">
            {/* Lock Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/5 to-teal-800/10 rounded-3xl z-0" />

            {/* Subtle Lock Pattern */}
            <div className="absolute top-2 right-2 z-10">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                    <Lock size={12} className="text-teal-600" />
                </div>
            </div>

            <div className="flex items-start gap-3.5 relative z-10">
                <div className="shrink-0 p-2.5 bg-teal-50/90 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 relative">
                    <Receipt size={18} className="text-teal-500 opacity-60" />
                    {/* Mini Lock Badge */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                        <Crown size={8} className="text-white" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 leading-none text-gray-400">
                        Jimat Tax Sini
                    </h3>
                    <p className="text-sm font-semibold leading-snug text-gray-700">
                        {teaser.emoji} {teaser.message}
                    </p>
                </div>
            </div>

            {/* Go Pro Button */}
            <div className="mt-3 relative z-10">
                <Link
                    to="/profile"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wide shadow-md hover:from-blue-600 hover:to-purple-700 active:scale-[0.98] transition-all"
                >
                    <Crown size={14} />
                    <span>Unlock Pro</span>
                </Link>
            </div>
        </div>
    );
}

// ============ MAIN CO-PILOT SECTION ============

export function CoPilotSection() {
    const { budget, getMonthTotal, receipts, points, user } = useStore();
    const budgetUsed = getMonthTotal();

    // Check if user has any transactions (dual-state logic)
    const hasTransactions = receipts.length > 0;

    // Freemium check - FREE users see marketing teasers instead of real tax insights
    const isFreeTier = user.tier === 'FREE';

    // State for randomized messages
    const [cardMessages, setCardMessages] = useState<{
        unlockPerk: CardMessage;
        spendingShift: CardMessage;
        dailyRunway: CardMessage;
    } | null>(null);

    // Randomized marketing teaser for FREE users (changes on each render/session)
    const [marketingTeaser] = useState(() => {
        const randomIndex = Math.floor(Math.random() * TAX_MARKETING_TEASERS.length);
        return TAX_MARKETING_TEASERS[randomIndex];
    });

    // Tax insight for "Jimat Tax Sini" feature (PRO users only)
    const taxInsight = useMemo((): TaxInsight | null => {
        // Don't calculate for FREE users - they see marketing instead
        if (isFreeTier || !hasTransactions) return null;
        return getTopTaxInsight(receipts);
    }, [receipts, hasTransactions, isFreeTier]);

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
        <div className="space-y-4">
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

                {/* Card 4: Jimat Tax Sini - Freemium Split Logic */}
                {isFreeTier ? (
                    // FREE TIER: Show marketing teaser with lock overlay
                    <FreemiumTaxCard teaser={marketingTeaser} />
                ) : (
                    // PRO TIER: Show real tax insights (only when has transactions)
                    taxInsight && (
                        <CoPilotCard
                            type="budget"
                            title="Jimat Tax Sini"
                            message={taxInsight.suggestion}
                            emoji={taxInsight.emoji}
                            icon={<Receipt size={18} className="text-teal-500" />}
                            glowClass="glass-glow-teal"
                            iconBgClass="bg-teal-50/90"
                            href="/tax-relief"
                            isGhostMode={false}
                        />
                    )
                )}
            </div>
        </div>
    );
}
