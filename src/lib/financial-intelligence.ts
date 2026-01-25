/**
 * Financial Intelligence Engine
 *
 * Prescriptive advisor using ONLY captured transaction metadata:
 * - Merchant Name
 * - Category (Spending/Merchant)
 * - Transaction Amount
 * - Date/Frequency
 *
 * NO LHDN tax logic, NO external data, NO location-based insights
 */

import type { Receipt, Budget } from '../types';

// ============================================
// TYPES
// ============================================

export type AdvisoryType = 'anomaly' | 'subscription' | 'burn-rate';
export type AdvisorySeverity = 'positive' | 'warning' | 'alert';

export interface Advisory {
    id: string;
    type: AdvisoryType;
    severity: AdvisorySeverity;
    title: string;
    description: string;
    metric?: {
        current: number;
        comparison: number;
        percentDiff: number;
    };
    category?: string;
    merchant?: string;
    icon: string;
}

export interface RecurringPattern {
    merchant: string;
    amount: number;
    occurrences: number;
    dates: string[];
    isLikelySubscription: boolean;
}

export interface BurnRateProjection {
    currentSpent: number;
    projectedMonthEnd: number;
    budgetTotal: number;
    percentOfBudget: number;
    daysElapsed: number;
    daysRemaining: number;
    dailyBurnRate: number;
}

// ============================================
// HELPERS
// ============================================

function getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getReceiptsInRange(receipts: Receipt[], startDate: Date, endDate: Date): Receipt[] {
    return receipts.filter(r => {
        const receiptDate = new Date(r.date);
        return receiptDate >= startDate && receiptDate <= endDate;
    });
}

// ============================================
// ANOMALY DETECTION
// Compare current category spend vs 3-month rolling average
// ============================================

interface CategoryAnomaly {
    category: string;
    currentAmount: number;
    rollingAverage: number;
    percentDiff: number;
    isAboveAverage: boolean;
}

function calculateRollingAverage(
    receipts: Receipt[],
    category: string,
    monthsBack: number = 3
): number {
    const now = new Date();
    const totals: number[] = [];

    for (let i = 1; i <= monthsBack; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthReceipts = getReceiptsInRange(receipts, monthStart, monthEnd);
        const categoryTotal = monthReceipts
            .filter(r => r.spendingCategory === category)
            .reduce((sum, r) => sum + r.amount, 0);

        totals.push(categoryTotal);
    }

    // Only calculate average if we have data
    const nonZeroTotals = totals.filter(t => t > 0);
    if (nonZeroTotals.length === 0) return 0;

    return nonZeroTotals.reduce((a, b) => a + b, 0) / nonZeroTotals.length;
}

export function detectCategoryAnomalies(receipts: Receipt[]): CategoryAnomaly[] {
    const now = new Date();
    const monthStart = getMonthStart(now);
    const monthEnd = getMonthEnd(now);

    // Get current month receipts
    const currentMonthReceipts = getReceiptsInRange(receipts, monthStart, monthEnd);

    // Group by spending category
    const currentByCategory: Record<string, number> = {};
    currentMonthReceipts.forEach(r => {
        currentByCategory[r.spendingCategory] =
            (currentByCategory[r.spendingCategory] || 0) + r.amount;
    });

    const anomalies: CategoryAnomaly[] = [];

    for (const [category, currentAmount] of Object.entries(currentByCategory)) {
        const rollingAverage = calculateRollingAverage(receipts, category);

        // Skip if no historical data
        if (rollingAverage === 0) continue;

        const percentDiff = ((currentAmount - rollingAverage) / rollingAverage) * 100;

        // Only flag significant anomalies (±15% or more)
        if (Math.abs(percentDiff) >= 15) {
            anomalies.push({
                category,
                currentAmount,
                rollingAverage,
                percentDiff,
                isAboveAverage: percentDiff > 0,
            });
        }
    }

    // Sort by absolute difference (most significant first)
    return anomalies.sort((a, b) => Math.abs(b.percentDiff) - Math.abs(a.percentDiff));
}

// ============================================
// SUBSCRIPTION LEAK GUARD
// Detect recurring merchant+amount pairs
// ============================================

