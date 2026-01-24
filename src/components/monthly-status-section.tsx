import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { AlertTriangle, Scan, Zap, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface MonthlyStatusSectionProps {
    onLimitReachedClick: () => void;
}

export function MonthlyStatusSection({ onLimitReachedClick }: MonthlyStatusSectionProps) {
    const { user, getMonthTotal, budget } = useStore();
    const currentSpend = getMonthTotal();
    const budgetTotal = budget.total || 1; // Avoid div/0

    // Budget Progress
    const budgetPercentage = Math.min((currentSpend / budgetTotal) * 100, 100);
    const isBudgetExceeded = currentSpend > budgetTotal;
    const budgetColor = isBudgetExceeded ? 'bg-red-500' : budgetPercentage > 85 ? 'bg-orange-500' : 'bg-blue-600';

    // Transaction Logic
    // "Usage" from user perspective is 10 - remaining.
    // If user has 10 remaining, usage is 0. 
    // If user has 3 remaining, usage is 7.
    const transactionsLeft = user.scansRemaining ?? 10;
    const usage = Math.max(0, 10 - transactionsLeft);
    const isLimitReached = transactionsLeft <= 0;
    const nextReset = user.nextResetDate ? new Date(user.nextResetDate) : new Date();
    // Default to 1st of next month if logic fails but store should handle it
    const formattedResetDate = format(nextReset, 'd MMM');

    // Smart CTA Logic
    // Usage < 5 (Remaining > 5) -> Scan Now (Primary)
    // Usage >= 5 (Remaining <= 5) -> Go Pro (Gold) or Watch Ad (if limit reached)
    const showScanNow = usage < 5;
    const showGoPro = usage >= 5 && !isLimitReached;
    const showWatchAd = isLimitReached;

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Widget 1: Monthly Budget */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monthly Budget</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-0.5 tracking-tight">
                        {formatCurrency(currentSpend)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                        / {formatCurrency(budgetTotal)}
                    </p>
                </div>

                {/* Circular or Horizontal Progress - Choosing Horizontal for fit */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${budgetColor}`}
                        style={{ width: `${budgetPercentage}%` }}
                    />
                </div>
            </div>

            {/* Widget 2: Free Transactions (10-Dot System) */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Free Transactions</p>
                        {isLimitReached && <AlertTriangle size={12} className="text-amber-500 animate-pulse" />}
                    </div>

                    <p className="text-sm font-bold text-gray-900 leading-none">
                        {transactionsLeft} <span className="text-xs font-medium text-gray-500">left</span>
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                        Resets {formattedResetDate}
                    </p>
                </div>

                {/* 10-Dash Visual System */}
                <div className="flex flex-wrap gap-1 mt-3 justify-start w-full">
                    {Array.from({ length: 10 }).map((_, i) => {
                        const isUsed = i < usage;
                        return (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all ${isUsed
                                        ? 'bg-purple-500' // Used = Purple (Filled)
                                        : 'bg-gray-200' // Available = Gray (Empty)
                                    }`}
                            />
                        );
                    })}
                </div>

                {/* Smart CTA */}
                <div className="mt-auto pt-2">
                    {showScanNow && (
                        <Link to="/scan" className="flex items-center justify-center gap-1 w-full py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-xs font-bold shadow-sm active:scale-95 transition-transform">
                            <Scan size={12} /> Scan Now
                        </Link>
                    )}

                    {showGoPro && (
                        <button onClick={() => { }} className="flex items-center justify-center gap-1 w-full py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg text-white text-xs font-bold shadow-sm active:scale-95 transition-transform text-shadow-sm">
                            <Zap size={12} fill="currentColor" /> Go Pro
                        </button>
                    )}

                    {showWatchAd && (
                        <button onClick={onLimitReachedClick} className="flex items-center justify-center gap-1 w-full py-1.5 bg-gray-900 rounded-lg text-white text-xs font-bold shadow-sm active:scale-95 transition-transform">
                            <PlayCircle size={12} /> Watch Ad (+3)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
