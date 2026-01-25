import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency, getGreeting } from '../lib/format';
import { Bell, Tag, Check, X, Settings, Eye, EyeOff, ChevronDown } from 'lucide-react';
// InsightCard removed
import { GamificationCard } from '../components/gamification-card';
import { MonthlyStatusSection } from '../components/monthly-status-section';
import { PaywallModal } from '../components/modals/paywall-modal';
import { CoPilotSection } from '../components/co-pilot-section';
import { ProfileCompletionCTA } from '../components/profile-completion-cta';
import type { MerchantCategory } from '../types';

// Merchant info mapping - returns image, main category, sub-categories, and colors
interface MerchantInfo {
    image: string;
    mainCategory: string;
    mainCategoryColor: string;
    subCategories: string[];
}

const getMerchantInfo = (merchant: string, category: MerchantCategory): MerchantInfo => {
    // Known Malaysian brands with specific categorization
    const knownBrands: Record<string, MerchantInfo> = {
        // Health & Beauty stores
        'Watsons': {
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop',
            mainCategory: 'Health & Beauty',
            mainCategoryColor: 'bg-teal-500',
            subCategories: ['Personal', 'Health']
        },
        'Guardian': {
            image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=100&h=100&fit=crop',
            mainCategory: 'Health & Beauty',
            mainCategoryColor: 'bg-teal-500',
            subCategories: ['Personal', 'Pharmacy']
        },

        // Fashion stores
        'Padini': {
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
            mainCategory: 'Fashion',
            mainCategoryColor: 'bg-blue-500',
            subCategories: ['Personal']
        },
        'Uniqlo': {
            image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&h=100&fit=crop',
            mainCategory: 'Fashion',
            mainCategoryColor: 'bg-blue-500',
            subCategories: ['Personal', 'Casual']
        },

        // Grocery stores
        'Aeon': {
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop',
            mainCategory: 'Groceries',
            mainCategoryColor: 'bg-green-500',
            subCategories: ['Family', 'Weekly']
        },
        'Jaya Grocer': {
            image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop',
            mainCategory: 'Groceries',
            mainCategoryColor: 'bg-green-500',
            subCategories: ['Family', 'Premium']
        },
        '99 Speed Mart': {
            image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop',
            mainCategory: 'Groceries',
            mainCategoryColor: 'bg-green-500',
            subCategories: ['Daily', 'Essential']
        },

        // Books & Stationery
        'Popular Bookstore': {
            image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=100&h=100&fit=crop',
            mainCategory: 'Books & Stationery',
            mainCategoryColor: 'bg-amber-500',
            subCategories: ['Education', 'Personal']
        },
        'MPH Bookstores': {
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop',
            mainCategory: 'Books & Stationery',
            mainCategoryColor: 'bg-amber-500',
            subCategories: ['Education', 'Reading']
        },

        // Lifestyle stores
        'Muji': {
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
            mainCategory: 'Lifestyle',
            mainCategoryColor: 'bg-red-500',
            subCategories: ['Home', 'Personal']
        },

        // Gaming & Electronics
        'RaptorsPro Gear & Gaming': {
            image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=100&h=100&fit=crop',
            mainCategory: 'Gaming & Tech',
            mainCategoryColor: 'bg-purple-500',
            subCategories: ['Entertainment', 'Personal']
        },

        // Food & Dining
        'Starbucks': {
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Coffee', 'Personal']
        },
        'Tealive': {
            image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Beverage', 'Personal']
        },
        'ZUS Coffee': {
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Coffee', 'Daily']
        },

        // Bakery
        'Titi Treats': {
            image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Bakery', 'Treats']
        },
        'Lavender Bakery': {
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Bakery', 'Personal']
        },

        // Restaurant
        'Rembayung': {
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Dining', 'Family']
        },

        // Sports
        'Decathlon': {
            image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop',
            mainCategory: 'Sports & Fitness',
            mainCategoryColor: 'bg-teal-500',
            subCategories: ['Fitness', 'Personal']
        },
    };

    // Check for known brand (case-insensitive partial match)
    const lowerMerchant = merchant.toLowerCase();
    for (const [brand, info] of Object.entries(knownBrands)) {
        if (lowerMerchant.includes(brand.toLowerCase())) {
            return info;
        }
    }

    // Generic category mapping for unknown merchants
    const categoryDefaults: Record<MerchantCategory, MerchantInfo> = {
        'Restaurant': {
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Dining']
        },
        'Coffee Shop': {
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Coffee']
        },
        'Bakery & Desserts': {
            image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop',
            mainCategory: 'Food & Beverage',
            mainCategoryColor: 'bg-orange-500',
            subCategories: ['Bakery']
        },
        'Grocery Store': {
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop',
            mainCategory: 'Groceries',
            mainCategoryColor: 'bg-green-500',
            subCategories: ['Family']
        },
        'Convenience Store': {
            image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop',
            mainCategory: 'Groceries',
            mainCategoryColor: 'bg-green-500',
            subCategories: ['Daily']
        },
        'Electronics': {
            image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100&h=100&fit=crop',
            mainCategory: 'Electronics',
            mainCategoryColor: 'bg-blue-600',
            subCategories: ['Tech']
        },
        'Mobile & Gadgets': {
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
            mainCategory: 'Electronics',
            mainCategoryColor: 'bg-blue-600',
            subCategories: ['Mobile']
        },
        'Computer & IT': {
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop',
            mainCategory: 'Electronics',
            mainCategoryColor: 'bg-blue-600',
            subCategories: ['Tech']
        },
        'Gaming': {
            image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=100&h=100&fit=crop',
            mainCategory: 'Gaming & Tech',
            mainCategoryColor: 'bg-purple-500',
            subCategories: ['Entertainment']
        },
        'Sports & Fitness': {
            image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop',
            mainCategory: 'Sports & Fitness',
            mainCategoryColor: 'bg-teal-500',
            subCategories: ['Fitness']
        },
        'Fashion & Apparel': {
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
            mainCategory: 'Fashion',
            mainCategoryColor: 'bg-blue-500',
            subCategories: ['Personal']
        },
        'Beauty & Personal Care': {
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop',
            mainCategory: 'Health & Beauty',
            mainCategoryColor: 'bg-teal-500',
            subCategories: ['Personal']
        },
        'Pharmacy & Health': {
            image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=100&h=100&fit=crop',
            mainCategory: 'Health & Beauty',
            mainCategoryColor: 'bg-teal-500',
            subCategories: ['Health']
        },
        'Bookstore': {
            image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=100&h=100&fit=crop',
            mainCategory: 'Books & Stationery',
            mainCategoryColor: 'bg-amber-500',
            subCategories: ['Education']
        },
        'Department Store': {
            image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop',
            mainCategory: 'Shopping',
            mainCategoryColor: 'bg-slate-500',
            subCategories: ['General']
        },
        'Hardware & DIY': {
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop',
            mainCategory: 'Home & DIY',
            mainCategoryColor: 'bg-stone-500',
            subCategories: ['Home']
        },
        'Others': {
            image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop',
            mainCategory: 'Shopping',
            mainCategoryColor: 'bg-gray-500',
            subCategories: ['General']
        },
    };

    return categoryDefaults[category] || categoryDefaults['Others'];
};

