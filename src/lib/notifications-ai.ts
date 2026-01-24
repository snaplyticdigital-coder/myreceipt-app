/**
 * AI-Powered Notification System
 * Generates weekly summaries, midweek reminders, and alerts
 */

import type { Receipt } from '../types';
import type { UserInsightsState } from './insights-engine';
import { detectAnomalies } from './insights-engine';

// ============ NOTIFICATION TYPES ============

export type NotificationType =
    | 'weekly_summary'
    | 'midweek_reminder'
    | 'anomaly_alert'
    | 'streak_celebration'
    | 'streak_broken'
    | 'goal_reached'
    | 'budget_warning';

export interface AINotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    emoji: string;
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
    read: boolean;
    createdAt: string;
    scheduledFor?: string;
}

// ============ NOTIFICATION GENERATORS ============

/**
 * Generate weekly summary notification (Sunday evening)
 */
export function generateWeeklySummary(
    receipts: Receipt[],
    _userState: UserInsightsState
): AINotification {
    const now = new Date();
    const weekStart = new Date(now);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekReceipts = receipts.filter(r => new Date(r.date) >= weekStart);
    const weekTotal = weekReceipts.reduce((sum, r) => sum + r.amount, 0);
    const transactionCount = weekReceipts.length;

    // Get previous week for comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

    const prevWeekReceipts = receipts.filter(r => {
        const date = new Date(r.date);
        return date >= prevWeekStart && date <= prevWeekEnd;
    });
    const prevWeekTotal = prevWeekReceipts.reduce((sum, r) => sum + r.amount, 0);

    const savings = prevWeekTotal - weekTotal;
    const isPositive = savings > 0;

    let message: string;
    let emoji: string;

    if (isPositive && savings > 50) {
        message = `🎉 Your Week at a Glance: You spent RM${weekTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })} across ${transactionCount} transactions. Great news – you saved RM${savings.toFixed(0)} compared to last week! Keep up the smart spending!`;
        emoji = '🎉';
    } else if (isPositive) {
        message = `📊 Your Week at a Glance: RM${weekTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })} spent on ${transactionCount} transactions. Slightly under last week's spending – nice work!`;
        emoji = '📊';
    } else {
        const overSpend = Math.abs(savings);
        message = `📊 Weekly Summary: You spent RM${weekTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })} this week (RM${overSpend.toFixed(0)} more than last week). Let's aim for better next week!`;
        emoji = '📊';
    }

    return {
        id: `weekly-${Date.now()}`,
        type: 'weekly_summary',
        title: '📅 Your Week at a Glance',
        message,
        emoji,
        priority: 'medium',
        actionUrl: '/analytics',
        read: false,
        createdAt: now.toISOString(),
        scheduledFor: getSundayEvening().toISOString(),
    };
}

/**
 * Generate midweek reminder (Wednesday)
 */
export function generateMidweekReminder(
    receipts: Receipt[],
    userState: UserInsightsState
): AINotification | null {
    const now = new Date();
    const weekStart = new Date(now);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekReceipts = receipts.filter(r => new Date(r.date) >= weekStart);
    const weekTotal = weekReceipts.reduce((sum, r) => sum + r.amount, 0);

    const budgetUsedPercent = (weekTotal / userState.weeklyBudget) * 100;

    // Only generate if >60% of budget used by midweek
    if (budgetUsedPercent < 60) return null;

    const remaining = userState.weeklyBudget - weekTotal;
    const daysLeft = 7 - dayOfWeek;

    let message: string;
    let emoji: string;
    let priority: 'high' | 'medium' | 'low' = 'medium';

    if (budgetUsedPercent > 100) {
        message = `⚠️ Heads up! You've already exceeded your weekly budget by RM${Math.abs(remaining).toFixed(0)}. Consider holding off on non-essential purchases for the rest of the week.`;
        emoji = '⚠️';
        priority = 'high';
    } else if (budgetUsedPercent > 80) {
        message = `Halfway through the week! You're at ${budgetUsedPercent.toFixed(0)}% of your weekly budget with ${daysLeft} days left. Only RM${remaining.toFixed(0)} remaining – maybe try a home-cooked meal? 🍲`;
        emoji = '🔔';
        priority = 'high';
    } else {
        message = `Midweek check-in: ${budgetUsedPercent.toFixed(0)}% of your budget used. RM${remaining.toFixed(0)} left for ${daysLeft} more days. You're on track! 👍`;
        emoji = '📊';
    }

    return {
        id: `midweek-${Date.now()}`,
        type: 'midweek_reminder',
        title: '📅 Midweek Check-in',
        message,
        emoji,
        priority,
        actionUrl: '/budget',
        read: false,
        createdAt: now.toISOString(),
        scheduledFor: getWednesdayEvening().toISOString(),
    };
}

