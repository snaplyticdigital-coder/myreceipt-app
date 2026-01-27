/**
 * Budget Page
 * Allows users to set up and manage their monthly budget categories
 * Features: Transaction-aware progress bars, historical month switching, smooth scrolling
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Save, Banknote, Calendar, Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { type BudgetCategory, type Receipt } from '../types';
import { formatCurrency } from '../lib/format';

// Helper to get month start/end dates
function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

// Helper to calculate spending by budget category for a given month
function calculateSpendingByBudgetCategory(
    receipts: Receipt[],
    startDate: Date,
    endDate: Date
): Record<string, number> {
    const spending: Record<string, number> = {};

    // Map spending categories to budget categories
    const categoryMapping: Record<string, string> = {
        'Dining & Food': 'food-beverage',
        'Groceries': 'food-beverage',
        'Transportation': 'fuel',
        'Utilities': 'bills',
        'Healthcare': 'bills',
        'Entertainment': 'food-beverage',
        'Shopping': 'food-beverage',
        'Education': 'bills',
        'Sports': 'food-beverage',
        'Lifestyle': 'food-beverage',
        'Others': 'food-beverage',
    };

    receipts
        .filter(r => {
            const date = new Date(r.date);
            return date >= startDate && date <= endDate;
        })
        .forEach(r => {
            const budgetCategoryId = categoryMapping[r.spendingCategory] || 'food-beverage';
            spending[budgetCategoryId] = (spending[budgetCategoryId] || 0) + r.amount;
        });

    return spending;
}

// Generate list of months for the dropdown (past 12 months)
function generateMonthOptions(): { label: string; year: number; month: number }[] {
    const options: { label: string; year: number; month: number }[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        options.push({
            label: date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' }),
            year: date.getFullYear(),
            month: date.getMonth(),
        });
    }

    return options;
}

export function BudgetPage() {
    const navigate = useNavigate();
    const budget = useStore((state) => state.budget);
    const receipts = useStore((state) => state.receipts);
    const updateBudgetCategory = useStore((state) => state.updateBudgetCategory);

    // State for selected month
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

    // State for category inputs - sync when budget changes
    const [categoryAmounts, setCategoryAmounts] = useState<Record<string, string>>({});

    // Initialize/sync categoryAmounts when budget changes
    useEffect(() => {
        const newAmounts: Record<string, string> = {};
        budget.categories.forEach(cat => {
            newAmounts[cat.id] = cat.amount > 0 ? cat.amount.toString() : '';
        });
        setCategoryAmounts(newAmounts);
    }, [budget.categories]);

    // State for saved confirmation
    const [savedCategories, setSavedCategories] = useState<Set<string>>(new Set());

    // Month options for dropdown
    const monthOptions = useMemo(() => generateMonthOptions(), []);

    // Selected month label
    const selectedMonthLabel = useMemo(() => {
        const date = new Date(selectedMonth.year, selectedMonth.month, 1);
        return date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
    }, [selectedMonth]);

    // Calculate spending for selected month
    const monthlySpending = useMemo(() => {
        const { start, end } = getMonthDateRange(selectedMonth.year, selectedMonth.month);
        return calculateSpendingByBudgetCategory(receipts, start, end);
    }, [receipts, selectedMonth]);

    // Calculate total actual spending for the month
    const totalActualSpending = useMemo(() => {
        return Object.values(monthlySpending).reduce((sum, val) => sum + val, 0);
    }, [monthlySpending]);

    // Check if viewing current month
    const isCurrentMonth = useMemo(() => {
        const now = new Date();
        return selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth();
    }, [selectedMonth]);

    // Calculate counts
    const presetCategories = budget.categories.filter(c => c.isPreset);

    // Handle amount change
    const handleAmountChange = (categoryId: string, value: string) => {
        // Only allow numbers and decimal points
        if (value && !/^\d*\.?\d*$/.test(value)) return;

        setCategoryAmounts(prev => ({
            ...prev,
            [categoryId]: value,
        }));
        // Clear saved state when editing
        setSavedCategories(prev => {
            const next = new Set(prev);
            next.delete(categoryId);
            return next;
        });
    };

    // Save category amount
    const handleSave = (categoryId: string) => {
        const amount = parseFloat(categoryAmounts[categoryId] || '0');
        updateBudgetCategory(categoryId, amount);
        setSavedCategories(prev => new Set([...prev, categoryId]));
        // Clear saved indicator after 2s
        setTimeout(() => {
            setSavedCategories(prev => {
                const next = new Set(prev);
                next.delete(categoryId);
                return next;
            });
        }, 2000);
    };

    // Handle month selection
    const handleMonthSelect = (year: number, month: number) => {
        setSelectedMonth({ year, month });
        setIsMonthPickerOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header - NON-STICKY, scrolls with content */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-4">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 active:bg-white/20 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">Budget Settings</h1>
                        <p className="text-xs text-white/80">Set your monthly spending limits</p>
                    </div>

                    {/* Month Switcher Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium text-white transition-colors"
                        >
                            <Calendar size={14} />
                            <span>{selectedMonthLabel}</span>
                            <ChevronDown size={14} className={`transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMonthPickerOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsMonthPickerOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-64 overflow-y-auto">
                                    {monthOptions.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleMonthSelect(option.year, option.month)}
                                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                                                selectedMonth.year === option.year && selectedMonth.month === option.month
                                                    ? 'bg-purple-50 text-purple-600 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{option.label}</span>
                                            {selectedMonth.year === option.year && selectedMonth.month === option.month && (
                                                <Check size={16} className="text-purple-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Total Budget Summary Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/70 mb-2">Total Monthly Budget</p>
                            <p className="text-2xl font-bold text-white">
                                {formatCurrency(budget.total)}
                            </p>
                            <p className="text-[12px] font-normal text-white/60 mt-2">
                                Sum of {budget.categories.length} categories
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Banknote size={32} className="text-white" />
                        </div>
                    </div>

                    {/* Total Spending Progress */}
                    <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-white/70">Actual Spending</span>
                            <span className="text-xs font-semibold text-white">
                                {formatCurrency(totalActualSpending)} / {formatCurrency(budget.total)}
                            </span>
                        </div>
                        <TotalProgressBar spent={totalActualSpending} budget={budget.total} />
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Historical Month Notice */}
                {!isCurrentMonth && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                        <Calendar size={16} className="text-amber-600" />
                        <p className="text-xs text-amber-700">
                            Viewing historical data for <span className="font-semibold">{selectedMonthLabel}</span>
                        </p>
                    </div>
                )}

                {/* Categories */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">Categories</h3>
                    <div className="space-y-3">
                        {presetCategories.map(category => (
                            <CategoryInput
                                key={category.id}
                                category={category}
                                value={categoryAmounts[category.id] || ''}
                                onChange={(value) => handleAmountChange(category.id, value)}
                                onSave={() => handleSave(category.id)}
                                isSaved={savedCategories.has(category.id)}
                                actualSpending={monthlySpending[category.id] || 0}
                                isEditable={isCurrentMonth}
                            />
                        ))}
                    </div>
                </div>

                {/* Budget Tip */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Budget Tip</p>
                    <p className="text-xs text-gray-500">
                        Set realistic limits based on your past spending. You can always adjust them later as you track your expenses.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Total Progress Bar Component
function TotalProgressBar({ spent, budget }: { spent: number; budget: number }) {
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const isOverBudget = spent > budget;
    const overPercentage = budget > 0 ? Math.min((spent / budget) * 100, 150) : 0;

    return (
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                        ? 'bg-gradient-to-r from-rose-400 to-red-500'
                        : 'bg-gradient-to-r from-blue-400 to-purple-400'
                }`}
                style={{ width: `${isOverBudget ? Math.min(overPercentage, 100) : percentage}%` }}
            />
        </div>
    );
}

// Category Input Component with Progress Bar
interface CategoryInputProps {
    category: BudgetCategory;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    isSaved?: boolean;
    actualSpending: number;
    isEditable: boolean;
}

function CategoryInput({ category, value, onChange, onSave, isSaved, actualSpending, isEditable }: CategoryInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasChanged = value !== (category.amount > 0 ? category.amount.toString() : '');

    // Calculate progress percentage
    const budgetAmount = category.amount || 0;
    const percentage = budgetAmount > 0 ? (actualSpending / budgetAmount) * 100 : 0;
    const isOverBudget = actualSpending > budgetAmount && budgetAmount > 0;
    const cappedPercentage = Math.min(percentage, 100);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            {/* Category Header with Icon */}
            <div className="flex items-center gap-3 mb-3">
                {/* 40x40dp Icon Container */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">{category.icon || '📁'}</span>
                </div>
                <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                    {/* Progress Bar - Transaction Aware */}
                    {budgetAmount > 0 && (
                        <div className="mt-1.5">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        isOverBudget
                                            ? 'bg-gradient-to-r from-rose-400 to-red-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                                            : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_0_6px_rgba(59,130,246,0.3)]'
                                    }`}
                                    style={{ width: `${cappedPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {isSaved && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Saved
                    </span>
                )}
            </div>

            {/* Spending Summary */}
            {budgetAmount > 0 && (
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs text-gray-500">
                        Spent: <span className={`font-medium ${isOverBudget ? 'text-rose-600' : 'text-gray-700'}`}>
                            {formatCurrency(actualSpending)}
                        </span>
                    </span>
                    <span className={`text-xs font-medium ${
                        isOverBudget ? 'text-rose-600' : percentage > 85 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                        {percentage.toFixed(0)}%
                        {isOverBudget && ' (Over Budget!)'}
                    </span>
                </div>
            )}

            {/* Input Row */}
            <div className="flex items-center gap-3">
                <div className={`flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 transition-colors ${
                    isFocused ? 'border-blue-500 bg-white' : 'border-gray-200'
                } ${!isEditable ? 'opacity-60' : ''}`}>
                    <span className="text-gray-400 text-sm mr-2">RM</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="0.00"
                        disabled={!isEditable}
                        className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base disabled:cursor-not-allowed"
                    />
                </div>
                <button
                    onClick={onSave}
                    disabled={!hasChanged || !isEditable}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        hasChanged && isEditable
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md active:scale-95'
                            : 'bg-gray-100 text-gray-400'
                    }`}
                >
                    <Save size={20} />
                </button>
            </div>
        </div>
    );
}
