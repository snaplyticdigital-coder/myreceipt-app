import { create } from 'zustand';
import type { Receipt, User, Budget, Notification, LineItem } from '../types';
import type { StreakData, UserGoal, Insight } from './insights-engine';
import { sampleReceipts, currentUser, currentBudget, sampleNotifications, emptyBudget } from './mock-data';
import {
    calculateWeekTotal,
    calculateLastWeekTotal,
    calculateMonthTotal,
    calculateWeekDifference,
    calculateDayTotal,
    calculateDayDifference,
    calculateMonthDifference,
    calculateBudgetPercentage,
    calculateCategoryBreakdown,
    calculateTotalClaimable,
    getWeekReceipts,
    getMonthReceipts,
    getDayReceipts,
    countTotalItems,
    type CategoryBreakdown,
} from './calculations';
import { validateReceiptIntegrity, assertDataConsistency } from './data-validation';
import { autoTagLineItem } from './lhdn-logic';
import { TIERS } from './tier-constants';

interface AppStore {
    // User state
    user: User;
    updateUser: (user: Partial<User>) => void;

    // User initialization - loads data specific to logged-in user
    initializeUser: (userId: string, email: string, displayName?: string | null) => void;
    setUserFromFirebase: (uid: string, email: string, displayName: string | null, photoURL: string | null) => void;
    clearUserData: () => void;

    // Receipts state
    receipts: Receipt[];
    addReceipt: (receipt: Receipt) => void;
    updateReceipt: (id: string, receipt: Partial<Receipt>) => void;
    updateLineItem: (receiptId: string, itemId: string, updates: Partial<LineItem>) => void;
    deleteReceipt: (id: string) => void;
    getReceipt: (id: string) => Receipt | undefined;

    // ============================================
    // COMPUTED SELECTORS - Single Source of Truth
    // All financial calculations MUST use these
    // ============================================
    getWeekTotal: () => number;
    getLastWeekTotal: () => number;
    getMonthTotal: () => number;
    getDayTotal: () => number;
    getWeekDifference: () => { difference: number; isDown: boolean };
    getDayDifference: () => { difference: number; isDown: boolean };
    getMonthDifference: () => { difference: number; isDown: boolean };
    getBudgetPercentage: () => number;
    getCategoryBreakdown: () => CategoryBreakdown[];
    getTotalClaimable: () => number;
    getWeekReceipts: () => Receipt[];
    getMonthReceipts: () => Receipt[];
    getDayReceipts: () => Receipt[];
    getWeekItemCount: () => number;

    // Budget state
    budget: Budget;
    updateBudget: (budget: Budget) => void;
    updateBudgetCategory: (categoryId: string, amount: number) => void;
    addBudgetCategory: (name: string, icon?: string) => void;

    // Notifications state
    notifications: Notification[];
    markNotificationAsRead: (id: string) => void;

    // Insights state
    streak: StreakData;
    updateStreak: (streak: StreakData) => void;
    goals: UserGoal[];
    addGoal: (goal: UserGoal) => void;
    updateGoal: (id: string, goal: Partial<UserGoal>) => void;
    removeGoal: (id: string) => void;
    points: number;
    addPoints: (amount: number) => void;
    badges: string[];
    addBadge: (badgeId: string) => void;
    weeklyBudget: number;
    dailyBudget: number;
    setWeeklyBudget: (amount: number) => void;
    currentInsights: Insight[];
    setInsights: (insights: Insight[]) => void;

    // Phase 3: XP System
    weeklyRecapCompleted: string | null; // ISO week string
    awardUploadPoints: (receiptId: string) => void;
    awardVerifyPoints: (receiptId: string) => void;
    awardCategoryPoints: (receiptId: string) => void;
    completeWeeklyRecap: () => void;

    // UI state
    theme: 'light' | 'dark';
    toggleTheme: () => void;

    // Selected month for filtering
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    // Freemium Actions
    watchAd: () => void;
    upgradeToPro: () => void;
    checkMonthlyReset: () => void;
    incrementScanCount: () => void;
    // Toast State
    toast: { message: string; type: 'success' | 'error' | 'info' } | null;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
    // Reward Modal State
    rewardModal: { isOpen: boolean; rewardAmount: number };
    openRewardModal: (amount: number) => void;
    closeRewardModal: () => void;

