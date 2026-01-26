import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
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