export function HomePage() {
    const user = useStore((state) => state.user);
    const allReceipts = useStore((state) => state.receipts);
    const notifications = useStore((state) => state.notifications);
    const updateReceipt = useStore((state) => state.updateReceipt);

    // ============================================
    // USE STORE COMPUTED SELECTORS - Single Source of Truth
    // ============================================
    const getWeekTotal = useStore((state) => state.getWeekTotal);
    const getWeekDifference = useStore((state) => state.getWeekDifference);
    const getWeekReceipts = useStore((state) => state.getWeekReceipts);
    const getWeekItemCount = useStore((state) => state.getWeekItemCount);
    const getMonthTotal = useStore((state) => state.getMonthTotal);
    const getMonthDifference = useStore((state) => state.getMonthDifference);
    const getDayTotal = useStore((state) => state.getDayTotal);
    const getDayDifference = useStore((state) => state.getDayDifference);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);

    // Phase 7: State for interactive category reclassification
    const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

    // Privacy and Period Selection State
    const [privacyMode, setPrivacyMode] = useState(false);
    const [spendPeriod, setSpendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    // ============================================
    // COMPUTED VALUES BASED ON SELECTED PERIOD
    // ============================================
    const { total, difference, isDown, label, vsLabel } = useMemo(() => {
        switch (spendPeriod) {
            case 'daily': {
                const dayDiff = getDayDifference();
                return {
                    total: getDayTotal(),
                    difference: dayDiff.difference,
                    isDown: dayDiff.isDown,
                    label: "Today's Spend",
                    vsLabel: 'vs yesterday'
                };
            }
            case 'weekly': {
                const weekDiff = getWeekDifference();
                return {
                    total: getWeekTotal(),
                    difference: weekDiff.difference,
                    isDown: weekDiff.isDown,
                    label: "This Week's Spend",
                    vsLabel: 'vs last week'
                };
            }
            case 'monthly':
            default: {
                const monthDiff = getMonthDifference();
                return {
                    total: getMonthTotal(),
                    difference: monthDiff.difference,
                    isDown: monthDiff.isDown,
                    label: "This Month's Spend",
                    vsLabel: 'vs last month'
                };
            }
        }
    }, [spendPeriod, getDayTotal, getDayDifference, getWeekTotal, getWeekDifference, getMonthTotal, getMonthDifference]);

    // Privacy mask helper
    const mask = (value: string) => privacyMode ? 'RM ****' : value;

    // For backward compatibility - keep week stats for transaction count display
    const weekReceipts = getWeekReceipts();
    const receiptItemCount = getWeekItemCount();

    // Recent transactions - sorted by date (newest first), limit to 5 for homepage
    const recentTransactions = [...allReceipts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(receipt => {
            const itemCount = receipt.items?.length || 1;
            const merchantInfo = getMerchantInfo(receipt.merchant, receipt.merchantCategory);

            return {
                ...receipt,
                itemCount,
                merchantInfo,
            };
        });

    // Transaction vs Receipt counts
    const transactionCount = weekReceipts.length;
    const hasMultipleItems = receiptItemCount > transactionCount;

    const greeting = getGreeting();

    // Profile completion calculation
    const profileCompletion = useMemo(() => {
        const fields = [
            { filled: !!user.name, weight: 15 },
            { filled: !!user.email, weight: 15 },
            { filled: !!user.dob, weight: 12 },
            { filled: !!user.gender, weight: 10 },
            { filled: !!user.phone, weight: 13 },
            { filled: !!user.salary, weight: 15 },
            { filled: !!user.occupation, weight: 10 },
            { filled: !!user.postcode, weight: 10 },
        ];
        return fields.reduce((acc, field) => acc + (field.filled ? field.weight : 0), 0);
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    {/* Profile Avatar with Gear Overlay */}
                    <Link to="/profile" className="flex-shrink-0 relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 shadow-sm bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {/* Gear Icon Overlay */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                            <Settings size={10} className="text-gray-600" />
                        </div>
                    </Link>
                    <div>
                        <p className="text-base font-bold text-gray-900">{greeting}, {user.name}!</p>
                        <p className="text-[11px] text-gray-500">Track your expenses wisely</p>
                    </div>
                </div>
                <Link to="/notifications" className="relative p-2">
                    <Bell size={20} className="text-gray-700" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-semibold">
                            {unreadCount}
                        </span>
                    )}
                </Link>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Paywall Modal for Freemium Limits */}
                <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />

                {/* 1. Hero Card: Dynamic Spending Card with Privacy Toggle */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative">
                    {/* Period Dropdown */}
                    <div className="relative inline-block mb-1">
                        <button
                            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-1 text-xs text-blue-100 font-medium tracking-wide uppercase hover:text-white transition-colors"
                        >
                            {label}
                            <ChevronDown size={14} className={`transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showPeriodDropdown && (
                            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[140px]">
                                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => {
                                            setSpendPeriod(period);
                                            setShowPeriodDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${spendPeriod === period
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {period === 'daily' ? "Today's Spend" :
                                            period === 'weekly' ? "This Week's Spend" :
                                                "This Month's Spend"}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Amount Row with Eye Toggle */}
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-3xl font-bold tracking-tight">{mask(formatCurrency(total))}</p>
                        <button
                            onClick={() => setPrivacyMode(!privacyMode)}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            aria-label={privacyMode ? 'Show amounts' : 'Hide amounts'}
                        >
                            {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Difference Indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${isDown ? 'bg-green-400/20 text-green-100' : 'bg-orange-400/20 text-orange-50'}`}>
                            <span>{isDown ? '↓' : '↑'}</span>
                            <span>{mask(formatCurrency(Math.abs(difference)))} {isDown ? 'less' : 'more'} {vsLabel}</span>
                        </div>
                    </div>

                    {/* Click outside to close dropdown */}
                    {showPeriodDropdown && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowPeriodDropdown(false)}
                        />
                    )}
                </div>

                {/* 2. Membership Strip (Moved to 2nd Row) */}
                <GamificationCard />

                {/* Profile Completion CTA */}
                <ProfileCompletionCTA />

                {/* 3. Merged Monthly Status (Budget & Transactions) */}
                <MonthlyStatusSection onLimitReachedClick={() => setIsPaywallOpen(true)} />

                {/* 4. Financial Co-Pilot (Insights) - Replaced with new 3-Card System */}
                <CoPilotSection />

                {/* Recent Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <h2 className="text-base font-bold text-gray-900">Recent Transactions</h2>
                        <Link to="/search" className="text-xs font-medium text-blue-600">
                            View All
                        </Link>
                    </div>

                    {/* Phase 3: Clarifying microcopy for transactions vs receipts */}
                    {transactionCount > 0 && (
                        <p className="text-[10px] text-gray-500 mb-3">
                            {hasMultipleItems
                                ? `${receiptItemCount} items uploaded (grouped into ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''} this week)`
                                : `${transactionCount} transaction${transactionCount !== 1 ? 's' : ''} this week`
                            }
                        </p>
                    )}

                    <div className="space-y-2">
                        {recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-white rounded-xl p-3 shadow-sm"
                            >
                                {/* Main Content Row */}
                                <div className="flex items-start gap-2">
                                    {/* Circular Merchant Image */}
                                    <Link to={`/receipt/${transaction.id}`} className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                                            <img
                                                src={transaction.merchantInfo.image}
                                                alt={transaction.merchant}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </Link>

                                    {/* Merchant Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/receipt/${transaction.id}`}>
                                            <p className="text-sm font-bold text-gray-900 mb-0.5">{transaction.merchant}</p>
                                        </Link>
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="text-sm text-gray-500">{transaction.itemCount} items</span>
                                            {/* Phase 7: Interactive category tag */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setReclassifyingId(reclassifyingId === transaction.id ? null : transaction.id);
                                                    }}
                                                    className={`${{
                                                        'Groceries': 'bg-green-500',
                                                        'Dining & Food': 'bg-orange-500',
                                                        'Transportation': 'bg-blue-500',
                                                        'Healthcare': 'bg-teal-500',
                                                        'Entertainment': 'bg-purple-500',
                                                        'Shopping': 'bg-indigo-500',
                                                        'Education': 'bg-amber-500',
                                                        'Utilities': 'bg-yellow-500',
                                                        'Others': 'bg-gray-500'
                                                    }[transaction.spendingCategory] || 'bg-gray-500'
                                                        } text-white text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer`}
                                                >
                                                    <Tag size={10} />
                                                    {transaction.spendingCategory}
                                                </button>

                                                {/* Reclassification dropdown */}
                                                {reclassifyingId === transaction.id && (
                                                    <div className="absolute top-8 left-0 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-[200px]">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-semibold text-gray-700">Reclassify Category</span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setReclassifyingId(null); }}
                                                                className="text-gray-400 hover:text-gray-600"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-1 mb-3">
                                                            {['Dining & Food', 'Groceries', 'Transportation', 'Utilities', 'Shopping', 'Healthcare', 'Entertainment', 'Education', 'Others'].map((cat) => (
                                                                <button
                                                                    key={cat}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateReceipt(transaction.id, { spendingCategory: cat as any });
                                                                        setReclassifyingId(null);
                                                                    }}
                                                                    className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-gray-100 flex items-center justify-between ${transaction.spendingCategory === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600'
                                                                        }`}
                                                                >
                                                                    {cat}
                                                                    {transaction.spendingCategory === cat && <Check size={12} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer border-t border-gray-100 pt-2">
                                                            <input type="checkbox" className="rounded border-gray-300" />
                                                            Remember for {transaction.merchant}
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Sub-categories */}
                                        <div className="flex items-center gap-2">
                                            {transaction.merchantInfo.subCategories.map((subCat, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs text-gray-500 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50"
                                                >
                                                    {subCat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount & Date */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-base font-bold text-gray-900">
                                            {mask(formatCurrency(transaction.amount))}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(transaction.date).toLocaleDateString('en-MY', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
