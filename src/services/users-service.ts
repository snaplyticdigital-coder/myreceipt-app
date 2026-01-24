/**
 * Users Service
 * Firestore CRUD operations for user profiles
 */

import {
    db,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    timestampToISO
} from '../lib/firebase';
import type { User } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Create a new user profile in Firestore
 * Called on first sign-in (Google or Email)
 */
export async function createUserProfile(
    userId: string,
    data: {
        email: string;
        name: string;
        photoURL?: string | null;
        emailVerified: boolean;
    }
): Promise<User> {
    const userRef = doc(db, USERS_COLLECTION, userId);

    const newUser: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
        id: userId,
        email: data.email,
        name: data.name || 'User',
        emailVerified: data.emailVerified,
        photoURL: data.photoURL || undefined,
        createdAt: serverTimestamp(),
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'RM',
        lifestyleCap: 2500,
        lifestyleYtd: 0,
        enableSpouseOverflow: false,
        tier: 'FREE',
        scanCount: 0,
        scansRemaining: 10,
        nextResetDate: new Date().toISOString()
    };

    await setDoc(userRef, newUser);

    // Return with ISO timestamp
    return {
        ...newUser,
        createdAt: new Date().toISOString()
    } as User;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return null;
    }

    const data = userSnap.data();
    return {
        ...data,
        id: userId,
        createdAt: timestampToISO(data.createdAt)
    } as User;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    data: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, data);
}

/**
 * Check if user profile exists
 */
export async function userProfileExists(userId: string): Promise<boolean> {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
}