    // Tier Celebration State
    celebrationTier: number | null; // Index of the tier newly unlocked
    clearCelebration: () => void;
    // Investor Demo Trigger
    triggerDemoLevelUp: () => void;
}

// Load persisted insights state
const loadInsightsState = () => {
    const saved = localStorage.getItem('insightsState');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            return null;
        }
    }
    return null;
};

// Legacy user who keeps existing mock data
const LEGACY_USER_EMAIL = 'snaplytic.digital@gmail.com';

// Load user-specific data from localStorage
const loadUserData = (userId: string) => {
    const saved = localStorage.getItem(`userData_${userId}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            return null;
        }
    }
    return null;
};

// Save user-specific data to localStorage
const saveUserData = (userId: string, data: { receipts: Receipt[], budget: Budget }) => {
    localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
};

// Helper: Get ISO week string (e.g., "2026-W03")
const getISOWeek = (date: Date): string => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

const savedInsights = loadInsightsState();

export const useStore = create<AppStore>((set, get) => ({
    // Initialize with empty data - will be populated on user login
    user: currentUser,
    receipts: [],  // Empty by default
    budget: emptyBudget,  // Empty budget by default
    notifications: [],
    theme: 'light',
    selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM

    // Insights initial state - empty for new users
    streak: savedInsights?.streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastUpdated: new Date().toISOString(),
        streakDates: [],
    },
    goals: savedInsights?.goals || [],
    points: savedInsights?.points || 0,
    badges: savedInsights?.badges || [],
    weeklyBudget: savedInsights?.weeklyBudget || 0,  // 0 until set by user
    dailyBudget: savedInsights?.dailyBudget || 0,
    currentInsights: [],
    weeklyRecapCompleted: savedInsights?.weeklyRecapCompleted || null,

    // User actions
    updateUser: (userData) => {
        set((state) => ({
            user: { ...state.user, ...userData },
        }));
    },

    // Set user from Firebase auth data
    setUserFromFirebase: (uid: string, email: string, displayName: string | null, photoURL: string | null) => {
        set((state) => ({
            user: {
                ...state.user,
                id: uid,
                email: email,
                name: displayName || email.split('@')[0] || 'User',
                photoURL: photoURL || undefined,
                tier: 'FREE',
                scanCount: 0,
                nextResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
        }));
    },

    // Initialize user data - called on login
    initializeUser: (userId: string, email: string, displayName?: string | null) => {
        // Update user info in store
        set((state) => ({
            user: {
                ...state.user,
                id: userId,
                email: email,
                name: displayName || email.split('@')[0] || 'User',
                tier: 'FREE',
                scanCount: 0,
                scansRemaining: 10,
                // Default next reset to 30 days from now for new users
                nextResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
        }));

        // Check if this is the legacy user or guest
        if (email === LEGACY_USER_EMAIL || email === 'guest@example.com') {
            // Load mock data
            set({
                receipts: sampleReceipts,
                budget: currentBudget,
                notifications: sampleNotifications,
            });
            return;
        }

        // For other users, try to load saved data
        const userData = loadUserData(userId);
        if (userData) {
            set({
                receipts: userData.receipts || [],
                budget: userData.budget || emptyBudget,
                notifications: [],
            });
        } else {
            // New user - start fresh
            set({
                receipts: [],
                budget: { ...emptyBudget },
                notifications: [],
            });
        }
    },

    // Clear user data on logout
    clearUserData: () => {
        set({
            user: currentUser,
            receipts: [],
            budget: emptyBudget,
            notifications: [],
            points: 0,
            badges: [],
            goals: [],
            weeklyBudget: 0,
            dailyBudget: 0,
            currentInsights: [],
        });
    },

    // Budget category actions
    updateBudgetCategory: (categoryId: string, amount: number) => {
        set((state) => {
            const updatedCategories = state.budget.categories.map(cat =>
                cat.id === categoryId ? { ...cat, amount } : cat
            );
            const total = updatedCategories.reduce((sum, cat) => sum + cat.amount, 0);
            const newBudget = {
                ...state.budget,
                categories: updatedCategories,
                total,
                isSetup: total > 0,
            };
            saveUserData(state.user.id, { receipts: state.receipts, budget: newBudget });
            return { budget: newBudget };
        });
    },

    addBudgetCategory: (name: string, icon?: string) => {
        set((state) => {
            const id = name.toLowerCase().replace(/\s+/g, '-');
            const newCategory = {
                id,
                name,
                amount: 0,
                isPreset: false,
                icon: icon || '📁',
            };
            const newBudget = {
                ...state.budget,
                categories: [...state.budget.categories, newCategory],
            };
            saveUserData(state.user.id, { receipts: state.receipts, budget: newBudget });
            return { budget: newBudget };
        });
    },

    // Receipt actions
    addReceipt: (receipt) => {
        const validation = validateReceiptIntegrity(receipt);
        assertDataConsistency(validation, `Adding receipt ${receipt.id}`);

        // Auto-tag line items using LHDN Intelligence Engine
        const autoTaggedItems = receipt.items.map(item => {
            // Only auto-tag if item doesn't already have a tag assigned
            if (item.tag || item.autoAssigned !== undefined) {
                return item;
            }
            const autoTag = autoTagLineItem(item.name, receipt.merchantCategory);
            return {
                ...item,
                claimable: autoTag.claimable,
                tag: autoTag.tag || undefined,
                autoAssigned: autoTag.autoAssigned,
            };
        });

        // Update receipt-level tags and claimable based on items
        const allItemTags = new Set(autoTaggedItems.filter(i => i.claimable && i.tag).map(i => i.tag!));
        const hasClaimable = autoTaggedItems.some(i => i.claimable);
        const taggedReceipt = {
            ...receipt,
            items: autoTaggedItems,
            tags: Array.from(allItemTags),
            claimable: hasClaimable,
        };

        set((state) => {
            const scanCount = (state.user.scanCount || 0) + 1;
            // Decrement remaining, default to 10
            const scansRemaining = (state.user.scansRemaining ?? 10) - 1;
            const updatedUser = { ...state.user, scanCount, scansRemaining };

            const newReceipts = [taggedReceipt, ...state.receipts];
            saveUserData(state.user.id, { receipts: newReceipts, budget: state.budget });

            // Grant Points (e.g., 150 pts per receipt)
            const currentPoints = state.points || 0;
            // Determine current tier
            const currentTierIndex = TIERS.findIndex((t, i) =>
                currentPoints >= t.minPoints && (i === TIERS.length - 1 || currentPoints < TIERS[i + 1].minPoints)
            );

            const newPoints = currentPoints + 150;

            // Determine new tier
            const newTierIndex = TIERS.findIndex((t, i) =>
                newPoints >= t.minPoints && (i === TIERS.length - 1 || newPoints < TIERS[i + 1].minPoints)
            );

            let celebrationTier = state.celebrationTier;
            // If upgraded, trigger celebration
            if (newTierIndex > currentTierIndex && currentTierIndex !== -1) {
                celebrationTier = newTierIndex;
            }

            return { receipts: newReceipts, user: updatedUser, points: newPoints, celebrationTier };
        });

        const lifestyleAmount = receipt.items
            .filter(item => item.tag === 'Lifestyle' && item.claimable)
            .reduce((sum, item) => sum + (item.qty * item.unit), 0);

        if (lifestyleAmount > 0 && !receipt.routedToSpouse) {
            set((state) => ({
                user: {
                    ...state.user,
                    lifestyleYtd: state.user.lifestyleYtd + lifestyleAmount,
                },
            }));
        }
    },

    updateReceipt: (id, receiptData) => {
        set((state) => {
            const newReceipts = state.receipts.map((r) =>
                r.id === id ? { ...r, ...receiptData } : r
            );
            saveUserData(state.user.id, { receipts: newReceipts, budget: state.budget });
            return { receipts: newReceipts };
        });
    },

    updateLineItem: (receiptId, itemId, updates) => {
        set((state) => {
            const newReceipts = state.receipts.map((receipt) => {
                if (receipt.id === receiptId) {
                    const newItems = receipt.items.map((item) =>
                        item.id === itemId ? { ...item, ...updates } : item
                    );
                    // Update receipt-level tags based on item tags
                    const allTags = new Set(newItems.filter(i => i.claimable && i.tag).map(i => i.tag!));
                    const hasClaimable = newItems.some(i => i.claimable);
                    return {
                        ...receipt,
                        items: newItems,
                        tags: Array.from(allTags),
                        claimable: hasClaimable,
                    };
                }
                return receipt;
            });
            saveUserData(state.user.id, { receipts: newReceipts, budget: state.budget });
            return { receipts: newReceipts };
        });
    },

    deleteReceipt: (id) => {
        set((state) => {
            const newReceipts = state.receipts.filter((r) => r.id !== id);
            saveUserData(state.user.id, { receipts: newReceipts, budget: state.budget });
            return { receipts: newReceipts };
        });
    },

    getReceipt: (id) => {
        return get().receipts.find((r) => r.id === id);
    },

    // Computed Selectors
    getWeekTotal: () => calculateWeekTotal(get().receipts),
    getLastWeekTotal: () => calculateLastWeekTotal(get().receipts),
    getMonthTotal: () => calculateMonthTotal(get().receipts),
    getDayTotal: () => calculateDayTotal(get().receipts),
    getWeekDifference: () => calculateWeekDifference(get().receipts),
    getDayDifference: () => calculateDayDifference(get().receipts),
    getMonthDifference: () => calculateMonthDifference(get().receipts),
    getBudgetPercentage: () => calculateBudgetPercentage(
        calculateMonthTotal(get().receipts),
        get().budget.total
    ),
    getCategoryBreakdown: () => calculateCategoryBreakdown(get().receipts),
    getTotalClaimable: () => calculateTotalClaimable(get().receipts),
    getWeekReceipts: () => getWeekReceipts(get().receipts),
    getMonthReceipts: () => getMonthReceipts(get().receipts),
    getDayReceipts: () => getDayReceipts(get().receipts),
    getWeekItemCount: () => countTotalItems(getWeekReceipts(get().receipts)),

    // Budget
    updateBudget: (budget) => set({ budget }),

    // Notifications
    markNotificationAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        }));
    },

    // Insights
    updateStreak: (streak) => {
        set({ streak });
        persistInsightsState(get());
    },

    addGoal: (goal) => {
        set((state) => ({ goals: [...state.goals, goal] }));
        persistInsightsState(get());
    },

    updateGoal: (id, goalData) => {
        set((state) => ({
            goals: state.goals.map((g) =>
                g.id === id ? { ...g, ...goalData } : g
            ),
        }));
        persistInsightsState(get());
    },

    removeGoal: (id) => {
        set((state) => ({
            goals: state.goals.filter((g) => g.id !== id),
        }));
        persistInsightsState(get());
    },

    addPoints: (amount) => {
        set((state) => ({ points: state.points + amount }));
        persistInsightsState(get());
    },

    addBadge: (badgeId) => {
        set((state) => {
            if (state.badges.includes(badgeId)) return state;
            return { badges: [...state.badges, badgeId] };
        });
        persistInsightsState(get());
    },

    setWeeklyBudget: (amount) => {
        set({ weeklyBudget: amount, dailyBudget: amount / 7 });
        persistInsightsState(get());
    },

    setInsights: (insights) => set({ currentInsights: insights }),

    // XP System
    awardUploadPoints: (receiptId) => {
        set((state) => {
            const receipt = state.receipts.find(r => r.id === receiptId);
            if (!receipt || receipt.pointsAwarded?.upload) return state;
            const updatedReceipts = state.receipts.map(r =>
                r.id === receiptId ? { ...r, pointsAwarded: { ...r.pointsAwarded, upload: true } } : r
            );
            return { receipts: updatedReceipts, points: state.points + 10 };
        });
        persistInsightsState(get());
    },

    awardVerifyPoints: (receiptId) => {
        set((state) => {
            const receipt = state.receipts.find(r => r.id === receiptId);
            if (!receipt || receipt.pointsAwarded?.verified) return state;
            const updatedReceipts = state.receipts.map(r =>
                r.id === receiptId ? { ...r, pointsAwarded: { ...r.pointsAwarded, verified: true } } : r
            );
            return { receipts: updatedReceipts, points: state.points + 5 };
        });
        persistInsightsState(get());
    },

    awardCategoryPoints: (receiptId) => {
        set((state) => {
            const receipt = state.receipts.find(r => r.id === receiptId);
            if (!receipt || receipt.pointsAwarded?.categorized) return state;
            const updatedReceipts = state.receipts.map(r =>
                r.id === receiptId ? { ...r, pointsAwarded: { ...r.pointsAwarded, categorized: true } } : r
            );
            return { receipts: updatedReceipts, points: state.points + 5 };
        });
        persistInsightsState(get());
    },

    completeWeeklyRecap: () => {
        const currentWeek = getISOWeek(new Date());
        set((state) => {
            if (state.weeklyRecapCompleted === currentWeek) return state;
            return { weeklyRecapCompleted: currentWeek, points: state.points + 15 };
        });
        persistInsightsState(get());
    },

    // UI
    toggleTheme: () => {
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            if (newTheme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', newTheme);
            return { theme: newTheme };
        });
    },

    setSelectedMonth: (month) => set({ selectedMonth: month }),

    // Freemium Implementation - Anniversary Billing Logic
    checkMonthlyReset: () => {
        const now = new Date();
        const user = get().user;

        // If nextResetDate is missing (legacy), set it to 30 days from now or use createdAt
        if (!user.nextResetDate) {
            const signup = new Date(user.createdAt);
            const nextReset = new Date(now);
            // Default to sign-up day of current month, if passed, move to next
            if (now.getDate() >= signup.getDate()) {
                nextReset.setMonth(nextReset.getMonth() + 1);
            }
            nextReset.setDate(signup.getDate());

            set(state => ({
                user: { ...state.user, nextResetDate: nextReset.toISOString() }
            }));
            return;
        }

        const resetDate = new Date(user.nextResetDate);

        // If current date is past the reset date
        if (now >= resetDate) {
            // Calculate NEW next reset date (Next Month same day)
            const nextReset = new Date(resetDate);
            nextReset.setMonth(nextReset.getMonth() + 1);

            set((state) => ({
                user: {
                    ...state.user,
                    scanCount: 0,
                    scansRemaining: 10, // Reset to 10
                    nextResetDate: nextReset.toISOString()
                }
            }));
        }
    },

    watchAd: () => {
        const { user } = get();
        // Enforce 48h cooldown
        if (user.lastAdWatch) {
            const lastWatch = new Date(user.lastAdWatch);
            const now = new Date();
            const hoursSince = (now.getTime() - lastWatch.getTime()) / (1000 * 60 * 60);
            if (hoursSince < 48) {
                console.warn("Ad cooldown active");
                return;
            }
        }

        set((state) => ({
            user: {
                ...state.user,
                // Increment wallet by 3
                scansRemaining: (state.user.scansRemaining ?? 10) + 3,
                lastAdWatch: new Date().toISOString()
            }
        }));
    },

    upgradeToPro: () => {
        set((state) => ({
            user: {
                ...state.user,
                tier: 'PRO',
                scansRemaining: 9999, // Unlimited essentially
                proExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            }
        }));
    },

    incrementScanCount: () => {
        set((state) => ({
            user: { ...state.user, scanCount: (state.user.scanCount || 0) + 1 }
        }));
    },

    // Toast Actions
    toast: null,
    showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            set({ toast: null });
        }, 3000);
    },
    hideToast: () => set({ toast: null }),

    // Reward Modal Actions
    rewardModal: { isOpen: false, rewardAmount: 0 },
    celebrationTier: null,

    openRewardModal: (amount) => set({ rewardModal: { isOpen: true, rewardAmount: amount } }),
    closeRewardModal: () => set({ rewardModal: { isOpen: false, rewardAmount: 0 } }),
    clearCelebration: () => set({ celebrationTier: null }),

    // Investor Demo Trigger: Adds 500 points and forces celebration check
    triggerDemoLevelUp: () => set((state) => {
        const currentPoints = state.points || 0;
        const newPoints = currentPoints + 500;

        // Find new tier logic (reused)
        const newTierIndex = TIERS.findIndex((t, i) =>
            newPoints >= t.minPoints && (i === TIERS.length - 1 || newPoints < TIERS[i + 1].minPoints)
        );

        return {
            points: newPoints,
            celebrationTier: newTierIndex
        };
    }),
}));

// Helper to persist insights state
function persistInsightsState(state: AppStore) {
    localStorage.setItem('insightsState', JSON.stringify({
        streak: state.streak,
        goals: state.goals,
        points: state.points,
        badges: state.badges,
        weeklyBudget: state.weeklyBudget,
        dailyBudget: state.dailyBudget,
    }));
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
if (savedTheme) {
    useStore.setState({ theme: savedTheme });
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
}
