/**
 * Calculations Service
 * SINGLE SOURCE OF TRUTH for all financial calculations
 * 
 * All components MUST use these functions - no independent calculations allowed
 */

import type { Receipt, LineItem, SpendingCategory, LhdnTag } from '../types';

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate total from line items
 * This is the authoritative way to compute item totals
 */
export function calculateItemsTotal(items: LineItem[]): number {
    return items.reduce((sum, item) => sum + (item.qty * item.unit), 0);
}

/**
 * Calculate receipt total from its items
 * Used for validation - should match receipt.amount
 */
export function calculateReceiptItemsTotal(receipt: Receipt): number {
    return calculateItemsTotal(receipt.items);
}

/**
 * Calculate total spending for a period
 * @param receipts - Array of receipts to sum
 * @param startDate - Start of period (inclusive)
 * @param endDate - End of period (inclusive)
 */
export function calculatePeriodSpending(
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
 * Get receipts for a specific period
 */
export function getReceiptsForPeriod(
    receipts: Receipt[],
    startDate: Date,
    endDate: Date
): Receipt[] {
    return receipts.filter(r => {
        const date = new Date(r.date);
        return date >= startDate && date <= endDate;
    });
}

// ============================================
// WEEK CALCULATIONS
// ============================================

/**
 * Get start of current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay() + 1); // Monday
    start.setHours(0, 0, 0, 0);
    return start;
}

/**
 * Get end of current week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday
    end.setHours(23, 59, 59, 999);
    return end;
}

/**
 * Calculate this week's total spending
 */
export function calculateWeekTotal(receipts: Receipt[]): number {
    return calculatePeriodSpending(receipts, getWeekStart(), getWeekEnd());
}

/**
 * Calculate last week's total spending
 */
export function calculateLastWeekTotal(receipts: Receipt[]): number {
    const lastWeekStart = new Date(getWeekStart());
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(getWeekEnd());
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    return calculatePeriodSpending(receipts, lastWeekStart, lastWeekEnd);
}

/**
 * Get receipts for this week
 */
export function getWeekReceipts(receipts: Receipt[]): Receipt[] {
    return getReceiptsForPeriod(receipts, getWeekStart(), getWeekEnd());
}

// ============================================
// DAY CALCULATIONS
// ============================================

/**
 * Get start of today
 */
export function getDayStart(date: Date = new Date()): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}

/**
 * Get end of today
 */
export function getDayEnd(date: Date = new Date()): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
}

/**
 * Calculate today's total spending
 */
export function calculateDayTotal(receipts: Receipt[]): number {
    return calculatePeriodSpending(receipts, getDayStart(), getDayEnd());
}

/**
 * Calculate yesterday's total spending
 */
export function calculateLastDayTotal(receipts: Receipt[]): number {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return calculatePeriodSpending(receipts, getDayStart(yesterday), getDayEnd(yesterday));
}

/**
 * Get receipts for today
 */
export function getDayReceipts(receipts: Receipt[]): Receipt[] {
    return getReceiptsForPeriod(receipts, getDayStart(), getDayEnd());
}

/**
 * Calculate day-over-day difference
 */
export function calculateDayDifference(receipts: Receipt[]): {
    difference: number;
    isDown: boolean;
} {
    const today = calculateDayTotal(receipts);
    const yesterday = calculateLastDayTotal(receipts);
    const difference = today - yesterday;
    return {
        difference: Math.abs(difference),
        isDown: difference <= 0,
    };
}

// ============================================
// MONTH CALCULATIONS
// ============================================

/**
 * Get start of current month
 */