/**
 * Generate anomaly alert notification
 */
export function generateAnomalyAlert(receipt: Receipt): AINotification {
    return {
        id: `anomaly-${receipt.id}`,
        type: 'anomaly_alert',
        title: '🚨 Unusual Transaction Detected',
        message: `Did you make a RM${receipt.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })} purchase at ${receipt.merchant}? Tap to verify this transaction.`,
        emoji: '🚨',
        priority: 'high',
        actionUrl: `/receipt/${receipt.id}`,
        read: false,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate streak celebration notification
 */
export function generateStreakCelebration(streakDays: number): AINotification {
    const milestones: Record<number, string> = {
        3: '🔥 3-day streak achieved! You\'re building great habits!',
        5: '⚡ 5-day streak! You\'re on a roll – keep going!',
        7: '🌟 One week under budget! You\'re a budgeting superstar!',
        14: '🏆 Two weeks of smart spending! That\'s incredible discipline!',
        21: '👑 21-day streak! You\'ve officially formed a new habit!',
        30: '🎊 30-day streak! You\'re a budget master! Treat yourself (within budget 😉)',
    };

    const message = milestones[streakDays] || `🔥 ${streakDays}-day streak! Amazing consistency!`;

    return {
        id: `streak-${Date.now()}`,
        type: 'streak_celebration',
        title: `🎉 ${streakDays}-Day Streak!`,
        message,
        emoji: '🔥',
        priority: streakDays >= 7 ? 'high' : 'medium',
        read: false,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate streak broken notification
 */
export function generateStreakBroken(previousStreak: number): AINotification {
    let message: string;

    if (previousStreak >= 7) {
        message = `Your ${previousStreak}-day streak ended, but that was amazing progress! Don't worry – tomorrow is a fresh start. You've got this! 💪`;
    } else if (previousStreak >= 3) {
        message = `Your ${previousStreak}-day streak ended. No worries – every day is a chance to start fresh. Let's get back on track! 🌟`;
    } else {
        message = `Streak reset – but that's okay! Every journey has bumps. Tomorrow's a new opportunity! 🌅`;
    }

    return {
        id: `streak-broken-${Date.now()}`,
        type: 'streak_broken',
        title: 'Streak Reset',
        message,
        emoji: '💪',
        priority: 'low',
        read: false,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate goal reached notification
 */
export function generateGoalReached(goalName: string, amount: number): AINotification {
    return {
        id: `goal-${Date.now()}`,
        type: 'goal_reached',
        title: '🎊 Goal Achieved!',
        message: `Congratulations! You've reached your "${goalName}" goal of RM${amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}! That's incredible dedication. Time to set a new challenge! 🎯`,
        emoji: '🎊',
        priority: 'high',
        actionUrl: '/profile',
        read: false,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate budget warning notification
 */
export function generateBudgetWarning(
    category: string,
    currentSpend: number,
    budgetLimit: number
): AINotification {
    const percentUsed = (currentSpend / budgetLimit) * 100;

    let message: string;
    let priority: 'high' | 'medium' | 'low' = 'medium';

    if (percentUsed >= 100) {
        message = `⚠️ You've exceeded your ${category} budget! Consider holding off on ${category.toLowerCase()} purchases for now.`;
        priority = 'high';
    } else if (percentUsed >= 90) {
        message = `🔔 Almost there! ${percentUsed.toFixed(0)}% of your ${category} budget used. Only RM${(budgetLimit - currentSpend).toFixed(0)} remaining.`;
        priority = 'high';
    } else {
        message = `📊 ${category} update: You've used ${percentUsed.toFixed(0)}% of your budget.`;
    }

    return {
        id: `budget-warning-${Date.now()}`,
        type: 'budget_warning',
        title: `${percentUsed >= 100 ? '⚠️' : '📊'} ${category} Budget Alert`,
        message,
        emoji: percentUsed >= 100 ? '⚠️' : '📊',
        priority,
        actionUrl: '/budget',
        read: false,
        createdAt: new Date().toISOString(),
    };
}

// ============ SCHEDULING HELPERS ============

function getSundayEvening(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    sunday.setHours(20, 0, 0, 0); // 8pm

    return sunday;
}

function getWednesdayEvening(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilWednesday = (3 - dayOfWeek + 7) % 7 || 7;

    const wednesday = new Date(now);
    wednesday.setDate(now.getDate() + daysUntilWednesday);
    wednesday.setHours(19, 0, 0, 0); // 7pm

    return wednesday;
}

// ============ MAIN NOTIFICATION GENERATOR ============

/**
 * Generate all pending notifications for a user
 */
export function generatePendingNotifications(
    receipts: Receipt[],
    userState: UserInsightsState,
    existingNotifications: AINotification[]
): AINotification[] {
    const newNotifications: AINotification[] = [];
    const now = new Date();

    // Check for anomalies in recent transactions
    const recentReceipts = receipts.filter(r => {
        const receiptDate = new Date(r.date);
        const dayAgo = new Date(now);
        dayAgo.setDate(dayAgo.getDate() - 1);
        return receiptDate >= dayAgo;
    });

    const anomalies = detectAnomalies(recentReceipts);
    anomalies.forEach(receipt => {
        const alreadyNotified = existingNotifications.some(
            n => n.type === 'anomaly_alert' && n.id === `anomaly-${receipt.id}`
        );
        if (!alreadyNotified) {
            newNotifications.push(generateAnomalyAlert(receipt));
        }
    });

    // Check if it's Sunday evening for weekly summary
    const isSunday = now.getDay() === 0;
    const isEvening = now.getHours() >= 18;
    if (isSunday && isEvening) {
        const alreadyHasWeeklySummary = existingNotifications.some(
            n => n.type === 'weekly_summary' &&
                new Date(n.createdAt).toDateString() === now.toDateString()
        );
        if (!alreadyHasWeeklySummary) {
            newNotifications.push(generateWeeklySummary(receipts, userState));
        }
    }

    // Check if it's Wednesday for midweek reminder
    const isWednesday = now.getDay() === 3;
    if (isWednesday && isEvening) {
        const alreadyHasMidweek = existingNotifications.some(
            n => n.type === 'midweek_reminder' &&
                new Date(n.createdAt).toDateString() === now.toDateString()
        );
        if (!alreadyHasMidweek) {
            const midweekNotif = generateMidweekReminder(receipts, userState);
            if (midweekNotif) {
                newNotifications.push(midweekNotif);
            }
        }
    }

    return newNotifications;
}

/**
 * Get notification preferences template
 */
export const DEFAULT_NOTIFICATION_PREFERENCES = {
    weeklySummary: true,
    midweekReminder: true,
    anomalyAlerts: true,
    streakCelebrations: true,
    goalProgress: true,
    budgetWarnings: true,
    quietHoursStart: 22, // 10pm
    quietHoursEnd: 8, // 8am
};

export type NotificationPreferences = typeof DEFAULT_NOTIFICATION_PREFERENCES;
