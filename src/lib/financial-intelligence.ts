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
                const daysDiff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
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

// ============================================
// MANGLISH COPY ENGINE
// ============================================

// Define types for templates structure
type TemplateCategory = {
    titles: string[];
    descriptions: string[];
};

type SeverityMap = {
    positive?: TemplateCategory;
    warning?: TemplateCategory;
    alert?: TemplateCategory;
};

// Typed templates object
const MANGLISH_TEMPLATES: Record<'anomaly' | 'subscription' | 'burnRate', SeverityMap> = {
    anomaly: {
        positive: {
            titles: ["Steady Boss!", "Fuyoh Jimat!", "Power Lah!", "Tabung Gajah", "Jimat Kaw Kaw"],
            descriptions: [
                "Wah, your {category} spending steady lah - {percent}% below average!",
                "See? Can save one. {category} down {percent}% this month. Belanja makan?",
                "Not bad boss, {category} spending dropped {percent}%. Keep it up!",
                "Your wallet is smiling. {category} spending is {percent}% lower than usual."
            ]
        },
        warning: {
            titles: ["Eh Boss...", "Watch Out", "Slow Down Sikit", "Spending Naik", "Ayam Warning"],
            descriptions: [
                "Your {category} spending {percent}% higher than usual. Control sikit boss.",
                "Spending on {category} went up {percent}%. Check balik receipt tu.",
                "Eh, {category} spending trending up {percent}%. Don't play play.",
                "Just a heads up, {category} is {percent}% above your average."
            ]
        },
        alert: {
            titles: ["Alamak!", "Kantoi!", "GG Boss", "Dompet Bocor", "Over Budget Weh"],
            descriptions: [
                "Woi! {category} spending up {percent}% from usual! What did you buy?!",
                "Eh boss, {category} spending spike {percent}%! Check sikit, takut fraud.",
                "Dompet crying already. {category} is {percent}% higher than average.",
                "Serious lah? {category} limit pecah {percent}%. Slow down or pokai later."
            ]
        }
    },
    subscription: {
        warning: {
            titles: ["Subscription Bocor?", "Ghost Charge?", "Recurring Alert", "Check Please"],
            descriptions: [
                "Eh, you spent RM{amount} at {merchant} {count}x recently. Subscription bocor ke?",
                "Detected {count}x payments to {merchant}. If not using, better cancel boss.",
                "Is this intentional? {merchant} charged you RM{amount} for {count} times already.",
                "Check your {merchant} bill. {count} transactions spotted. Jangan bagi free money."
            ]
        }
    },
    burnRate: {
        positive: {
            titles: ["Budget On Track", "Ngam Ngam", "Safety Zone", "Steady Flow"],
            descriptions: [
                "Steady boss! Projecting {percent}% budget usage. You can survive this month.",
                "On track to clear the month with money left. {percent}% budget usage projected.",
                "Safe zone! Only using {percent}% of budget if you keep going like this."
            ]
        },
        warning: {
            titles: ["Budget Lari Sikit", "Yellow Zone", "Hati-Hati", "Speeding Ticket"],
            descriptions: [
                "On track to use {percent}% of your budget. {days} days left, control sikit.",
                "You are using budget faster than usual. Projected {percent}% usage.",
                "Careful boss, burning cash quite fast. {percent}% budget usage projected."
            ]
        },
        alert: {
            titles: ["Budget Pecah!", "Confirm Pokai", "Red Alert", "SOS Boss"],
            descriptions: [
                "If keep spending like this, confirm pokai. {percent}% over budget projected!",
                "Stop! You are projected to hit {percent}% over budget! Makan maggi la next week.",
                "Gaji belum masuk, budget already crying. {percent}% over budget alerts.",
                "Emergency! Burn rate too high. Projected to busted budget by {percent}%."
            ]
        }
    }
};

