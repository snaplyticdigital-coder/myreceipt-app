import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, PenLine, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useStore } from '../../lib/store';
import { formatCurrency } from '../../lib/format';
import { format, lastDayOfMonth, isToday, addMonths } from 'date-fns';

interface MonthEndBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * MONTH-END PROACTIVE BUDGETING MODAL
 *
 * Triggers on the last day of every month to help users plan their next month's budget.
 *
 * Three Tiers:
 * - Tier A (Fresh Start): Input a brand new budget amount
 * - Tier B (Continuity): Keep the same budget with one tap
 * - Tier C (AI Suggestion): Smart suggestion based on actual spending
 *
 * AI Suggestion Math:
 * - If actual spend > current budget: New Budget = Actual + 5%
 * - If actual spend < current budget: New Budget = (Actual + Current) / 2
 */

// ============ HELPER FUNCTIONS ============

export function isLastDayOfMonth(): boolean {
    const today = new Date();
    const lastDay = lastDayOfMonth(today);
    return isToday(lastDay);
}

export function getNextMonthName(): string {
    const nextMonth = addMonths(new Date(), 1);
    return format(nextMonth, 'MMMM yyyy');
}

function calculateAISuggestion(actualSpend: number, currentBudget: number): {
    amount: number;
    isIncrease: boolean;
    reason: string;
} {
    if (currentBudget === 0) {
        // No budget set, suggest based on actual spend + 10% buffer
        return {
            amount: Math.round(actualSpend * 1.1),
            isIncrease: true,
            reason: 'Based on your spending + 10% buffer'
        };
    }

    if (actualSpend > currentBudget) {
        // Overspent: suggest Actual + 5%
        const suggested = Math.round(actualSpend * 1.05);
        return {
            amount: suggested,
            isIncrease: true,
            reason: 'You exceeded budget. Adding 5% buffer for flexibility.'
        };
    } else {
        // Underspent: suggest average of actual and current
        const suggested = Math.round((actualSpend + currentBudget) / 2);
        return {
            amount: suggested,
            isIncrease: false,
            reason: 'Great savings! Optimized based on your actual needs.'
        };
    }
}

// ============ MAIN COMPONENT ============

export function MonthEndBudgetModal({ isOpen, onClose }: MonthEndBudgetModalProps) {
    const { budget, getMonthTotal, updateBudget } = useStore();
    const [selectedTier, setSelectedTier] = useState<'fresh' | 'continue' | 'ai' | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const actualSpend = getMonthTotal();
    const currentBudget = budget.total;
    const aiSuggestion = calculateAISuggestion(actualSpend, currentBudget);
    const nextMonth = getNextMonthName();

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedTier(null);
            setCustomAmount('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        setIsSubmitting(true);

        let newTotal = 0;

        switch (selectedTier) {
            case 'fresh':
                newTotal = parseFloat(customAmount) || 0;
                break;
            case 'continue':
                newTotal = currentBudget;
                break;
            case 'ai':
                newTotal = aiSuggestion.amount;
                break;
        }

        if (newTotal > 0) {
            // Update budget with new total, keeping category ratios
            const ratio = currentBudget > 0 ? newTotal / currentBudget : 1;
            const updatedCategories = budget.categories.map(cat => ({
                ...cat,
                amount: currentBudget > 0 ? Math.round(cat.amount * ratio) : Math.round(newTotal / budget.categories.length)
            }));

            updateBudget({
                ...budget,
                month: format(addMonths(new Date(), 1), 'yyyy-MM'),
                total: newTotal,
                categories: updatedCategories,
                isSetup: true
            });
        }

        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
        }, 500);
    };

    const canConfirm = selectedTier === 'continue' || selectedTier === 'ai' || (selectedTier === 'fresh' && parseFloat(customAmount) > 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-center overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-28 h-28 bg-purple-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Icon & Title */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3 transform -rotate-3">
                            <Calendar className="text-white drop-shadow-md" size={28} strokeWidth={2} />
                        </div>
                        <h2 className="text-xl font-black text-white mb-1 tracking-tight">
                            Next Month Plan
                        </h2>
                        <p className="text-blue-100 text-sm">
                            Set your budget for {nextMonth}
                        </p>
                    </div>
                </div>

                <div className="p-5">
                    {/* Current Month Summary */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">This Month's Summary</p>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500">Actual Spend</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(actualSpend)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Budget</p>
                                <p className="text-lg font-bold text-gray-900">{currentBudget > 0 ? formatCurrency(currentBudget) : 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3-Tier Options */}
                    <div className="space-y-3 mb-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Choose Your Plan</p>

                        {/* Tier A: Fresh Start */}
                        <button
                            onClick={() => setSelectedTier('fresh')}
                            className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                                selectedTier === 'fresh'
                                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 ring-offset-2'
                                    : 'border-gray-200 bg-white hover:border-purple-200'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    selectedTier === 'fresh' ? 'bg-purple-600' : 'bg-gray-100'
                                }`}>
                                    <PenLine size={18} className={selectedTier === 'fresh' ? 'text-white' : 'text-gray-500'} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800">Fresh Start</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Set a brand new budget amount</p>
                                </div>
                            </div>
                            {selectedTier === 'fresh' && (
                                <div className="mt-3 pt-3 border-t border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">RM</span>
                                        <input
                                            type="number"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="flex-1 text-base font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}
                        </button>

                        {/* Tier B: Continuity */}
                        {currentBudget > 0 && (
                            <button
                                onClick={() => setSelectedTier('continue')}
                                className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                                    selectedTier === 'continue'
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                                        : 'border-gray-200 bg-white hover:border-blue-200'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        selectedTier === 'continue' ? 'bg-blue-600' : 'bg-gray-100'
                                    }`}>
                                        <RefreshCw size={18} className={selectedTier === 'continue' ? 'text-white' : 'text-gray-500'} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-800">Keep Same Budget</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Continue with your current budget</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-bold text-blue-600">{formatCurrency(currentBudget)}</p>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Tier C: AI Suggestion */}
                        <button
                            onClick={() => setSelectedTier('ai')}
                            className={`w-full p-4 rounded-2xl text-left transition-all border-2 relative overflow-hidden ${
                                selectedTier === 'ai'
                                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 ring-offset-2'
                                    : 'border-gray-200 bg-white hover:border-amber-200'
                            }`}
                        >
                            {/* AI Badge */}
                            <div className="absolute -top-0 -right-0 bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-bl-xl uppercase tracking-wide">
                                AI Powered
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    selectedTier === 'ai' ? 'bg-amber-500' : 'bg-gray-100'
                                }`}>
                                    <Sparkles size={18} className={selectedTier === 'ai' ? 'text-white' : 'text-gray-500'} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800">Duitrack Suggestion</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{aiSuggestion.reason}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-bold text-amber-600">{formatCurrency(aiSuggestion.amount)}</p>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-medium ${aiSuggestion.isIncrease ? 'text-amber-600' : 'text-green-600'}`}>
                                        {aiSuggestion.isIncrease ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        <span>{aiSuggestion.isIncrease ? 'Increase' : 'Optimized'}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isSubmitting}
                        className={`w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                            canConfirm && !isSubmitting
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-200 active:scale-[0.98]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Setting Budget...</span>
                            </>
                        ) : (
                            <span>Confirm {nextMonth} Budget</span>
                        )}
                    </button>

                    {/* Skip Option */}
                    <button
                        onClick={onClose}
                        className="w-full mt-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        I'll do this later
                    </button>
                </div>
            </div>
        </div>
    );
}
