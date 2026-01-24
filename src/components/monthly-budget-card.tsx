/**
 * MonthlyBudgetCard - Displays monthly budget progress on homepage
 * Matches the design with circular progress indicator
 * Shows CTA if user has no budget set
 */
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Target } from 'lucide-react';

export function MonthlyBudgetCard() {
    const { budget, getMonthTotal } = useStore();

    const monthSpent = getMonthTotal();
    const budgetTotal = budget.total || 0;
    const hasBudget = budgetTotal > 0;

    // If no budget set, show CTA
    if (!hasBudget) {
        return (
            <Link
                to="/budget"
                className="block bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100 active:scale-[0.98] transition-transform"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Target size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">Set Monthly Budget</p>
                        <p className="text-sm text-gray-500">Track your spending against your goals</p>
                    </div>
                    <div className="text-blue-600 font-medium text-sm">Set up →</div>
                </div>
            </Link>
        );
    }

    const percentUsed = Math.min((monthSpent / budgetTotal) * 100, 100);

    // Calculate SVG circle properties
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentUsed / 100) * circumference;

    // Determine color based on usage
    const getProgressColor = () => {
        if (percentUsed >= 100) return '#ef4444'; // red-500
        if (percentUsed >= 80) return '#f59e0b';  // amber-500
        return '#3b82f6'; // blue-500
    };

    return (
        <Link
            to="/budget"
            className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
        >
            <div className="flex items-center gap-4">
                {/* Circular Progress */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                        {/* Background circle */}
                        <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="4"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            fill="none"
                            stroke={getProgressColor()}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500"
                        />
                    </svg>
                    {/* Percentage text */}
                    <span className="absolute text-xs font-bold text-gray-700">
                        {Math.round(percentUsed)}%
                    </span>
                </div>

                {/* Budget Info */}
                <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-0.5">Monthly Budget</p>
                    <p className="text-lg font-bold text-gray-900">
                        RM {monthSpent.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm font-normal text-gray-400">
                            {' '}/ RM {budgetTotal.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </p>
                </div>
            </div>
        </Link>
    );
}
