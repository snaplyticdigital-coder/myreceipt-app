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

// ============================================
// UNIFIED COLOR SCHEMA (Cyber-Luxe Duitrack)
// Single Source of Truth for all category colors
// ============================================

export interface CategoryColorConfig {
    // Tailwind class names
    bg: string;           // Background class (e.g., 'bg-emerald-500')
    text: string;         // Text class (e.g., 'text-emerald-600')
    gradient: string;     // Tailwind gradient (e.g., 'from-emerald-400 to-emerald-600')
    // Hex values for SVG/inline styles
    ring: string;         // Primary hex color for dots/rings
    gradientFrom: string; // Gradient start hex
    gradientTo: string;   // Gradient end hex
}

export const CATEGORY_COLORS: Record<SpendingCategory, CategoryColorConfig> = {
    'Utilities':      { bg: 'bg-slate-500',   text: 'text-slate-600',   gradient: 'from-slate-400 to-slate-600',     ring: '#64748b', gradientFrom: '#94a3b8', gradientTo: '#475569' },
    'Groceries':      { bg: 'bg-emerald-500', text: 'text-emerald-600', gradient: 'from-emerald-400 to-emerald-600', ring: '#10b981', gradientFrom: '#34d399', gradientTo: '#059669' },
    'Education':      { bg: 'bg-indigo-500',  text: 'text-indigo-600',  gradient: 'from-indigo-400 to-indigo-600',   ring: '#6366f1', gradientFrom: '#818cf8', gradientTo: '#4f46e5' },
    'Healthcare':     { bg: 'bg-rose-500',    text: 'text-rose-600',    gradient: 'from-rose-400 to-rose-600',       ring: '#f43f5e', gradientFrom: '#fb7185', gradientTo: '#e11d48' },
    'Transportation': { bg: 'bg-cyan-500',    text: 'text-cyan-600',    gradient: 'from-cyan-400 to-cyan-600',       ring: '#06b6d4', gradientFrom: '#22d3ee', gradientTo: '#0891b2' },
    'Dining & Food':  { bg: 'bg-orange-500',  text: 'text-orange-600',  gradient: 'from-orange-400 to-orange-600',   ring: '#f97316', gradientFrom: '#fb923c', gradientTo: '#ea580c' },
    'Shopping':       { bg: 'bg-pink-500',    text: 'text-pink-600',    gradient: 'from-pink-400 to-pink-600',       ring: '#ec4899', gradientFrom: '#f472b6', gradientTo: '#db2777' },
    'Entertainment':  { bg: 'bg-purple-500',  text: 'text-purple-600',  gradient: 'from-purple-400 to-purple-600',   ring: '#a855f7', gradientFrom: '#c084fc', gradientTo: '#9333ea' },
    'Sports':         { bg: 'bg-teal-500',    text: 'text-teal-600',    gradient: 'from-teal-400 to-teal-600',       ring: '#14b8a6', gradientFrom: '#2dd4bf', gradientTo: '#0d9488' },
    'Lifestyle':      { bg: 'bg-blue-500',    text: 'text-blue-600',    gradient: 'from-blue-400 to-blue-600',       ring: '#3b82f6', gradientFrom: '#60a5fa', gradientTo: '#2563eb' },
    'Others':         { bg: 'bg-gray-400',    text: 'text-gray-500',    gradient: 'from-gray-300 to-gray-500',       ring: '#9ca3af', gradientFrom: '#d1d5db', gradientTo: '#6b7280' }
};

// Helper to get category color with fallback
export function getCategoryColor(category: string): CategoryColorConfig {
    return CATEGORY_COLORS[category as SpendingCategory] || CATEGORY_COLORS['Others'];
}
