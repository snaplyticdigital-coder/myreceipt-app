/**
 * achievements.ts
 * Definitions and logic for the gamification system
 */

import type { Receipt, Budget } from '../types';
import type { StreakData } from './insights-engine';

export type AchievementTier = 'Legendary' | 'Epic' | 'Rare' | 'Common';

export interface Achievement {
    id: string;
    title: string;
    tier: AchievementTier;
    description: string;
    icon: string; // Using emojis or Lucide icon names for now
    target: number;
    unit: string;
    isSecret?: boolean;
}

export interface AchievementProgress {
    achievementId: string;
    current: number;
    target: number;
    progressPercent: number;
    isUnlocked: boolean;
    unlockedDate?: string;
}

// --- Achievement Definitions ---

export const ACHIEVEMENTS: Achievement[] = [
    // LEGENDARY (2)
    {
        id: 'legendary-tracker',
        title: 'Legendary Tracker',
        tier: 'Legendary',
        description: 'Upload 500 receipts',
        icon: '👑',
        target: 500,
        unit: 'receipts'
    },
    {
        id: 'monthly-master',
        title: 'Monthly Master',
        tier: 'Legendary',
        description: 'Maintain a 30-day streak',
        icon: '🌟',
        target: 30,
        unit: 'days'
    },

    // EPIC (4)
    {
        id: 'receipt-master',
        title: 'Receipt Master',
        tier: 'Epic',
        description: 'Upload 100 receipts',
        icon: '🥈',
        target: 100,
        unit: 'receipts'
    },
    {
        id: 'fortnight-fighter',
        title: 'Fortnight Fighter',
        tier: 'Epic',
        description: 'Maintain a 14-day streak',
        icon: '💪',
        target: 14,
        unit: 'days'
    },
    {
        id: 'super-saver',
        title: 'Super Saver',
        tier: 'Epic',
        description: 'Stay RM 1000 under budget',
        icon: '💎',
        target: 1000,
        unit: 'RM saved'
    },
    {
        id: 'challenge-champion',
        title: 'Challenge Champion',
        tier: 'Epic',
        description: 'Complete 5 challenges',
        icon: '🏆',
        target: 5,
        unit: 'challenges'
    },

    // RARE (6)
    {
        id: 'consistent-tracker',
        title: 'Consistent Tracker',
        tier: 'Rare',
        description: 'Upload 50 receipts',
        icon: '📊',
        target: 50,
        unit: 'receipts'
    },
    {
        id: 'week-warrior',
        title: 'Week Warrior',
        tier: 'Rare',
        description: 'Maintain a 7-day streak',
        icon: '⚡',
        target: 7,
        unit: 'days'
    },
    {
        id: 'smart-saver',
        title: 'Smart Saver',
        tier: 'Rare',
        description: 'Use less than 90% of budget',
        icon: '💵',
        target: 90,
        unit: '%'
    },
    {
        id: 'minimalist',
        title: 'Minimalist',
        tier: 'Rare',
        description: 'Upload a receipt with only 1 item',
        icon: '🧘',
        target: 1,
        unit: 'receipt'
    },
    {
        id: 'category-explorer',
        title: 'Category Explorer',
        tier: 'Rare',
        description: 'Spend in 5 different categories',
        icon: '🗺️',
        target: 5,
        unit: 'categories'
    },
    {
        id: 'challenger',
        title: 'Challenger',
        tier: 'Rare',
        description: 'Complete your first challenge',
        icon: '🎯',
        target: 1,
        unit: 'challenge'
    },

    // COMMON (6)
    {
        id: 'first-steps',
        title: 'First Steps',
        tier: 'Common',
        description: 'Upload your first receipt',
        icon: '👶',
        target: 1,
        unit: 'receipt'
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        tier: 'Common',
        description: 'Upload 10 receipts',
        icon: '📝',
        target: 10,
        unit: 'receipts'
    },
    {
        id: 'streak-starter',
        title: 'Streak Starter',
        tier: 'Common',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        target: 3,
        unit: 'days'
    },
    {
        id: 'penny-pincher',
        title: 'Penny Pincher',
        tier: 'Common',
        description: 'Upload a receipt under RM 10',
        icon: '💰',
        target: 1,
        unit: 'receipt'
    },
    {
        id: 'early-bird',
        title: 'Early Bird',
        tier: 'Common',
        description: 'Upload a receipt before 9:00 AM',
        icon: '🌅',
        target: 1,
        unit: 'receipt'
    },
    {
        id: 'night-owl',
        title: 'Night Owl',
        tier: 'Common',
        description: 'Upload a receipt after 9:00 PM',
        icon: '🦉',
        target: 1,
        unit: 'receipt'
    }
];

