import { useState, useMemo, useRef } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, Tag, ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { PopoverSelect } from '../components/ui/in-app-select';
import type { MerchantCategory } from '../types';
import { StickyAdBanner } from '../components/sticky-ad-banner';
import { SectionHeader } from '../components/ui/section-header';

// Merchant info mapping - same as home page
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

// All searchable tags/sub-categories
const ALL_SEARCHABLE_TAGS = [
    // Sub-categories
    'Personal', 'Health', 'Pharmacy', 'Family', 'Weekly', 'Premium', 'Daily', 'Essential',
    'Education', 'Reading', 'Home', 'Entertainment', 'Coffee', 'Beverage', 'Bakery', 'Treats',
    'Dining', 'Fitness', 'Casual', 'Tech', 'Mobile',
    // Main categories  
    'Health & Beauty', 'Food & Beverage', 'Groceries', 'Gaming & Tech', 'Fashion',
    'Books & Stationery', 'Sports & Fitness', 'Electronics', 'Home & DIY', 'Lifestyle', 'Shopping'
];

// Sort options
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export function SearchPage() {
    const { receipts: allReceipts, updateReceipt } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

    // Popover state and refs
    const [openPopover, setOpenPopover] = useState<'category' | 'sort' | null>(null);
    const categoryRef = useRef<HTMLButtonElement>(null);
    const sortRef = useRef<HTMLButtonElement>(null);

    // Main categories for dropdown filter
    const MAIN_CATEGORIES = [
        { value: '', label: 'All Categories' },
        { value: 'Food & Beverage', label: 'Food & Beverage' },
        { value: 'Groceries', label: 'Groceries' },
        { value: 'Health & Beauty', label: 'Health & Beauty' },
        { value: 'Gaming & Tech', label: 'Gaming & Tech' },
        { value: 'Fashion', label: 'Fashion' },
        { value: 'Books & Stationery', label: 'Books & Stationery' },
        { value: 'Sports & Fitness', label: 'Sports & Fitness' },
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Home & DIY', label: 'Home & DIY' },
        { value: 'Lifestyle', label: 'Lifestyle' },
    ];

    // Enhanced receipts with merchant info
    const enhancedReceipts = useMemo(() =>
        allReceipts.map(receipt => ({
            ...receipt,
            merchantInfo: getMerchantInfo(receipt.merchant, receipt.merchantCategory),
            itemCount: receipt.items?.length || 1
        })), [allReceipts]
    );

    // Get autocomplete suggestions based on query (after 3 chars)
    const suggestions = useMemo(() => {
        if (searchQuery.length < 3) return [];

        const query = searchQuery.toLowerCase();
        const matchedTags = ALL_SEARCHABLE_TAGS.filter(tag =>
            tag.toLowerCase().includes(query)
        );

        // Also include matching merchant names
        const matchedMerchants = enhancedReceipts
            .map(r => r.merchant)
            .filter(merchant => merchant.toLowerCase().includes(query))
            .filter((v, i, a) => a.indexOf(v) === i); // unique

        return [...matchedTags, ...matchedMerchants].slice(0, 6);
    }, [searchQuery, enhancedReceipts]);

    // Filter receipts based on search query AND category (matches merchant, notes, tags/sub-categories)
    const filteredReceipts = useMemo(() => {
        let results = enhancedReceipts;

        // Apply category filter first
        if (selectedCategory) {
            results = results.filter(receipt =>
                receipt.merchantInfo.mainCategory === selectedCategory
            );
        }

        // Then apply search query filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(receipt => {
                // Match merchant name
                if (receipt.merchant.toLowerCase().includes(query)) return true;
                // Match notes
                if (receipt.notes?.toLowerCase().includes(query)) return true;
                // Match main category
                if (receipt.merchantInfo.mainCategory.toLowerCase().includes(query)) return true;
                // Match sub-categories
                if (receipt.merchantInfo.subCategories.some(sub => sub.toLowerCase().includes(query))) return true;

                return false;
            });
        }

        // Apply sorting
        results = [...results].sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });

        // Limit results when no search
        if (!searchQuery && !selectedCategory) {
            results = results.slice(0, 10);
        }

        return results;
    }, [searchQuery, selectedCategory, sortBy, enhancedReceipts]);

    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
    };

    const isSearchActive = searchQuery.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <StickyAdBanner />
            {/* Header with Search */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-[15px] px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-white/10">
                <h1 className="text-lg font-bold text-white mb-3">Search</h1>

                {/* Search Bar with Autocomplete */}
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(e.target.value.length >= 3);
                        }}
                        onFocus={() => setShowSuggestions(searchQuery.length >= 3)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Search merchant, tag, or category..."
                        className="w-full bg-white/90 backdrop-blur-sm border-0 rounded-xl py-3 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setShowSuggestions(false);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                >
                                    <Tag size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-700">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Filters Row */}
                <div className="flex gap-3">
                    {/* Category Filter */}
                    <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                        <button
                            ref={categoryRef}
                            type="button"
                            onClick={() => setOpenPopover('category')}
                            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs"
                        >
                            <span className="text-gray-700">
                                {selectedCategory ? MAIN_CATEGORIES.find(c => c.value === selectedCategory)?.label : 'All Categories'}
                            </span>
                            <ChevronDown size={14} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Sort By */}
                    <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Sort By</label>
                        <button
                            ref={sortRef}
                            type="button"
                            onClick={() => setOpenPopover('sort')}
                            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs"
                        >
                            <div className="flex items-center gap-2">
                                <ArrowUpDown size={14} className="text-gray-400" />
                                <span className="text-gray-700">
                                    {sortBy === 'date-desc' ? 'Date (Newest)' :
                                        sortBy === 'date-asc' ? 'Date (Oldest)' :
                                            sortBy === 'amount-desc' ? 'Amount (High)' : 'Amount (Low)'}
                                </span>
                            </div>
                            <ChevronDown size={14} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Results Header */}
                <SectionHeader
                    title="Recent Transactions"
                    subtitle={isSearchActive || selectedCategory
                        ? `${filteredReceipts.length} result${filteredReceipts.length !== 1 ? 's' : ''}`
                        : undefined
                    }
                    icon={<Clock />}
                    className="mb-2"
                />

                {/* Results */}
                <div>
                    {filteredReceipts.length === 0 ? (
                        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                            <p className="text-sm text-gray-500">No receipts found</p>
                            <p className="text-xs text-gray-400 mt-1">Try searching by merchant, tag, or category</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredReceipts.map(receipt => (
                                <div
                                    key={receipt.id}
                                    className="bg-white rounded-xl p-3 shadow-sm"
                                >
                                    {/* Main Content Row */}
                                    <div className="flex items-start gap-2">
                                        {/* Circular Merchant Image */}
                                        <Link to={`/receipt/${receipt.id}`} className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                                                <img
                                                    src={receipt.merchantInfo.image}
                                                    alt={receipt.merchant}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </Link>

                                        {/* Merchant Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/receipt/${receipt.id}`}>
                                                <p className="text-sm font-bold text-gray-900 mb-0.5">{receipt.merchant}</p>
                                            </Link>
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-xs text-gray-500">{receipt.itemCount} items</span>
                                                {/* Interactive category tag */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setReclassifyingId(reclassifyingId === receipt.id ? null : receipt.id);
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
                                                        }[receipt.spendingCategory] || 'bg-gray-500'
                                                            } text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer`}
                                                    >
                                                        {receipt.spendingCategory}
                                                    </button>

                                                    {/* Reclassification dropdown */}
                                                    {reclassifyingId === receipt.id && (
                                                        <div className="absolute top-6 left-0 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-[200px]">
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
                                                                            updateReceipt(receipt.id, { spendingCategory: cat as any });
                                                                            setReclassifyingId(null);
                                                                        }}
                                                                        className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-gray-100 flex items-center justify-between ${receipt.spendingCategory === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600'
                                                                            }`}
                                                                    >
                                                                        {cat}
                                                                        {receipt.spendingCategory === cat && <Check size={12} />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer border-t border-gray-100 pt-2">
                                                                <input type="checkbox" className="rounded border-gray-300" />
                                                                Remember for {receipt.merchant}
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Sub-categories */}
                                            <div className="flex items-center gap-1">
                                                {receipt.merchantInfo.subCategories.map((subCat, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50"
                                                    >
                                                        {subCat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Amount & Date */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-gray-900">
                                                {formatCurrency(receipt.amount)}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                {new Date(receipt.date).toLocaleDateString('en-MY', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Popover Select Menus */}
            <PopoverSelect
                isOpen={openPopover === 'category'}
                onClose={() => setOpenPopover(null)}
                anchorRef={categoryRef}
                showIcons={false}
                options={MAIN_CATEGORIES}
                value={selectedCategory}
                onSelect={(val) => setSelectedCategory(val)}
            />
            <PopoverSelect
                isOpen={openPopover === 'sort'}
                onClose={() => setOpenPopover(null)}
                anchorRef={sortRef}
                showIcons={false}
                options={[
                    { value: 'date-desc', label: 'Date (Newest)' },
                    { value: 'date-asc', label: 'Date (Oldest)' },
                    { value: 'amount-desc', label: 'Amount (High)' },
                    { value: 'amount-asc', label: 'Amount (Low)' }
                ]}
                value={sortBy}
                onSelect={(val) => setSortBy(val as SortOption)}
            />
        </div>
    );
}
