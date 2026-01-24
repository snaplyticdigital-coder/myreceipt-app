 /**
 * Storage Service
 * Firebase Storage for receipt images
 */

import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a receipt image to Firebase Storage
 * @returns The download URL of the uploaded image
 */
export async function uploadReceiptImage(
    userId: string,
    file: File,
    receiptId?: string
): Promise<string> {
    const fileName = receiptId
        ? `${receiptId}_${Date.now()}.${file.name.split('.').pop()}`
        : `${Date.now()}_${file.name}`;

    const storageRef = ref(storage, `receipts/${userId}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
}

/**
 * Upload a receipt image from a Blob or base64
 */
export async function uploadReceiptImageBlob(
    userId: string,
    blob: Blob,
    extension: string = 'jpg',
    receiptId?: string
): Promise<string> {
    const fileName = receiptId
        ? `${receiptId}_${Date.now()}.${extension}`
        : `${Date.now()}.${extension}`;

    const storageRef = ref(storage, `receipts/${userId}/${fileName}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
}

/**
 * Delete a receipt image from Firebase Storage
 */
export async function deleteReceiptImage(imageUrl: string): Promise<void> {
    try {
        // Extract path from URL
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
    } catch (error) {
        // Image might already be deleted or URL invalid
        console.warn('Failed to delete image:', error);
    }
}

/**
 * Get the storage path for a user's receipt images
 */
export function getReceiptImagePath(userId: string, fileName: string): string {
    return `receipts/${userId}/${fileName}`;
}