export function detectRecurringPatterns(receipts: Receipt[]): RecurringPattern[] {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    // Get last 3 months of receipts
    const recentReceipts = getReceiptsInRange(receipts, threeMonthsAgo, now);

    // Group by merchant + amount (rounded to nearest RM)
    const patterns: Record<string, { merchant: string; amount: number; dates: string[] }> = {};

    recentReceipts.forEach(r => {
        // Round to nearest RM for grouping (handles small variations)
        const roundedAmount = Math.round(r.amount);
        const key = `${r.merchant.toLowerCase()}_${roundedAmount}`;

        if (!patterns[key]) {
            patterns[key] = {
                merchant: r.merchant,
                amount: roundedAmount,
                dates: [],
            };
        }
        patterns[key].dates.push(r.date);
    });

    // Filter for recurring (3+ occurrences)
    const recurring: RecurringPattern[] = [];

    for (const pattern of Object.values(patterns)) {
        if (pattern.dates.length >= 3) {
            // Check if dates are roughly monthly (within 35 days apart)
            const sortedDates = pattern.dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
            let isMonthlyPattern = true;

            for (let i = 1; i < sortedDates.length; i++) {
                const daysDiff = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
                if (daysDiff > 35) {
                    isMonthlyPattern = false;
                    break;
                }
            }

            recurring.push({
                merchant: pattern.merchant,
                amount: pattern.amount,
                occurrences: pattern.dates.length,
                dates: pattern.dates,
                isLikelySubscription: isMonthlyPattern && pattern.amount >= 10, // Min RM10
            });
        }
    }

    // Sort by occurrence count
    return recurring
        .filter(r => r.isLikelySubscription)
        .sort((a, b) => b.occurrences - a.occurrences);
}

// ============================================
// BURN RATE PROJECTION
// Project month-end total based on current velocity vs budget
// ============================================

export function calculateBurnRate(receipts: Receipt[], budget: Budget): BurnRateProjection {
    const now = new Date();
    const monthStart = getMonthStart(now);

    const currentMonthReceipts = getReceiptsInRange(receipts, monthStart, now);
    const currentSpent = currentMonthReceipts.reduce((sum, r) => sum + r.amount, 0);

    const daysInMonth = getDaysInMonth(now);
    const daysElapsed = now.getDate();
    const daysRemaining = daysInMonth - daysElapsed;

    // Daily burn rate based on current spending
    const dailyBurnRate = daysElapsed > 0 ? currentSpent / daysElapsed : 0;

    // Project to end of month
    const projectedMonthEnd = currentSpent + (dailyBurnRate * daysRemaining);

    const budgetTotal = budget.total || 0;
    const percentOfBudget = budgetTotal > 0 ? (projectedMonthEnd / budgetTotal) * 100 : 0;

    return {
        currentSpent,
        projectedMonthEnd,
        budgetTotal,
        percentOfBudget,
        daysElapsed,
        daysRemaining,
        dailyBurnRate,
    };
}

// ============================================
// GENERATE ADVISORIES (Manglish Copy)
// ============================================

