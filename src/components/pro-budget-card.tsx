import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { TrendingUp, TrendingDown, AlertCircle, Wallet, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProBudgetCardProps {
    isPrivacyMode?: boolean;
}

export function ProBudgetCard({ isPrivacyMode = false }: ProBudgetCardProps) {
    const { budget, getMonthTotal } = useStore();

    // Ensure accurate real-time data
    const spent = getMonthTotal();
    const total = budget.total;
    const percent = total > 0 ? (spent / total) * 100 : 0;
    const clampedPercent = Math.min(percent, 100);

    // EMPTY STATE: Show CTA when budget is not set (unified with Free tier)
    if (total === 0) {
        return (
            <Link
                to="/budget"
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 shadow-sm border border-blue-100 flex items-center gap-5 relative overflow-hidden group transition-all active:scale-[0.98]"
            >
                {/* Decorative blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl -mr-12 -mt-12" />

                {/* Icon */}
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0">
                    <Wallet size={28} className="text-white" strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monthly Budget</p>
                    <p className="text-base font-bold text-gray-800 mb-1">Set Up Your Budget</p>
                    <p className="text-xs text-gray-500">Track spending & hit your goals</p>
                </div>

                {/* Arrow */}
                <ChevronRight size={20} className="text-purple-500 group-hover:translate-x-1 transition-transform relative z-10" strokeWidth={2.5} />
            </Link>
        );
    }

    // Color Logic
    let color = 'text-blue-600';
    let pathColor = 'stroke-blue-600';
    let bgColor = 'bg-blue-50';

    if (percent >= 90) {
        color = 'text-red-500';
        pathColor = 'stroke-red-500';
        bgColor = 'bg-red-50';
    } else if (percent >= 80) {
        color = 'text-yellow-500';
        pathColor = 'stroke-yellow-500';
        bgColor = 'bg-yellow-50';
    }

    // Circular Progress Math
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedPercent / 100) * circumference;

    const mask = (val: string) => isPrivacyMode ? 'RM ****' : val;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-5">
            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 flex-shrink-0">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        className="stroke-gray-100"
                        strokeWidth="8"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        className={`${pathColor} transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold ${color}`}>
                        {percent.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Budget</h3>
                    <Link to="/budget" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Manage
                    </Link>
                </div>

                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xl font-bold text-gray-900 leading-none">
                        {mask(formatCurrency(spent))}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                        / {mask(formatCurrency(total))}
                    </span>
                </div>

                {/* Status Message */}
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
                    {percent >= 90 ? (
                        <>
                            <AlertCircle size={12} />
                            <span>Critical: Over budget!</span>
                        </>
                    ) : percent >= 80 ? (
                        <>
                            <TrendingUp size={12} />
                            <span>Careful: Approaching limit</span>
                        </>
                    ) : (
                        <>
                            <TrendingDown size={12} />
                            <span>On track: Good job!</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
