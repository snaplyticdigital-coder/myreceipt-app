/**
 * Data Validation Service
 * Data integrity validation for receipts and transactions
 * 
 * Any mismatch is treated as a blocking error
 */

import type { Receipt, LineItem } from '../types';
import { calculateItemsTotal } from './calculations';

// ============================================
// VALIDATION TYPES
// ============================================

export interface DataValidationResult {
    valid: boolean;
    errors: DataValidationError[];
}

export interface DataValidationError {
    type: 'ITEM_TOTAL_MISMATCH' | 'NEGATIVE_AMOUNT' | 'MISSING_REQUIRED' | 'INVALID_DATE';
    message: string;
    expected?: number;
    actual?: number;
    field?: string;
}

// Tolerance for floating point comparisons (0.01 = 1 cent)
const TOLERANCE = 0.01;

// ============================================
// RECEIPT VALIDATION
// ============================================

/**
 * Validate a receipt's data integrity
 * Returns errors if sum of items doesn't match total, etc.
 */
export function validateReceiptIntegrity(receipt: Receipt): DataValidationResult {
    const errors: DataValidationError[] = [];

    // 1. Check required fields
    if (!receipt.id) {
        errors.push({
            type: 'MISSING_REQUIRED',
            message: 'Receipt ID is required',
            field: 'id',
        });
    }

    if (!receipt.userId) {
        errors.push({
            type: 'MISSING_REQUIRED',
            message: 'User ID is required',
            field: 'userId',
        });
    }

    if (!receipt.merchant) {
        errors.push({
            type: 'MISSING_REQUIRED',
            message: 'Merchant name is required',
            field: 'merchant',
        });
    }

    if (!receipt.date) {
        errors.push({
            type: 'MISSING_REQUIRED',
            message: 'Date is required',
            field: 'date',
        });
    }

    // 2. Check for negative amounts
    if (receipt.amount < 0) {
        errors.push({
            type: 'NEGATIVE_AMOUNT',
            message: 'Receipt amount cannot be negative',
            actual: receipt.amount,
            field: 'amount',
        });
    }

    // 3. Validate date format
    const parsedDate = new Date(receipt.date);
    if (isNaN(parsedDate.getTime())) {
        errors.push({
            type: 'INVALID_DATE',
            message: 'Invalid date format',
            field: 'date',
        });
    }

    // 4. Validate items total matches receipt amount (if items exist)
    if (receipt.items && receipt.items.length > 0) {
        const itemsTotal = calculateItemsTotal(receipt.items);
        const difference = Math.abs(itemsTotal - receipt.amount);

        if (difference > TOLERANCE) {
            errors.push({
                type: 'ITEM_TOTAL_MISMATCH',
                message: `Sum of items (${itemsTotal.toFixed(2)}) doesn't match receipt amount (${receipt.amount.toFixed(2)})`,
                expected: receipt.amount,
                actual: itemsTotal,
            });
        }
    }

    // 5. Validate each line item
    for (const item of receipt.items || []) {
        const itemErrors = validateLineItemIntegrity(item);
        errors.push(...itemErrors);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate a line item
 */
export function validateLineItemIntegrity(item: LineItem): DataValidationError[] {
    const errors: DataValidationError[] = [];

    if (!item.name) {
        errors.push({
            type: 'MISSING_REQUIRED',
            message: 'Item name is required',
            field: 'name',
        });
    }

    if (item.qty <= 0) {
        errors.push({
            type: 'NEGATIVE_AMOUNT',
            message: 'Item quantity must be positive',
            actual: item.qty,
            field: 'qty',
        });
    }

    if (item.unit < 0) {
        errors.push({
            type: 'NEGATIVE_AMOUNT',
            message: 'Item unit price cannot be negative',
            actual: item.unit,
            field: 'unit',
        });
    }

    return errors;
}

// ============================================
// CONSISTENCY CHECKS
// ============================================

/**
 * Verify that a calculated total matches expected value
 * Used to ensure UI values match stored data
 */
export function verifyTotalConsistency(
    calculated: number,
    expected: number,
    context: string
): DataValidationResult {
    const difference = Math.abs(calculated - expected);

    if (difference > TOLERANCE) {
        return {
            valid: false,
            errors: [{
                type: 'ITEM_TOTAL_MISMATCH',
                message: `${context}: Calculated (${calculated.toFixed(2)}) doesn't match expected (${expected.toFixed(2)})`,
                expected,
                actual: calculated,
            }],
        };
    }

    return { valid: true, errors: [] };
}

/**
 * Assert data consistency - logs error if invalid
 * Use this for critical validation that should never fail
 */
export function assertDataConsistency(result: DataValidationResult, context: string): void {
    if (!result.valid) {
        console.error(`[DATA CONSISTENCY ERROR] ${context}:`, result.errors);
        // In production, this would log to monitoring service
    }
}
