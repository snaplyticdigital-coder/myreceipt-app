import type { SpendingCategory } from '../types';

export const SPENDING_CATEGORY_LIST: SpendingCategory[] = [
    'Utilities',
    'Groceries',
    'Education',
    'Healthcare',
    'Transportation',
    'Dining & Food',
    'Shopping',
    'Entertainment',
    'Sports',
    'Lifestyle',
    'Others'
];

/**
 * Returns a copy of any string array sorted alphabetically.
 */
export function alphabeticalSort<T extends string>(list: T[]): T[] {
    return [...list].sort((a, b) => a.localeCompare(b));
}

export const SORTED_SPENDING_CATEGORIES = alphabeticalSort(SPENDING_CATEGORY_LIST);

// Unified Color Schema for Duitrack (Cyber-Luxe)
// Colors match both the Ring Chart (Analytics) and the Status Indicators
export const CATEGORY_COLORS: Record<SpendingCategory, { bg: string; text: string; ring: string }> = {
    'Utilities': { bg: 'bg-slate-500', text: 'text-slate-600', ring: '#64748b' },
    'Groceries': { bg: 'bg-emerald-500', text: 'text-emerald-600', ring: '#10b981' },
    'Education': { bg: 'bg-indigo-500', text: 'text-indigo-600', ring: '#6366f1' },
    'Healthcare': { bg: 'bg-rose-500', text: 'text-rose-600', ring: '#f43f5e' },
    'Transportation': { bg: 'bg-cyan-500', text: 'text-cyan-600', ring: '#06b6d4' },
    'Dining & Food': { bg: 'bg-orange-500', text: 'text-orange-600', ring: '#f97316' },
    'Shopping': { bg: 'bg-pink-500', text: 'text-pink-600', ring: '#ec4899' },
    'Entertainment': { bg: 'bg-purple-500', text: 'text-purple-600', ring: '#a855f7' },
    'Sports': { bg: 'bg-teal-500', text: 'text-teal-600', ring: '#14b8a6' },
    'Lifestyle': { bg: 'bg-blue-500', text: 'text-blue-600', ring: '#3b82f6' },
    'Others': { bg: 'bg-gray-400', text: 'text-gray-500', ring: '#9ca3af' }
};
