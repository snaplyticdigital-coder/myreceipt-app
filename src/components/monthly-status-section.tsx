import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { AlertTriangle, Scan, Zap, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';


export function MonthlyStatusSection() {
    const { user, getMonthTotal, budget } = useStore();
    const currentSpend = getMonthTotal();
    const budgetTotal = budget.total || 1; // Avoid div/0

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
    const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    // Smart CTA Logic
    const showScanNow = usage < 5;
    const showGoPro = usage >= 5 && !isLimitReached;
    const showWatchAd = isLimitReached;

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

            {/* Widget 2: Free Transactions (10-Dot System) */}
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

                {/* Smart CTA */}
                <div className="mt-auto pt-2 relative z-10">
                    {showScanNow && (
                        <Link to="/scan" className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-[10px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all">
                            <Scan size={12} strokeWidth={3} /> Scan Now
                        </Link>
                    )}

                    {showGoPro && (
                        <button onClick={() => { }} className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg text-white text-[10px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all">
                            <Zap size={12} fill="currentColor" strokeWidth={3} /> Go Pro
                        </button>
                    )}

                    {showWatchAd && (
                        <button
                            onClick={() => !isAdCooldownActive && useStore.getState().watchAd()}
                            disabled={isAdCooldownActive}
                            className={`flex flex-col items-center justify-center w-full py-1 rounded-lg text-white shadow-md active:scale-95 transition-all ${isAdCooldownActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-1.5">
                                <PlayCircle size={12} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                    {isAdCooldownActive ? 'Cooldown' : 'Watch Ad (+3)'}
                                </span>
                            </div>
                            {isAdCooldownActive && (
                                <span className="text-[8px] font-bold opacity-80 leading-none">
                                    Retry in {remainingHours}h {remainingMins}m
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
