/**
 * Budget Page
 * Allows users to set up and manage their monthly budget categories
 * Design matches app-wide patterns (light bg, gradient header, white cards)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Wallet, Banknote } from 'lucide-react';
import { useStore } from '../lib/store';
import { type BudgetCategory } from '../types';
import { formatCurrency } from '../lib/format';

export function BudgetPage() {
    const navigate = useNavigate();
    const budget = useStore((state) => state.budget);
    const updateBudgetCategory = useStore((state) => state.updateBudgetCategory);

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

    // Current month for display
    const currentMonth = new Date().toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });

    // Calculate counts
    const presetCategories = budget.categories.filter(c => c.isPreset);
    // const customCategories = budget.categories.filter(c => !c.isPreset);
    // const canAddMore = customCategories.length < MAX_CUSTOM_CATEGORIES;

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

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header - Gradient style matching other pages */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-4 sticky top-0 z-50">
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
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium text-white">
                        <Wallet size={14} />
                        <span>{currentMonth}</span>
                    </div>
                </div>

                {/* Total Budget Summary Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/70 mb-1">Total Monthly Budget</p>
                            <p className="text-2xl font-bold text-white">
                                {formatCurrency(budget.total)}
                            </p>
                            <p className="text-xs text-white/60 mt-1">
                                Sum of {budget.categories.length} categories
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Banknote size={32} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Preset Categories */}
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
                            />
                        ))}
                    </div>
                </div>

                {/* Budget Tip */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">💡 Budget Tip</p>
                    <p className="text-xs text-gray-500">
                        Set realistic limits based on your past spending. You can always adjust them later as you track your expenses.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Category Input Component - matches app-wide card styling
interface CategoryInputProps {
    category: BudgetCategory;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    isSaved?: boolean;
}

function CategoryInput({ category, value, onChange, onSave, isSaved }: CategoryInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasChanged = value !== (category.amount > 0 ? category.amount.toString() : '');

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{category.icon || '📁'}</span>
                <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                {isSaved && (
                    <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        ✓ Saved
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3">
                <div className={`flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 transition-colors ${isFocused ? 'border-blue-500 bg-white' : 'border-gray-200'
                    }`}>
                    <span className="text-gray-400 text-sm mr-2">RM</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base"
                    />
                </div>
                <button
                    onClick={onSave}
                    disabled={!hasChanged}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${hasChanged
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
