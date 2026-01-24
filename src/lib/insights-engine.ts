/**
 * AI-Powered Weekly Spending Insights Engine
 * Generates personalized insights based on spending patterns
 */

import type { Receipt } from '../types';

// ============ INSIGHT TYPES ============

export type InsightType =
    | 'motivational'
    | 'habit_streak'
    | 'goal_progress'
    | 'forecasting'
    | 'anomaly'
    | 'category_comparison';

export type InsightPriority = 'high' | 'medium' | 'low';

// Phase 5: Severity levels for categorization
export type InsightSeverity = 'critical' | 'positive' | 'informational';

export interface Insight {
    id: string;
    type: InsightType;
    title: string;
    message: string;
    emoji: string;
    priority: InsightPriority;
    severity: InsightSeverity;  // Phase 5: Added for categorization
    category?: string;
    value?: number;
    percentChange?: number;
    actionLabel?: string;
    createdAt: string;
}

export interface UserGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    category?: string;
    deadline?: string;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastUpdated: string;
    streakDates: string[];
}

export interface UserInsightsState {
    streak: StreakData;
    goals: UserGoal[];
    points: number;
    badges: string[];
    weeklyBudget: number;
    dailyBudget: number;
}

// ============ ANALYSIS UTILITIES ============

/**
 * Calculate total spending for a date range
 */
export function calculateSpending(
    receipts: Receipt[],
    startDate: Date,
    endDate: Date
): number {
    return receipts
        .filter(r => {
            const date = new Date(r.date);
            return date >= startDate && date <= endDate;
        })
        .reduce((sum, r) => sum + r.amount, 0);
}

/**
 * Calculate spending by category
 */
export function getSpendingByCategory(
    receipts: Receipt[],
    startDate: Date,
    endDate: Date
): Record<string, number> {
    const spending: Record<string, number> = {};

    receipts
        .filter(r => {
            const date = new Date(r.date);
            return date >= startDate && date <= endDate;
        })
        .forEach(r => {
            const category = r.merchantCategory || 'Others';
            spending[category] = (spending[category] || 0) + r.amount;
        });

    return spending;
}

/**
 * Calculate 4-week rolling average by category
 */
export function getCategoryAverages(
    receipts: Receipt[]
): Record<string, number> {
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const spending = getSpendingByCategory(receipts, fourWeeksAgo, now);
    const averages: Record<string, number> = {};

    Object.entries(spending).forEach(([cat, total]) => {
        averages[cat] = total / 4; // Weekly average
    });

    return averages;
}

/**
 * Get daily spending totals for the past week
 */
export function getDailySpending(receipts: Receipt[]): Record<string, number> {
    const daily: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        daily[dateStr] = 0;
    }

    receipts.forEach(r => {
        const dateStr = r.date.split('T')[0];
        if (daily[dateStr] !== undefined) {
            daily[dateStr] += r.amount;
        }
    });

    return daily;
}

/**
 * Detect anomalous transactions
 */
