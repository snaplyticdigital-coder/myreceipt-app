/**
 * DUITRACK DESIGN TOKENS
 * Centralized design system constants for Cyber-Luxe theme
 *
 * Usage: Import specific tokens where needed
 * All colors, spacing, and typography should reference these tokens
 */

// ============================================
// NAVIGATION COLORS
// ============================================
export const NAV_COLORS = {
    active: '#7c3aed',      // Purple-600
    inactive: '#9CA3AF',    // Gray-400
} as const;

// ============================================
// PROGRESS/STATUS COLORS
// ============================================
export const PROGRESS_COLORS = {
    critical: '#ef4444',    // Red-500 (>100% budget)
    warning: '#f59e0b',     // Amber-500 (>80% budget)
    success: '#10b981',     // Emerald-500 (<50% budget)
    default: '#3b82f6',     // Blue-500 (normal state)
} as const;

// ============================================
// TIER/GAMIFICATION COLORS
// ============================================
export const TIER_COLORS = {
    bronze: {
        from: '#D97706',    // Amber-600
        to: '#B45309',      // Amber-700
        bg: 'from-amber-600 to-amber-700',
    },
    silver: {
        from: '#94A3B8',    // Slate-400
        to: '#64748B',      // Slate-500
        bg: 'from-slate-400 to-slate-500',
    },
    gold: {
        from: '#EAB308',    // Yellow-500
        to: '#CA8A04',      // Yellow-600
        bg: 'from-yellow-500 to-yellow-600',
    },
    platinum: {
        from: '#22D3EE',    // Cyan-400
        to: '#0891B2',      // Cyan-600
        bg: 'from-cyan-400 to-cyan-600',
    },
    diamond: {
        from: '#818CF8',    // Indigo-400
        to: '#4F46E5',      // Indigo-600
        bg: 'from-indigo-400 to-indigo-600',
    },
} as const;

// ============================================
// BRAND GRADIENT (Duitrack Blue-Purple)
// ============================================
export const BRAND_GRADIENT = {
    from: '#7c3aed',        // Purple-600
    to: '#3b82f6',          // Blue-500
    css: 'linear-gradient(to right, #7c3aed, #3b82f6)',
    tailwind: 'from-purple-600 to-blue-500',
} as const;

// ============================================
// SHADOW COLORS (for glow effects)
// ============================================
export const SHADOW_COLORS = {
    purple: 'rgba(168, 85, 247, 0.4)',
    blue: 'rgba(59, 130, 246, 0.3)',
    cyan: 'rgba(34, 211, 238, 0.5)',
} as const;

// ============================================
// SPACING TOKENS (8px grid system)
// ============================================
export const SPACING = {
    // Safe area top padding (standard for all pages)
    safeAreaTop: 'pt-[calc(1rem+env(safe-area-inset-top))]',
    // Page horizontal padding
    pageX: 'px-4',          // 16px
    // Card spacing
    cardGap: 'space-y-4',   // 16px between cards
    // Section spacing
    sectionGap: 'space-y-6', // 24px between sections
} as const;

// ============================================
// TYPOGRAPHY SCALE
// Map custom sizes to standard Tailwind
// ============================================
export const TEXT_SCALE = {
    // Micro/Caption (was text-[9px], text-[10px], text-[11px])
    caption: 'text-xs',     // 12px
    // Body small (was text-[13px])
    bodySmall: 'text-sm',   // 14px
    // Body/Heading (was text-[15px])
    body: 'text-base',      // 16px
    // Subheading
    subheading: 'text-lg',  // 18px
    // Heading
    heading: 'text-xl',     // 20px
    // Display
    display: 'text-2xl',    // 24px
    // Hero
    hero: 'text-3xl',       // 30px
} as const;

// ============================================
// FONT WEIGHT TOKENS
// ============================================
export const FONT_WEIGHT = {
    // For micro labels (9-10px text)
    label: 'font-semibold',     // 600
    // For captions and helpers
    caption: 'font-medium',     // 500
    // For body text
    body: 'font-normal',        // 400
    // For card headings
    cardHeading: 'font-semibold', // 600
    // For section headings
    sectionHeading: 'font-bold',  // 700
    // For hero amounts
    hero: 'font-bold',          // 700
} as const;

// ============================================
// CURRENCY DISPLAY
// Standard classes for monetary values
// ============================================
export const CURRENCY_DISPLAY = {
    // Base: tabular figures for alignment
    base: 'tabular-nums',
    // Small amounts in lists
    list: 'tabular-nums text-sm font-semibold',
    // Card amounts
    card: 'tabular-nums text-lg font-bold',
    // Hero/main amount
    hero: 'tabular-nums text-3xl font-bold tracking-tight',
} as const;

// ============================================
// GOOGLE BRAND COLORS (for OAuth buttons)
// ============================================
export const GOOGLE_COLORS = {
    blue: '#4285F4',
    green: '#34A853',
    yellow: '#FBBC05',
    red: '#EA4335',
} as const;

// ============================================
// HELPER: Get progress color based on percentage
// ============================================
export function getProgressColor(percent: number): string {
    if (percent >= 100) return PROGRESS_COLORS.critical;
    if (percent >= 80) return PROGRESS_COLORS.warning;
    if (percent <= 50) return PROGRESS_COLORS.success;
    return PROGRESS_COLORS.default;
}

// ============================================
// HELPER: Get progress Tailwind class
// ============================================
export function getProgressColorClass(percent: number): string {
    if (percent >= 100) return 'text-red-500';
    if (percent >= 80) return 'text-amber-500';
    if (percent <= 50) return 'text-emerald-500';
    return 'text-blue-500';
}

// ============================================
// HELPER: Get tier info based on points
// ============================================
export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TierColors {
    from: string;
    to: string;
    bg: string;
}

export interface TierInfo {
    key: TierKey;
    name: string;
    colors: TierColors;
}

export function getTierByPoints(points: number): TierInfo {
    if (points >= 7500) {
        return { key: 'diamond', name: 'Diamond Member', colors: TIER_COLORS.diamond };
    }
    if (points >= 2500) {
        return { key: 'gold', name: 'Gold Member', colors: TIER_COLORS.gold };
    }
    if (points >= 500) {
        return { key: 'silver', name: 'Silver Member', colors: TIER_COLORS.silver };
    }
    return { key: 'bronze', name: 'Bronze Member', colors: TIER_COLORS.bronze };
}
