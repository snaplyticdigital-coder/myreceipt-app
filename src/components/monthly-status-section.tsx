import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { AlertTriangle, PlayCircle, Wallet, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ProBudgetCard } from './pro-budget-card';


interface MonthlyStatusSectionProps {
    isPrivacyMode?: boolean;
}

export function MonthlyStatusSection({ isPrivacyMode = false }: MonthlyStatusSectionProps) {
    const { user, getMonthTotal, budget } = useStore();
    const currentSpend = getMonthTotal();
    const budgetTotal = budget.total || 1; // Avoid div/0

    // Helper to mask values
    const mask = (val: string) => isPrivacyMode ? 'RM ****' : val;

    // PRO MEMBER: Show Full Width Budget Card
    if (user.tier === 'PRO') {
        return <ProBudgetCard isPrivacyMode={isPrivacyMode} />;
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

    // Check if budget is not set
    const isBudgetNotSet = budget.total === 0;

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Widget 1: Monthly Budget - Unified Styling */}
            {isBudgetNotSet ? (
                // Empty State: Budget Setup CTA
                <Link
                    to="/budget"
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-4 shadow-sm border border-blue-100 flex flex-col justify-between h-32 relative overflow-hidden group transition-all active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full blur-2xl -mr-8 -mt-8" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                <Wallet size={14} className="text-white" strokeWidth={2} />
                            </div>
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Budget</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">Set Up Monthly Budget</span>
                            <ChevronRight size={16} className="text-purple-500 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                        </div>
                    </div>
                </Link>
            ) : (
                // Normal State: Budget Progress
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl -mr-8 -mt-8" />
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Budget</p>
                        <p className="text-xl font-extrabold text-gray-900 mt-1 tracking-tight">
                            {mask(formatCurrency(currentSpend))}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                            / {mask(formatCurrency(budgetTotal))}
                        </p>
                    </div>

                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2 relative z-10">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${budgetColor}`}
                            style={{ width: `${budgetPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Widget 2: Free Scans - Unified Metric Layout */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col h-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

                {/* Header + Unified Metric */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Free Scans</p>
                        {isLimitReached && <AlertTriangle size={12} className="text-amber-500 animate-pulse" />}
                    </div>

                    {/* Unified Metric: "10 Left until 26 Feb" */}
                    <p className="leading-tight">
                        <span className="text-xl font-bold text-gray-900">{transactionsLeft}</span>
                        <span className="text-sm font-medium text-gray-500"> Left until {formattedResetDate}</span>
                    </p>
                </div>

                {/* 10-Dash Progress Pill - Shifted up 12dp */}
                <div className="flex gap-1 justify-start w-full relative z-10 mt-3">
                    {Array.from({ length: 10 }).map((_, i) => {
                        const isUsed = i < usage;
                        return (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isUsed
                                    ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                                    : 'bg-gray-100'
                                    }`}
                            />
                        );
                    })}
                </div>

                {/* Ad Reward Button - 16dp safety gap via mt-4 */}
                <div className="mt-auto pt-4 relative z-10">
                    <button
                        onClick={() => !isAdCooldownActive && useStore.getState().watchAd()}
                        disabled={isAdCooldownActive}
                        className={`flex flex-col items-center justify-center w-full py-2 rounded-xl text-white shadow-md active:scale-95 transition-all ${isAdCooldownActive
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-purple-200'
                            }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <PlayCircle size={14} strokeWidth={2.5} className="text-white" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {isAdCooldownActive ? 'Cooldown' : 'Watch Ad (+3)'}
                            </span>
                        </div>
                        {isAdCooldownActive && (
                            <span className="text-[10px] font-semibold opacity-90 leading-none mt-0.5">
                                Refills {remainingDays}d {displayHours}h
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