export function detectAnomalies(
    receipts: Receipt[],
    threshold: number = 2.0
): Receipt[] {
    if (receipts.length < 5) return [];

    // Calculate average and std dev of recent transactions
    const amounts = receipts.slice(0, 20).map(r => r.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    // Find transactions that deviate significantly
    return receipts.filter(r => {
        const zScore = Math.abs((r.amount - avg) / stdDev);
        return zScore > threshold;
    }).slice(0, 3);
}

// ============ INSIGHT GENERATORS ============

/**
 * Generate motivational insights (savings celebrations)
 * Phase 6: Always include explicit comparison context
 */
export function generateMotivationalInsight(
    currentWeekSpending: Record<string, number>,
    lastWeekSpending: Record<string, number>
): Insight | null {
    let bestSavings = { category: '', amount: 0, currentAmount: 0, lastAmount: 0 };

    Object.entries(lastWeekSpending).forEach(([cat, lastAmount]) => {
        const currentAmount = currentWeekSpending[cat] || 0;
        const savings = lastAmount - currentAmount;

        if (savings > bestSavings.amount && savings > 10) {
            bestSavings = { category: cat, amount: savings, currentAmount, lastAmount };
        }
    });

    if (bestSavings.amount <= 0) return null;

    // Phase 6: ALWAYS include explicit comparison context
    // Show BOTH numbers so user understands the comparison
    const message = `You spent RM${bestSavings.currentAmount.toFixed(0)} on ${bestSavings.category} this week vs RM${bestSavings.lastAmount.toFixed(0)} last week — that's RM${bestSavings.amount.toFixed(0)} saved! 🎉`;

    return {
        id: `motivational-${Date.now()}`,
        type: 'motivational',
        title: 'Great Savings!',
        message,
        emoji: '🎉',
        priority: 'high',
        severity: 'positive',
        category: bestSavings.category,
        value: bestSavings.amount,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate habit streak insight
 */
export function generateStreakInsight(streak: StreakData): Insight | null {
    if (streak.currentStreak < 3) return null;

    const milestones = [3, 5, 7, 14, 21, 30];
    const isMilestone = milestones.includes(streak.currentStreak);

    let message = `${streak.currentStreak}-day budget streak – keep it up!`;
    let emoji = '🔥';

    if (streak.currentStreak >= 7) {
        message = `Incredible! ${streak.currentStreak} days under budget! You're on fire! 🌟`;
        emoji = '🌟';
    } else if (streak.currentStreak >= 5) {
        message = `5-day streak achieved! You're building amazing habits! 💪`;
        emoji = '💪';
    }

    return {
        id: `streak-${Date.now()}`,
        type: 'habit_streak',
        title: `🔥 ${streak.currentStreak}-Day Streak`,
        message,
        emoji,
        priority: isMilestone ? 'high' : 'medium',
        severity: 'positive',  // Phase 5: Streaks are positive reinforcement
        value: streak.currentStreak,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate goal progress insight
 */
export function generateGoalProgressInsight(goals: UserGoal[]): Insight | null {
    if (goals.length === 0) return null;

    // Find the goal with most progress
    const activeGoal = goals.reduce((best, goal) => {
        const progress = goal.currentAmount / goal.targetAmount;
        const bestProgress = best.currentAmount / best.targetAmount;
        return progress > bestProgress ? goal : best;
    });

    const progress = (activeGoal.currentAmount / activeGoal.targetAmount) * 100;
    const remaining = activeGoal.targetAmount - activeGoal.currentAmount;

    let message: string;
    let emoji: string;

    if (progress >= 100) {
        message = `🎊 You've reached your "${activeGoal.name}" goal! Amazing work!`;
        emoji = '🎊';
    } else if (progress >= 75) {
        message = `You're ${progress.toFixed(0)}% to your ${activeGoal.name} goal – almost there! Only RM${remaining.toFixed(0)} to go!`;
        emoji = '🎯';
    } else if (progress >= 50) {
        message = `Halfway there! You're ${progress.toFixed(0)}% to your ${activeGoal.name} goal. Keep going!`;
        emoji = '💪';
    } else {
        message = `You're ${progress.toFixed(0)}% of the way to your ${activeGoal.name} goal. Every bit counts!`;
        emoji = '📈';
    }

    return {
        id: `goal-${Date.now()}`,
        type: 'goal_progress',
        title: 'Goal Progress',
        message,
        emoji,
        priority: progress >= 75 ? 'high' : 'medium',
        severity: 'positive',  // Phase 5: Goal progress is positive
        value: progress,
        percentChange: progress,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate forecasting nudge
 */
export function generateForecastingInsight(
    currentSpending: number,
    budget: number,
    daysIntoWeek: number
): Insight | null {
    if (budget <= 0 || daysIntoWeek === 0) return null;

    const dailyAverage = currentSpending / daysIntoWeek;
    const projectedWeekly = dailyAverage * 7;
    const projectedExcess = projectedWeekly - budget;

    if (projectedExcess <= 0) return null;

    const percentOver = (projectedExcess / budget) * 100;

    let message: string;
    let priority: InsightPriority = 'medium';

    if (percentOver > 30) {
        message = `⚠️ Heads up! At this pace, you'll exceed your budget by RM${projectedExcess.toFixed(0)}. We've got tips that can help.`;
        priority = 'high';
    } else {
        message = `Gentle reminder: You're on track to be RM${projectedExcess.toFixed(0)} over budget. Small adjustments can get you back on track.`;
    }

    return {
        id: `forecast-${Date.now()}`,
        type: 'forecasting',
        title: 'Budget Forecast',
        message,
        emoji: '⚠️',
        priority,
        severity: 'critical',  // Phase 5: Budget warnings are critical
        value: projectedExcess,
        percentChange: percentOver,
        actionLabel: 'View Budget Tips',
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate anomaly alert
 */
export function generateAnomalyInsight(receipt: Receipt): Insight {
    // Phase 6: Include date context for numerical consistency
    const dateStr = new Date(receipt.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });

    return {
        id: `anomaly-${receipt.id}`,
        type: 'anomaly',
        title: 'Unusual Transaction',
        message: `🚨 We noticed a RM${receipt.amount.toFixed(0)} charge at ${receipt.merchant} on ${dateStr}. Tap to verify or dismiss.`,
        emoji: '🚨',
        priority: 'high',
        severity: 'critical',  // Phase 5: Anomalies require action
        category: receipt.merchantCategory,
        value: receipt.amount,
        actionLabel: 'Verify Transaction',
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate category comparison insight
 */
export function generateCategoryComparisonInsight(
    currentWeekSpending: Record<string, number>,
    categoryAverages: Record<string, number>
): Insight | null {
    let biggestDeviation = { category: '', percentChange: 0, isOver: true };

    Object.entries(currentWeekSpending).forEach(([cat, current]) => {
        const avg = categoryAverages[cat] || current;
        if (avg === 0) return;

        const percentChange = ((current - avg) / avg) * 100;

        if (Math.abs(percentChange) > Math.abs(biggestDeviation.percentChange) && Math.abs(percentChange) > 10) {
            biggestDeviation = {
                category: cat,
                percentChange,
                isOver: percentChange > 0,
            };
        }
    });

    if (Math.abs(biggestDeviation.percentChange) <= 10) return null;

    const direction = biggestDeviation.isOver ? 'above' : 'below';
    const emoji = biggestDeviation.isOver ? '📊' : '✅';

    let message: string;
    if (biggestDeviation.isOver) {
        message = `FYI, your ${biggestDeviation.category} spending is ${Math.abs(biggestDeviation.percentChange).toFixed(0)}% ${direction} your 4-week average. We can help you reduce this.`;
    } else {
        message = `Nice! Your ${biggestDeviation.category} spending is ${Math.abs(biggestDeviation.percentChange).toFixed(0)}% ${direction} your average – great discipline!`;
    }

    return {
        id: `comparison-${Date.now()}`,
        type: 'category_comparison',
        title: 'Spending Trend',
        message,
        emoji,
        priority: biggestDeviation.isOver ? 'medium' : 'low',
        severity: biggestDeviation.isOver ? 'informational' : 'positive',  // Phase 5
        category: biggestDeviation.category,
        percentChange: biggestDeviation.percentChange,
        createdAt: new Date().toISOString(),
    };
}

// ============ MAIN INSIGHT GENERATOR ============

/**
 * Generate all weekly insights for a user
 */
export function generateWeeklyInsights(
    receipts: Receipt[],
    userState: UserInsightsState
): Insight[] {
    const insights: Insight[] = [];
    const now = new Date();

    // Date ranges
    const weekStart = new Date(now);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

    const daysIntoWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Current & last week spending
    const currentWeekSpending = getSpendingByCategory(receipts, weekStart, now);
    const lastWeekSpending = getSpendingByCategory(receipts, lastWeekStart, lastWeekEnd);
    const categoryAverages = getCategoryAverages(receipts);
    const totalCurrentWeek = Object.values(currentWeekSpending).reduce((a, b) => a + b, 0);

    // 1. Motivational insight
    const motivational = generateMotivationalInsight(currentWeekSpending, lastWeekSpending);
    if (motivational) insights.push(motivational);

    // 2. Streak insight
    const streak = generateStreakInsight(userState.streak);
    if (streak) insights.push(streak);

    // 3. Goal progress
    const goalProgress = generateGoalProgressInsight(userState.goals);
    if (goalProgress) insights.push(goalProgress);

    // 4. Forecasting
    const forecast = generateForecastingInsight(totalCurrentWeek, userState.weeklyBudget, daysIntoWeek);
    if (forecast) insights.push(forecast);

    // 5. Anomalies
    const anomalies = detectAnomalies(receipts);
    anomalies.forEach(r => insights.push(generateAnomalyInsight(r)));

    // 6. Category comparison
    const comparison = generateCategoryComparisonInsight(currentWeekSpending, categoryAverages);
    if (comparison) insights.push(comparison);

    // Sort by priority
    const priorityOrder: Record<InsightPriority, number> = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return insights;
}

// ============ STREAK MANAGEMENT ============

/**
 * Update streak based on today's spending
 */
export function updateStreak(
    currentStreak: StreakData,
    todaySpending: number,
    dailyBudget: number
): StreakData {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const isUnderBudget = todaySpending <= dailyBudget;
    const lastUpdate = currentStreak.lastUpdated.split('T')[0];

    // Already updated today
    if (lastUpdate === today) {
        return currentStreak;
    }

    if (isUnderBudget) {
        // Check if streak is continuous
        const isContinuous = lastUpdate === yesterdayStr || currentStreak.currentStreak === 0;

        const newStreak = isContinuous ? currentStreak.currentStreak + 1 : 1;
        const newLongest = Math.max(newStreak, currentStreak.longestStreak);

        return {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastUpdated: new Date().toISOString(),
            streakDates: [...currentStreak.streakDates.slice(-30), today],
        };
    } else {
        // Streak broken
        return {
            currentStreak: 0,
            longestStreak: currentStreak.longestStreak,
            lastUpdated: new Date().toISOString(),
            streakDates: [],
        };
    }
}

// ============ POINTS & BADGES ============

export const BADGES = {
    STREAK_3: { id: 'streak_3', name: '3-Day Streak', emoji: '🔥', points: 30 },
    STREAK_7: { id: 'streak_7', name: 'Week Warrior', emoji: '⚡', points: 100 },
    STREAK_30: { id: 'streak_30', name: 'Budget Master', emoji: '🏆', points: 500 },
    GOAL_REACHED: { id: 'goal_reached', name: 'Goal Getter', emoji: '🎯', points: 200 },
    SAVER: { id: 'saver', name: 'Smart Saver', emoji: '💰', points: 50 },
    FIRST_RECEIPT: { id: 'first_receipt', name: 'Getting Started', emoji: '📝', points: 10 },
} as const;

/**
 * Check and award badges based on achievements
 */
export function checkBadges(
    userState: UserInsightsState,
    receiptsCount: number
): string[] {
    const earnedBadges: string[] = [...userState.badges];

    // Streak badges
    if (userState.streak.currentStreak >= 3 && !earnedBadges.includes(BADGES.STREAK_3.id)) {
        earnedBadges.push(BADGES.STREAK_3.id);
    }
    if (userState.streak.currentStreak >= 7 && !earnedBadges.includes(BADGES.STREAK_7.id)) {
        earnedBadges.push(BADGES.STREAK_7.id);
    }
    if (userState.streak.currentStreak >= 30 && !earnedBadges.includes(BADGES.STREAK_30.id)) {
        earnedBadges.push(BADGES.STREAK_30.id);
    }

    // Goal badge
    const completedGoal = userState.goals.some(g => g.currentAmount >= g.targetAmount);
    if (completedGoal && !earnedBadges.includes(BADGES.GOAL_REACHED.id)) {
        earnedBadges.push(BADGES.GOAL_REACHED.id);
    }

    // First receipt badge
    if (receiptsCount > 0 && !earnedBadges.includes(BADGES.FIRST_RECEIPT.id)) {
        earnedBadges.push(BADGES.FIRST_RECEIPT.id);
    }

    return earnedBadges;
}
