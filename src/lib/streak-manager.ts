/**
 * Duitrack Streak Logic: The "Consistent Scanner" Rule
 *
 * To maintain a streak, the user must perform at least one successful
 * receipt scan within a single calendar day (00:00 to 23:59 local time).
 *
 * Rules:
 * - Day 1: User scans a receipt. streakCount = 1.
 * - Day 2: User scans another receipt. streakCount = 2.
 * - Missed Day: If no receipt is scanned for an entire calendar day, streak resets to 0.
 * - Backdated scans will NOT count toward streak.
 */

import type { StreakData } from './insights-engine';

// ============ CONSTANTS ============

export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365] as const;

export type StreakMilestone = typeof STREAK_MILESTONES[number];

// ============ HELPER FUNCTIONS ============

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
export function getTodayDateString(): string {
    const now = new Date();
    return formatDateString(now);
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export function getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateString(yesterday);
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
    return dateString === getTodayDateString();
}

/**
 * Check if a date string is yesterday
 */
export function isYesterday(dateString: string): boolean {
    return dateString === getYesterdayDateString();
}

/**
 * Check if a receipt date is backdated (not today)
 */
export function isBackdated(receiptDateString: string): boolean {
    return receiptDateString !== getTodayDateString();
}

// ============ STREAK CALCULATION ============

/**
 * Calculate streak status based on receipt scan
 *
 * @param currentStreak - Current streak data
 * @param receiptDate - Date of the receipt being scanned (YYYY-MM-DD)
 * @returns Updated streak data
 */
export function calculateStreakOnScan(
    currentStreak: StreakData,
    receiptDate: string
): StreakData {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    const lastUpdated = currentStreak.lastUpdated;

    // Rule: Backdated scans do NOT count toward streak
    if (receiptDate !== today) {
        return currentStreak; // No change
    }

    // Already scanned today - no change to streak count
    if (lastUpdated === today) {
        return currentStreak;
    }

    // First scan of the day
    let newStreak: number;
    let newStreakDates = [...currentStreak.streakDates];

    if (lastUpdated === yesterday) {
        // Consecutive day - increment streak
        newStreak = currentStreak.currentStreak + 1;
        newStreakDates.push(today);
    } else {
        // Streak broken or first ever scan - start fresh
        newStreak = 1;
        newStreakDates = [today];
    }

    // Keep only last 365 days of streak dates
    if (newStreakDates.length > 365) {
        newStreakDates = newStreakDates.slice(-365);
    }

    return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, currentStreak.longestStreak),
        lastUpdated: today,
        streakDates: newStreakDates,
    };
}

/**
 * Check if streak should be reset (called on app launch)
 * If more than 1 day has passed since last scan, reset streak.
 */
export function checkStreakStatus(currentStreak: StreakData): StreakData {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    const lastUpdated = currentStreak.lastUpdated;

    // No previous activity
    if (!lastUpdated) {
        return currentStreak;
    }

    // Last update was today or yesterday - streak is safe
    if (lastUpdated === today || lastUpdated === yesterday) {
        return currentStreak;
    }

    // More than 1 day has passed - reset streak
    return {
        ...currentStreak,
        currentStreak: 0,
        streakDates: [],
    };
}

// ============ MILESTONE DETECTION ============

/**
 * Check if a streak has reached a milestone
 */
export function getStreakMilestone(streakCount: number): StreakMilestone | null {
    for (const milestone of STREAK_MILESTONES) {
        if (streakCount === milestone) {
            return milestone;
        }
    }
    return null;
}

/**
 * Get the next milestone for a given streak count
 */
export function getNextMilestone(streakCount: number): StreakMilestone | null {
    for (const milestone of STREAK_MILESTONES) {
        if (milestone > streakCount) {
            return milestone;
        }
    }
    return null;
}

/**
 * Calculate days remaining to next milestone
 */
export function getDaysToNextMilestone(streakCount: number): number | null {
    const next = getNextMilestone(streakCount);
    return next ? next - streakCount : null;
}

// ============ STREAK STATUS ============

export type StreakStatus = 'inactive' | 'active' | 'at_risk' | 'milestone';

/**
 * Get streak visual status for UI rendering
 */
export function getStreakStatus(streak: StreakData): StreakStatus {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (streak.currentStreak === 0) {
        return 'inactive';
    }

    // Check for milestone
    if (getStreakMilestone(streak.currentStreak)) {
        return 'milestone';
    }

    // At risk if last scan was yesterday (need to scan today to maintain)
    if (streak.lastUpdated === yesterday) {
        return 'at_risk';
    }

    // Active if scanned today
    if (streak.lastUpdated === today) {
        return 'active';
    }

    return 'inactive';
}

/**
 * Get streak glow color class based on status and milestones
 */
export function getStreakGlowClass(streak: StreakData): string {
    const status = getStreakStatus(streak);
    const count = streak.currentStreak;

    if (status === 'inactive') {
        return ''; // No glow
    }

    if (status === 'at_risk') {
        return 'animate-pulse text-amber-500'; // Warning pulse
    }

    // Milestone-based glow colors
    if (count >= 365) return 'text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]';
    if (count >= 90) return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]';
    if (count >= 30) return 'text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]';
    if (count >= 7) return 'text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.4)]';

    return 'text-orange-300'; // Default active color
}

// ============ STREAK FREEZE (Future Feature) ============

export interface StreakFreeze {
    available: number;
    lastUsed: string | null;
}

/**
 * Use a streak freeze to save a broken streak
 * (To be implemented with referral rewards)
 */
export function useStreakFreeze(
    streak: StreakData,
    freeze: StreakFreeze
): { streak: StreakData; freeze: StreakFreeze; success: boolean } {
    if (freeze.available <= 0) {
        return { streak, freeze, success: false };
    }

    const today = getTodayDateString();

    // Can only use freeze if streak would have been broken today
    if (streak.lastUpdated === today || streak.currentStreak === 0) {
        return { streak, freeze, success: false };
    }

    // Apply freeze - maintain streak without requiring scan
    return {
        streak: {
            ...streak,
            lastUpdated: today,
            streakDates: [...streak.streakDates, `${today}-frozen`],
        },
        freeze: {
            available: freeze.available - 1,
            lastUsed: today,
        },
        success: true,
    };
}
