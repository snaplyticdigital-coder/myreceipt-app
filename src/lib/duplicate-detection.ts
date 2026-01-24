/**
 * Duplicate Detection Service
 * Prevents duplicate receipt uploads and detects similar transactions
 */

import type { Receipt } from '../types';

// ============================================
// TYPES
// ============================================

export type DuplicateType = 'exact' | 'likely' | 'potential' | 'unique';

export interface DuplicateResult {
    isDuplicate: boolean;
    type: DuplicateType;
    message: string;
    matchingReceipt?: Receipt;
    confidence: number; // 0-100
}

// ============================================
// HASH GENERATION
// ============================================

/**
 * Generate a unique hash for a receipt based on key fields
 * Used for exact duplicate detection
 */
export function generateReceiptHash(receipt: Partial<Receipt>): string {
    const parts = [
        receipt.merchant?.toLowerCase().trim() || '',
        receipt.date?.split('T')[0] || '', // Just the date part
        receipt.amount?.toFixed(2) || '0',
        receipt.receiptNumber?.toLowerCase().trim() || '',
    ];
    return parts.join('|');
}

/**
 * Generate a fingerprint based on items
 * Used for detecting similar receipts
 */
export function generateItemsFingerprint(receipt: Receipt): string {
    if (!receipt.items || receipt.items.length === 0) {
        return '';
    }

    const itemParts = receipt.items
        .map(item => `${item.name?.toLowerCase().trim()}:${item.qty}:${item.unit.toFixed(2)}`)
        .sort()
        .join(',');

    return itemParts;
}

// ============================================
// DUPLICATE DETECTION
// ============================================

/**
 * Check if a receipt is a duplicate of existing receipts
 */
export function isDuplicateReceipt(
    newReceipt: Partial<Receipt>,
    existingReceipts: Receipt[]
): DuplicateResult {
    // 1. Check for exact receipt number match
    if (newReceipt.receiptNumber) {
        const exactMatch = existingReceipts.find(
            r => r.receiptNumber?.toLowerCase().trim() ===
                newReceipt.receiptNumber?.toLowerCase().trim()
        );

        if (exactMatch) {
            return {
                isDuplicate: true,
                type: 'exact',
                message: `This receipt number already exists (uploaded on ${formatDate(exactMatch.uploadTimestamp)})`,
                matchingReceipt: exactMatch,
                confidence: 100,
            };
        }
    }

    // 2. Check for same merchant + date + amount (likely duplicate)
    const likelyMatch = existingReceipts.find(r =>
        r.merchant?.toLowerCase().trim() === newReceipt.merchant?.toLowerCase().trim() &&
        r.date?.split('T')[0] === newReceipt.date?.split('T')[0] &&
        Math.abs((r.amount || 0) - (newReceipt.amount || 0)) < 0.01
    );

    if (likelyMatch) {
        return {
            isDuplicate: true,
            type: 'likely',
            message: `Similar receipt found: ${likelyMatch.merchant} on ${formatDate(likelyMatch.date)} for the same amount`,
            matchingReceipt: likelyMatch,
            confidence: 90,
        };
    }

    // 3. Check for similar items within 24 hours (potential duplicate)
    if (newReceipt.items && newReceipt.items.length > 0) {
        const newFingerprint = generateItemsFingerprint(newReceipt as Receipt);
        const newDate = new Date(newReceipt.date || Date.now());

        const potentialMatch = existingReceipts.find(r => {
            const existingDate = new Date(r.date);
            const hoursDiff = Math.abs(newDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60);

            if (hoursDiff > 24) return false;

            const existingFingerprint = generateItemsFingerprint(r);
            return existingFingerprint === newFingerprint && newFingerprint !== '';
        });

        if (potentialMatch) {
            return {
                isDuplicate: true,
                type: 'potential',
                message: `Receipt with identical items found within 24 hours. Please verify this isn't a duplicate.`,
                matchingReceipt: potentialMatch,
                confidence: 70,
            };
        }
    }

    // 4. No duplicates found
    return {
        isDuplicate: false,
        type: 'unique',
        message: 'Receipt is unique',
        confidence: 0,
    };
}

/**
 * Find similar transactions (not exact duplicates, but worth reviewing)
 */
export function findSimilarTransactions(
    receipt: Receipt,
    existingReceipts: Receipt[],
    options: { daysWindow?: number; amountTolerance?: number } = {}
): Receipt[] {
    const { daysWindow = 7, amountTolerance = 0.2 } = options;

    const receiptDate = new Date(receipt.date);
    const windowMs = daysWindow * 24 * 60 * 60 * 1000;

    return existingReceipts.filter(r => {
        if (r.id === receipt.id) return false;

        const existingDate = new Date(r.date);
        const timeDiff = Math.abs(receiptDate.getTime() - existingDate.getTime());

        if (timeDiff > windowMs) return false;

        // Same merchant
        if (r.merchant?.toLowerCase().trim() !== receipt.merchant?.toLowerCase().trim()) {
            return false;
        }

        // Similar amount (within tolerance)
        const amountDiff = Math.abs(r.amount - receipt.amount) / receipt.amount;
        return amountDiff <= amountTolerance;
    });
}

// ============================================
// HELPERS
// ============================================

function formatDate(dateString?: string): string {
    if (!dateString) return 'unknown date';
    try {
        return new Date(dateString).toLocaleDateString('en-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

/**
 * Get user-friendly message for duplicate detection result
 */
export function getDuplicateWarningMessage(result: DuplicateResult): string | null {
    if (!result.isDuplicate) return null;

    switch (result.type) {
        case 'exact':
            return `⛔ Duplicate Receipt: ${result.message}`;
        case 'likely':
            return `⚠️ Possible Duplicate: ${result.message}`;
        case 'potential':
            return `ℹ️ Similar Receipt Found: ${result.message}`;
        default:
            return null;
    }
}

/**
 * Determine if upload should be blocked based on duplicate result
 */
export function shouldBlockUpload(result: DuplicateResult): boolean {
    return result.type === 'exact';
}
