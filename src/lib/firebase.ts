/**
 * Firebase Configuration and Authentication
 * Handles Firebase initialization, Firestore, Storage, and Auth
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential, // Added
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import {
    getFirestore,
    collection,
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
    Timestamp,
    type DocumentData
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collection references
export const usersCollection = collection(db, 'users');
export const receiptsCollection = collection(db, 'receipts');
export const transactionsCollection = collection(db, 'transactions');

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

import { Capacitor } from '@capacitor/core';
import {
    getRedirectResult as firebaseGetRedirectResult
} from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'; // Added

// ... existing imports ...

// ============ AUTH FUNCTIONS ============

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
    if (Capacitor.isNativePlatform()) {
        // Native: Use Capacitor Google Auth Plugin
        // This avoids the infinite loop of signInWithRedirect on Android
        try {
            const user = await GoogleAuth.signIn();
            const idToken = user.authentication.idToken;
            const credential = GoogleAuthProvider.credential(idToken);
            const result = await signInWithCredential(auth, credential);
            return result.user;
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            throw error;
        }
    } else {
        // Web: Use Popup
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    }
}

export async function getGoogleRedirectResult(): Promise<FirebaseUser | null> {
    const result = await firebaseGetRedirectResult(auth);
    return result ? result.user : null;
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function createAccount(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return result.user;
}

export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// ============ FIRESTORE HELPERS ============

export function timestampToISO(timestamp: Timestamp | null): string {
    if (!timestamp) return new Date().toISOString();
    return timestamp.toDate().toISOString();
}

export function isoToTimestamp(isoString: string): Timestamp {
    return Timestamp.fromDate(new Date(isoString));
}

export {
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
    Timestamp
};

export type { FirebaseUser, DocumentData };
