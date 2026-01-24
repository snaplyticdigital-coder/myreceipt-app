/**
 * Receipts Service
 * Firestore CRUD operations for receipts
 */

import {
    db,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    timestampToISO,
    receiptsCollection
} from '../lib/firebase';
import type { Receipt, LineItem } from '../types';

/**
 * Generate a unique receipt ID
 */
function generateReceiptId(): string {
    return `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new receipt in Firestore
 */
export async function createReceipt(
    userId: string,
    data: Omit<Receipt, 'id' | 'userId' | 'uploadTimestamp' | 'verificationStatus'>
): Promise<Receipt> {
    const receiptId = generateReceiptId();
    const receiptRef = doc(db, 'receipts', receiptId);

    const newReceipt = {
        id: receiptId,
        userId,
        ...data,
        uploadTimestamp: serverTimestamp(),
        verificationStatus: 'pending' as const,
        // Ensure items have receiptId
        items: data.items.map((item, index) => ({
            ...item,
            id: item.id || `${receiptId}_item_${index}`,
            receiptId
        }))
    };

    await setDoc(receiptRef, newReceipt);

    return {
        ...newReceipt,
        uploadTimestamp: new Date().toISOString()
    } as Receipt;
}

/**
 * Get all receipts for a user
 */
export async function getReceipts(userId: string): Promise<Receipt[]> {
    const q = query(
        receiptsCollection,
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            date: typeof data.date === 'object' ? timestampToISO(data.date) : data.date,
            uploadTimestamp: timestampToISO(data.uploadTimestamp)
        } as Receipt;
    });
}

/**
 * Get a single receipt by ID
 */
export async function getReceipt(receiptId: string): Promise<Receipt | null> {
    const receiptRef = doc(db, 'receipts', receiptId);
    const receiptSnap = await getDoc(receiptRef);

    if (!receiptSnap.exists()) {
        return null;
    }

    const data = receiptSnap.data();
    return {
        ...data,
        id: receiptId,
        date: typeof data.date === 'object' ? timestampToISO(data.date) : data.date,
        uploadTimestamp: timestampToISO(data.uploadTimestamp)
    } as Receipt;
}

/**
 * Update a receipt
 * Note: rawOcrText is immutable and should not be updated
 */
export async function updateReceipt(
    receiptId: string,
    data: Partial<Omit<Receipt, 'id' | 'userId' | 'uploadTimestamp' | 'rawOcrText'>>
): Promise<void> {
    const receiptRef = doc(db, 'receipts', receiptId);
    await updateDoc(receiptRef, {
        ...data,
        // Convert date to timestamp if provided
        ...(data.date ? { date: data.date } : {})
    });
}

/**
 * Update receipt verification status
 */
export async function updateReceiptStatus(
    receiptId: string,
    status: Receipt['verificationStatus']
): Promise<void> {
    const receiptRef = doc(db, 'receipts', receiptId);
    await updateDoc(receiptRef, { verificationStatus: status });
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(receiptId: string): Promise<void> {
    const receiptRef = doc(db, 'receipts', receiptId);
    await deleteDoc(receiptRef);
}

/**
 * Add items to a receipt
 */
export async function addItemsToReceipt(
    receiptId: string,
    items: LineItem[]
): Promise<void> {
    const receipt = await getReceipt(receiptId);
    if (!receipt) throw new Error('Receipt not found');

    const updatedItems = [
        ...receipt.items,
        ...items.map((item, index) => ({
            ...item,
            id: item.id || `${receiptId}_item_${receipt.items.length + index}`,
            receiptId
        }))
    ];

    await updateReceipt(receiptId, { items: updatedItems });
}