export function getMonthStart(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Get end of current month
 */
export function getMonthEnd(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Calculate this month's total spending
 */
export function calculateMonthTotal(receipts: Receipt[]): number {
    return calculatePeriodSpending(receipts, getMonthStart(), getMonthEnd());
}

/**
 * Get receipts for this month
 */
export function getMonthReceipts(receipts: Receipt[]): Receipt[] {
    return getReceiptsForPeriod(receipts, getMonthStart(), getMonthEnd());
}

/**
 * Calculate last month's total spending
 */
export function calculateLastMonthTotal(receipts: Receipt[]): number {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return calculatePeriodSpending(receipts, getMonthStart(lastMonth), getMonthEnd(lastMonth));
}

/**
 * Calculate month-over-month difference
 */
export function calculateMonthDifference(receipts: Receipt[]): {
    difference: number;
    isDown: boolean;
} {
    const thisMonth = calculateMonthTotal(receipts);
    const lastMonth = calculateLastMonthTotal(receipts);
    const difference = thisMonth - lastMonth;
    return {
        difference: Math.abs(difference),
        isDown: difference <= 0,
    };
}

// ============================================
// CATEGORY BREAKDOWN
// ============================================

export interface CategoryBreakdown {
    category: SpendingCategory;
    amount: number;
    count: number;
    percentage: number;
}

/**
 * Calculate spending breakdown by category
 */
export function calculateCategoryBreakdown(receipts: Receipt[]): CategoryBreakdown[] {
    const total = receipts.reduce((sum, r) => sum + r.amount, 0);

    const categoryMap = new Map<SpendingCategory, { amount: number; count: number }>();

    for (const receipt of receipts) {
        const existing = categoryMap.get(receipt.spendingCategory) || { amount: 0, count: 0 };
        categoryMap.set(receipt.spendingCategory, {
            amount: existing.amount + receipt.amount,
            count: existing.count + 1,
        });
    }

    return Array.from(categoryMap.entries())
        .map(([category, data]) => ({
            category,
            amount: data.amount,
            count: data.count,
            percentage: total > 0 ? (data.amount / total) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
}

// ============================================
// TAX CALCULATIONS
// ============================================

export interface TaxBreakdown {
    tag: LhdnTag;
    amount: number;
    itemCount: number;
}

/**
 * Calculate tax-claimable amounts by LHDN tag
 */
export function calculateTaxClaimable(receipts: Receipt[]): TaxBreakdown[] {
    const tagMap = new Map<LhdnTag, { amount: number; count: number }>();

    for (const receipt of receipts) {
        for (const item of receipt.items) {
            if (item.claimable && item.tag) {
                const existing = tagMap.get(item.tag) || { amount: 0, count: 0 };
                tagMap.set(item.tag, {
                    amount: existing.amount + (item.qty * item.unit),
                    count: existing.count + 1,
                });
            }
        }
    }

    return Array.from(tagMap.entries())
        .map(([tag, data]) => ({
            tag,
            amount: data.amount,
            itemCount: data.count,
        }))
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate total tax-claimable amount
 */
export function calculateTotalClaimable(receipts: Receipt[]): number {
    return receipts.reduce((sum, receipt) => {
        const claimableItems = receipt.items.filter(item => item.claimable);
        return sum + calculateItemsTotal(claimableItems);
    }, 0);
}

// ============================================
// BUDGET CALCULATIONS
// ============================================

/**
 * Calculate budget usage percentage
 */
export function calculateBudgetPercentage(spent: number, budget: number): number {
    if (budget <= 0) return 0;
    return Math.round((spent / budget) * 100);
}

/**
 * Calculate week-over-week difference
 */
export function calculateWeekDifference(receipts: Receipt[]): {
    difference: number;
    isDown: boolean;
} {
    const thisWeek = calculateWeekTotal(receipts);
    const lastWeek = calculateLastWeekTotal(receipts);
    const difference = thisWeek - lastWeek;
    return {
        difference: Math.abs(difference),
        isDown: difference <= 0,
    };
}

// ============================================
// STATISTICS
// ============================================

/**
 * Calculate average transaction amount
 */
export function calculateAverageTransaction(receipts: Receipt[]): number {
    if (receipts.length === 0) return 0;
    const total = receipts.reduce((sum, r) => sum + r.amount, 0);
    return total / receipts.length;
}

/**
 * Count items across all receipts
 */
export function countTotalItems(receipts: Receipt[]): number {
    return receipts.reduce((sum, r) => sum + (r.items?.length || 1), 0);
}
