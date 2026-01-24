/**
 * Authentication Context
 * Provides auth state and user data to the entire application
 * Uses fast timeout for Firestore to prevent slow logins
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    onAuthChange,
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    signOut,
    type FirebaseUser
} from '../lib/firebase';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    error: string | null;
    signIn: () => Promise<void>;
    signInEmail: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    loginAsGuest: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Get user-friendly error message from Firebase error
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        const code = (error as { code?: string }).code;
        switch (code) {
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/invalid-credential':
                return 'Invalid email or password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled';
            default:
                return error.message;
        }
    }
    return 'An error occurred';
}

/**
 * Convert Firebase user to our User type (used immediately for fast login)
 */
function firebaseUserToUser(fbUser: FirebaseUser): User {
    return {
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || 'User',
        emailVerified: fbUser.emailVerified,
        photoURL: fbUser.photoURL || undefined,
        createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
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
}

const GUEST_USER_ID = 'guest-user-123';

/**
 * Create a Mock Guest User
 */
function createGuestUser(): User {
    return {
        id: GUEST_USER_ID,
        email: 'guest@example.com',
        name: 'Guest User',
        emailVerified: true,
        createdAt: new Date().toISOString(),
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
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Import store methods for user data initialization
    // We'll use dynamic import to avoid circular dependencies

    // Subscribe to auth state changes
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        let isMounted = true;

        const initAuth = async () => {
            // Import store dynamically to avoid circular dependency
            const { useStore } = await import('../lib/store');
            const { initializeUser, clearUserData } = useStore.getState();

            if (!isMounted) return;

            // Check for guest login first
            const isGuest = localStorage.getItem('isGuestLogin') === 'true';
            if (isGuest) {
                const guestUser = createGuestUser();
                setUser(guestUser);
                initializeUser(guestUser.id, guestUser.email, guestUser.name);
                setLoading(false);
                return;
            }

            unsubscribe = onAuthChange((fbUser) => {
                if (!isMounted) return;

                setFirebaseUser(fbUser);

                if (fbUser) {
                    // IMMEDIATELY set user from Firebase data - don't wait for Firestore
                    const mappedUser = firebaseUserToUser(fbUser);
                    setUser(mappedUser);

                    // Initialize user-specific data in the store
                    initializeUser(fbUser.uid, fbUser.email || '', fbUser.displayName);
                    setLoading(false);
                } else {
                    setUser(null);
                    setLoading(false);
                    // Clear user data from store on logout
                    clearUserData();
                }
            });
        };

        initAuth();

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const signIn = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            // Auth state listener will handle setting user
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    const signInEmailHandler = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await signInWithEmail(email, password);
            // Auth state listener will handle setting user
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        setError(null);
        setLoading(true);
        try {
            await createAccount(email, password, name);
            // Auth state listener will handle setting user
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    const loginAsGuest = async () => {
        setLoading(true);
        try {
            // Import store dynamically
            const { useStore } = await import('../lib/store');
            const { initializeUser } = useStore.getState();

            const guestUser = createGuestUser();
            localStorage.setItem('isGuestLogin', 'true');
            setUser(guestUser);
            // Even guest needs store initialization to see mock data
            initializeUser(guestUser.id, guestUser.email, guestUser.name);
        } catch (e) {
            console.error(e);
            setError('Failed to login as guest');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Check if guest
            if (localStorage.getItem('isGuestLogin') === 'true') {
                localStorage.removeItem('isGuestLogin');
                setUser(null);
                setFirebaseUser(null);
                // Also need to clear store data
                const { useStore } = await import('../lib/store');
                useStore.getState().clearUserData();
                return;
            }

            await signOut();
            setUser(null);
            setFirebaseUser(null);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const clearError = () => setError(null);

    const refreshUser = async () => {
        if (firebaseUser) {
            // Just use Firebase user data directly
            setUser(firebaseUserToUser(firebaseUser));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            firebaseUser,
            loading,
            error,
            signIn,
            signInEmail: signInEmailHandler,
            signUp,
            loginAsGuest,
            logout,
            clearError,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access authentication state and methods
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