export function generateAdvisories(
    receipts: Receipt[],
    budget: Budget
): Advisory[] {
    const advisories: Advisory[] = [];

    // 1. Anomaly Detection Advisories
    const anomalies = detectCategoryAnomalies(receipts);

    anomalies.slice(0, 3).forEach((anomaly, index) => {
        const { category, currentAmount, rollingAverage, percentDiff, isAboveAverage } = anomaly;

        if (!isAboveAverage) {
            // Positive - spending below average
            advisories.push({
                id: `anomaly-positive-${index}`,
                type: 'anomaly',
                severity: 'positive',
                title: `${category} Game Strong`,
                description: `Wah, your ${category.toLowerCase()} spending steady lah - ${Math.abs(percentDiff).toFixed(0)}% below your 3-month average!`,
                metric: {
                    current: currentAmount,
                    comparison: rollingAverage,
                    percentDiff,
                },
                category,
                icon: '💪',
            });
        } else if (percentDiff >= 30) {
            // Alert - significantly above average
            advisories.push({
                id: `anomaly-alert-${index}`,
                type: 'anomaly',
                severity: 'alert',
                title: `${category} Naik`,
                description: `Eh boss, ${category.toLowerCase()} spending up ${percentDiff.toFixed(0)}% from usual this month. Check sikit?`,
                metric: {
                    current: currentAmount,
                    comparison: rollingAverage,
                    percentDiff,
                },
                category,
                icon: '📈',
            });
        } else {
            // Warning - moderately above average
            advisories.push({
                id: `anomaly-warning-${index}`,
                type: 'anomaly',
                severity: 'warning',
                title: `${category} Trending Up`,
                description: `Your ${category.toLowerCase()} spending ${percentDiff.toFixed(0)}% higher than your 3-month average.`,
                metric: {
                    current: currentAmount,
                    comparison: rollingAverage,
                    percentDiff,
                },
                category,
                icon: '👀',
            });
        }
    });

    // 2. Subscription Leak Guard Advisories
    const subscriptions = detectRecurringPatterns(receipts);

    subscriptions.slice(0, 2).forEach((sub, index) => {
        advisories.push({
            id: `subscription-${index}`,
            type: 'subscription',
            severity: 'warning',
            title: 'Subscription Spotted',
            description: `Eh, you spent RM${sub.amount} at ${sub.merchant} ${sub.occurrences}x recently - subscription bocor ke?`,
            metric: {
                current: sub.amount * sub.occurrences,
                comparison: sub.amount,
                percentDiff: 0,
            },
            merchant: sub.merchant,
            icon: '🔄',
        });
    });

    // 3. Burn Rate Projection Advisory
    const burnRate = calculateBurnRate(receipts, budget);

    if (burnRate.budgetTotal > 0 && burnRate.daysElapsed >= 5) {
        if (burnRate.percentOfBudget > 100) {
            const overPercent = burnRate.percentOfBudget - 100;
            advisories.push({
                id: 'burn-rate-alert',
                type: 'burn-rate',
                severity: 'alert',
                title: 'Budget Alert',
                description: `If you keep spending like this, you'll hit RM${burnRate.projectedMonthEnd.toLocaleString('en-MY', { maximumFractionDigits: 0 })} by month-end - that's ${overPercent.toFixed(0)}% over budget bro.`,
                metric: {
                    current: burnRate.currentSpent,
                    comparison: burnRate.budgetTotal,
                    percentDiff: burnRate.percentOfBudget - 100,
                },
                icon: '🔥',
            });
        } else if (burnRate.percentOfBudget > 85) {
            advisories.push({
                id: 'burn-rate-warning',
                type: 'burn-rate',
                severity: 'warning',
                title: 'Budget Heads Up',
                description: `On track to use ${burnRate.percentOfBudget.toFixed(0)}% of your monthly budget. ${burnRate.daysRemaining} days left to go.`,
                metric: {
                    current: burnRate.currentSpent,
                    comparison: burnRate.budgetTotal,
                    percentDiff: burnRate.percentOfBudget - 100,
                },
                icon: '⚡',
            });
        } else if (burnRate.percentOfBudget <= 70) {
            advisories.push({
                id: 'burn-rate-positive',
                type: 'burn-rate',
                severity: 'positive',
                title: 'Budget On Track',
                description: `Steady boss! Projecting ${burnRate.percentOfBudget.toFixed(0)}% budget usage this month. Keep it up!`,
                metric: {
                    current: burnRate.currentSpent,
                    comparison: burnRate.budgetTotal,
                    percentDiff: burnRate.percentOfBudget - 100,
                },
                icon: '✅',
            });
        }
    }

    // Sort: alerts first, then warnings, then positive
    const severityOrder: Record<AdvisorySeverity, number> = {
        'alert': 0,
        'warning': 1,
        'positive': 2,
    };

    return advisories.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ============================================
// SPENDING VELOCITY (for UI display)
// ============================================

export function getSpendingVelocity(receipts: Receipt[]): {
    dailyAverage: number;
    weeklyAverage: number;
    trend: 'up' | 'down' | 'stable';
    trendPercent: number;
} {
    const now = new Date();
    const monthStart = getMonthStart(now);

    // This week (Monday-based)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Last week
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);

    const thisWeekReceipts = getReceiptsInRange(receipts, weekStart, now);
    const lastWeekReceipts = getReceiptsInRange(receipts, lastWeekStart, lastWeekEnd);

    const thisWeekTotal = thisWeekReceipts.reduce((sum, r) => sum + r.amount, 0);
    const lastWeekTotal = lastWeekReceipts.reduce((sum, r) => sum + r.amount, 0);

    // Daily average this month
    const monthReceipts = getReceiptsInRange(receipts, monthStart, now);
    const monthTotal = monthReceipts.reduce((sum, r) => sum + r.amount, 0);
    const daysElapsed = Math.max(1, now.getDate());

    const dailyAverage = monthTotal / daysElapsed;
    const weeklyAverage = dailyAverage * 7;

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercent = 0;

    if (lastWeekTotal > 0) {
        trendPercent = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
        if (trendPercent > 10) trend = 'up';
        else if (trendPercent < -10) trend = 'down';
    }

    return {
        dailyAverage,
        weeklyAverage,
        trend,
        trendPercent,
    };
}