function getRandomTemplate(type: 'anomaly' | 'subscription' | 'burnRate', severity: 'positive' | 'warning' | 'alert', data: any): { title: string, description: string } {
    const templates = MANGLISH_TEMPLATES[type]?.[severity];
    if (!templates) return { title: "Update", description: "New insight available." };

    const title = templates.titles[Math.floor(Math.random() * templates.titles.length)];
    let description = templates.descriptions[Math.floor(Math.random() * templates.descriptions.length)];

    // Replace placeholders
    Object.keys(data).forEach(key => {
        description = description.replace(`{${key}}`, data[key]);
        // Handle lowercase variant for category if passed specifically, though regex is better usually, simple replace works if matched exactly
        if (key === 'category') {
            description = description.replace(`{category}`, data[key].toLowerCase()); // Fallback if casing matters
        }
    });

    return { title, description };
}

export function generateAdvisories(
    receipts: Receipt[],
    budget: Budget
): Advisory[] {
    const advisories: Advisory[] = [];

    // 1. Anomaly Detection Advisories
    const anomalies = detectCategoryAnomalies(receipts);

    anomalies.slice(0, 3).forEach((anomaly, index) => {
        const { category, currentAmount, rollingAverage, percentDiff, isAboveAverage } = anomaly;

        const severity = !isAboveAverage ? 'positive' : (percentDiff >= 30 ? 'alert' : 'warning');
        const templateData = {
            category: category,
            percent: Math.abs(percentDiff).toFixed(0),
            amount: currentAmount.toFixed(0)
        };

        const { title, description } = getRandomTemplate('anomaly', severity, templateData);

        advisories.push({
            id: `anomaly-${severity}-${index}`,
            type: 'anomaly',
            severity: severity,
            title: title,
            description: description,
            metric: {
                current: currentAmount,
                comparison: rollingAverage,
                percentDiff,
            },
            category,
            icon: severity === 'positive' ? '💪' : (severity === 'alert' ? '📈' : '👀'),
        });
    });

    // 2. Subscription Leak Guard Advisories
    const subscriptions = detectRecurringPatterns(receipts);

    subscriptions.slice(0, 2).forEach((sub, index) => {
        const templateData = {
            merchant: sub.merchant,
            amount: sub.amount.toFixed(0),
            count: sub.occurrences
        };
        const { title, description } = getRandomTemplate('subscription', 'warning', templateData);

        advisories.push({
            id: `subscription-${index}`,
            type: 'subscription',
            severity: 'warning',
            title: title,
            description: description,
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
        let severity: 'positive' | 'warning' | 'alert' = 'positive';

        if (burnRate.percentOfBudget > 100) severity = 'alert';
        else if (burnRate.percentOfBudget > 85) severity = 'warning';

        const templateData = {
            percent: burnRate.percentOfBudget.toFixed(0),
            days: burnRate.daysRemaining,
            over: (burnRate.percentOfBudget - 100).toFixed(0)
        };

        // Special handling for over budget to show "over %" not "usage %" if we want, 
        // but current templates use "usage" or "over" contextually.
        // Let's standardise passing the main % and let template decide context.
        // For alert 'over budget', we might pass the surplus.
        if (severity === 'alert') {
            templateData.percent = (burnRate.percentOfBudget - 100).toFixed(0);
            // Update template logic to expect "over amount" or "total usage"?
            // The alert templates say "{percent}% over budget". So we pass the SURPLUS.
        }

        const { title, description } = getRandomTemplate('burnRate', severity, templateData);

        advisories.push({
            id: `burn-rate-${severity}`,
            type: 'burn-rate',
            severity: severity,
            title: title,
            description: description,
            metric: {
                current: burnRate.currentSpent,
                comparison: burnRate.budgetTotal,
                percentDiff: burnRate.percentOfBudget - 100,
            },
            icon: severity === 'alert' ? '🔥' : (severity === 'warning' ? '⚡' : '✅'),
        });
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
