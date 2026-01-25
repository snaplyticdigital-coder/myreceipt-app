import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { AlertTriangle, PlayCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ProBudgetCard } from './pro-budget-card';


export function MonthlyStatusSection() {
    const { user, getMonthTotal, budget } = useStore();
    const currentSpend = getMonthTotal();
    const budgetTotal = budget.total || 1; // Avoid div/0

    // PRO MEMBER: Show Full Width Budget Card
    if (user.tier === 'PRO') {
        return <ProBudgetCard />;
    }

    // FREE MEMBER: Original Grid Layout
    // Budget Progress
    const budgetPercentage = Math.min((currentSpend / budgetTotal) * 100, 100);
    const isBudgetExceeded = currentSpend > budgetTotal;
    const budgetColor = isBudgetExceeded ? 'bg-red-500' : budgetPercentage > 85 ? 'bg-orange-500' : 'bg-blue-600';

    // Transaction Logic
    const transactionsLeft = user.scansRemaining ?? 10;
    const usage = Math.max(0, 10 - transactionsLeft);
    const isLimitReached = transactionsLeft <= 0;
    const nextReset = user.nextResetDate ? new Date(user.nextResetDate) : new Date();
    const formattedResetDate = format(nextReset, 'd MMM');

    // Ad Cooldown Logic
    const lastAdWatch = user.lastAdWatch ? new Date(user.lastAdWatch) : null;
    const now = new Date();
    const cooldownPeriodArr = 48 * 60 * 60 * 1000; // 48 hours in ms
    const timeSinceLastAd = lastAdWatch ? now.getTime() - lastAdWatch.getTime() : Infinity;
    const isAdCooldownActive = timeSinceLastAd < cooldownPeriodArr;

    const remainingMs = lastAdWatch ? (lastAdWatch.getTime() + cooldownPeriodArr) - now.getTime() : 0;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingDays = Math.floor(remainingHours / 24);
    const displayHours = remainingHours % 24;

    // Tooltip Logic
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    useEffect(() => {
        if (isAdCooldownActive && lastAdWatch) {
            const dismissedKey = `ad_tooltip_dismissed_${lastAdWatch.getTime()}`;
            const dismissed = localStorage.getItem(dismissedKey);
            if (!dismissed) {
                // Show after a small delay for attention
                const timer = setTimeout(() => setIsTooltipVisible(true), 500);
                return () => clearTimeout(timer);
            }
        } else {
            setIsTooltipVisible(false);
        }
    }, [isAdCooldownActive, lastAdWatch]);

    const dismissTooltip = () => {
        if (lastAdWatch) {
            const dismissedKey = `ad_tooltip_dismissed_${lastAdWatch.getTime()}`;
            localStorage.setItem(dismissedKey, 'true');
            setIsTooltipVisible(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Widget 1: Monthly Budget */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="relative z-10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monthly Budget</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-0.5 tracking-tight">
                        {formatCurrency(currentSpend)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                        / {formatCurrency(budgetTotal)}
                    </p>
                </div>

                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2 relative z-10">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${budgetColor}`}
                        style={{ width: `${budgetPercentage}%` }}
                    />
                </div>
            </div>

            {/* Widget 2: Free Transactions & Ad Rewards */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50/50 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Free Scans</p>
                        {isLimitReached && <AlertTriangle size={12} className="text-amber-500 animate-pulse" />}
                    </div>

                    <p className="text-base font-black text-gray-900 leading-none">
                        {transactionsLeft} <span className="text-[10px] font-bold text-gray-400 uppercase">left</span>
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                        Resets {formattedResetDate}
                    </p>
                </div>

                {/* 10-Dash Visual System */}
                <div className="flex flex-wrap gap-1 mt-2.5 justify-start w-full relative z-10">
                    {Array.from({ length: 10 }).map((_, i) => {
                        const isUsed = i < usage;
                        return (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${isUsed
                                    ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' // Glow for used
                                    : 'bg-gray-100'
                                    }`}
                            />
                        );
                    })}
                </div>

                {/* Ad Reward Button */}
                <div className="mt-auto pt-2 relative z-10">
                    {/* Upsell Tooltip */}
                    {isAdCooldownActive && isTooltipVisible && (
                        <div className="absolute bottom-full left-0 right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300 z-20">
                            <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-transparent bg-clip-padding relative">
                                {/* Gradient Border Hack */}
                                <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-blue-500 to-purple-500 -z-10" />

                                {/* Arrow */}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-purple-200 rotate-45" />

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-bold text-gray-900">Tak sabar tunggu? 😤</h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dismissTooltip();
                                            }}
                                            className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-600 leading-tight mb-2">
                                        Upgrade to Pro for unlimited scans weh. No need to wait-wait already.
                                    </p>
                                    <Link
                                        to="/profile"
                                        className="block w-full text-center py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-[10px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                                    >
                                        See Pro Benefits →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => !isAdCooldownActive && useStore.getState().watchAd()}
                        disabled={isAdCooldownActive}
                        className={`flex flex-col items-center justify-center w-full py-1.5 rounded-lg text-white shadow-md active:scale-95 transition-all ${isAdCooldownActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                            }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <PlayCircle size={12} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-wider">
                                {isAdCooldownActive ? 'Cooldown' : 'Watch Ad (+3)'}
                            </span>
                        </div>
                        {isAdCooldownActive && (
                            <span className="text-[8px] font-extrabold opacity-90 leading-none mt-0.5">
                                Refills {remainingDays}d {displayHours}h
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