// --- Progress Calculation Logic ---

export function calculateAchievements(
    receipts: Receipt[],
    streak: StreakData,
    budget: Budget
): AchievementProgress[] {

    // Helper to clamp progress
    const clamp = (val: number, max: number) => Math.min(val, max);

    // 1. Receipt Counts
    const receiptCount = receipts.length;

    // 2. Streaks
    const currentStreak = streak.currentStreak;

    // 3. Category Count
    const uniqueCategories = new Set(receipts.map(r => r.spendingCategory)).size;

    // 4. Time-based & Value-based checks
    const hasSingleItem = receipts.some(r => r.items && r.items.length === 1);
    const hasSmallReceipt = receipts.some(r => r.amount < 10);
    const hasEarlyBird = receipts.some(r => {
        const hour = new Date(r.date).getHours();
        return hour < 9;
    });
    const hasNightOwl = receipts.some(r => {
        const hour = new Date(r.date).getHours();
        return hour >= 21;
    });

    // 5. Budget Logic
    const totalSpent = receipts.reduce((sum, r) => sum + r.amount, 0); // Simplified total for now
    const budgetTotal = budget.total || 1;
    const budgetUsagePercent = (totalSpent / budgetTotal) * 100;
    const isSmartSaver = budgetTotal > 0 && budgetUsagePercent < 90 && totalSpent > 0;
    const amountSaved = Math.max(0, budgetTotal - totalSpent);

    // Mock Challenge Data (Phase 5 placeholder)
    const challengesCompleted = 0;

    return ACHIEVEMENTS.map(achievement => {
        let current = 0;

        switch (achievement.id) {
            // Counts
            case 'first-steps':
            case 'getting-started':
            case 'consistent-tracker':
            case 'receipt-master':
            case 'legendary-tracker':
                current = receiptCount;
                break;

            // Streaks
            case 'streak-starter':
            case 'week-warrior':
            case 'fortnight-fighter':
            case 'monthly-master':
                current = currentStreak;
                break;

            // Categories
            case 'category-explorer':
                current = uniqueCategories;
                break;

            // Booleans (0 or 1)
            case 'minimalist':
                current = hasSingleItem ? 1 : 0;
                break;
            case 'penny-pincher':
                current = hasSmallReceipt ? 1 : 0;
                break;
            case 'early-bird':
                current = hasEarlyBird ? 1 : 0;
                break;
            case 'night-owl':
                current = hasNightOwl ? 1 : 0;
                break;

            // Budget
            case 'smart-saver':
                current = isSmartSaver ? 91 : budgetUsagePercent; // Inverse logic slightly tricky for progress bar, special casing or simplifying:
                // Actually smart saver target is 90% usage NO wait. "Less than 90%"
                // Let's just track it as binary for now? Or inverse?
                // Let's simplified: If usage < 90%, unlocked.
                current = isSmartSaver ? 90 : 0;
                break;

            case 'super-saver':
                current = amountSaved;
                break;

            // Challenges
            case 'challenger':
            case 'challenge-champion':
                current = challengesCompleted;
                break;

            default:
                current = 0;
        }

        return {
            achievementId: achievement.id,
            current: current,
            target: achievement.target,
            progressPercent: clamp((current / achievement.target) * 100, 100),
            isUnlocked: current >= achievement.target
        };
    });
}
