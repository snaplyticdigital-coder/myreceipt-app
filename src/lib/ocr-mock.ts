import { generateId } from './format';
import type { LineItem, MerchantCategory, PaymentMethod, LhdnTag } from '../types';

// Main expense categories (shown first in verification)
export type MainCategory =
    | 'Health & Beauty'
    | 'Food & Beverage'
    | 'Groceries'
    | 'Gaming & Tech'
    | 'Fashion'
    | 'Books & Stationery'
    | 'Sports & Fitness'
    | 'Electronics'
    | 'Home & DIY'
    | 'Lifestyle'
    | 'Shopping';

// Mock merchants for simulated OCR results
const MOCK_MERCHANTS = [
    {
        name: 'Watsons',
        category: 'Pharmacy & Health' as MerchantCategory,
        mainCategory: 'Health & Beauty' as MainCategory,
        subCategories: ['Personal', 'Health']
    },
    {
        name: 'Guardian',
        category: 'Pharmacy & Health' as MerchantCategory,
        mainCategory: 'Health & Beauty' as MainCategory,
        subCategories: ['Personal', 'Health']
    },
    {
        name: 'Starbucks',
        category: 'Coffee Shop' as MerchantCategory,
        mainCategory: 'Food & Beverage' as MainCategory,
        subCategories: ['Coffee', 'Dining']
    },
    {
        name: 'ZUS Coffee',
        category: 'Coffee Shop' as MerchantCategory,
        mainCategory: 'Food & Beverage' as MainCategory,
        subCategories: ['Coffee', 'Daily']
    },
    {
        name: 'Tealive',
        category: 'Coffee Shop' as MerchantCategory,
        mainCategory: 'Food & Beverage' as MainCategory,
        subCategories: ['Beverage', 'Daily']
    },
    {
        name: '99 Speed Mart',
        category: 'Convenience Store' as MerchantCategory,
        mainCategory: 'Groceries' as MainCategory,
        subCategories: ['Daily', 'Essential']
    },
    {
        name: 'Jaya Grocer',
        category: 'Grocery Store' as MerchantCategory,
        mainCategory: 'Groceries' as MainCategory,
        subCategories: ['Premium', 'Weekly']
    },
    {
        name: 'AEON',
        category: 'Department Store' as MerchantCategory,
        mainCategory: 'Shopping' as MainCategory,
        subCategories: ['General', 'Family']
    },
    {
        name: 'Popular Bookstore',
        category: 'Bookstore' as MerchantCategory,
        mainCategory: 'Books & Stationery' as MainCategory,
        subCategories: ['Education', 'Reading']
    },
    {
        name: 'MPH Bookstores',
        category: 'Bookstore' as MerchantCategory,
        mainCategory: 'Books & Stationery' as MainCategory,
        subCategories: ['Education', 'Reading']
    },
    {
        name: 'Uniqlo',
        category: 'Fashion & Apparel' as MerchantCategory,
        mainCategory: 'Fashion' as MainCategory,
        subCategories: ['Casual', 'Essential']
    },
    {
        name: 'Decathlon',
        category: 'Sports & Fitness' as MerchantCategory,
        mainCategory: 'Sports & Fitness' as MainCategory,
        subCategories: ['Fitness', 'Equipment']
    },
    {
        name: 'Harvey Norman',
        category: 'Electronics' as MerchantCategory,
        mainCategory: 'Electronics' as MainCategory,
        subCategories: ['Tech', 'Home']
    },
];

// Mock line items based on merchant type with CORRECTED LHDN tags
// Key LHDN Rules:
// - Medical: ONLY for treatment of serious diseases, fertility, vaccinations, dental, mental health
// - Medical: Does NOT include vitamins, supplements, or general health products
// - Lifestyle: Books, computers, smartphones, tablets, internet, self-improvement courses (RM2,500 limit)
// - Sports: Sports equipment, gym, facilities, competitions (RM1,000 limit)
// - Education: Tertiary education fees, professional certifications (RM7,000 limit)
// - Books: Included in Lifestyle but can be tagged separately
const MOCK_ITEMS: Record<string, { name: string; price: number; tag?: LhdnTag; isClaimable: boolean }[]> = {
    'Pharmacy & Health': [
        // Vitamins and supplements are NOT tax deductible
        { name: 'Vitamin C 1000mg', price: 45.90, isClaimable: false },
        { name: 'Multivitamins', price: 58.90, isClaimable: false },
        { name: 'Face Wash', price: 28.50, isClaimable: false },
        { name: 'Hand Sanitizer', price: 15.90, isClaimable: false },
        { name: 'Skincare Set', price: 89.90, isClaimable: false },
        // Only actual medical items are claimable
        { name: 'COVID-19 Self Test Kit', price: 19.90, tag: 'Medical', isClaimable: true },
        { name: 'Vaccination (Flu)', price: 80.00, tag: 'Medical', isClaimable: true },
    ],
    'Coffee Shop': [
        { name: 'Americano', price: 12.00, isClaimable: false },
        { name: 'Latte', price: 15.00, isClaimable: false },
        { name: 'Croissant', price: 8.50, isClaimable: false },
    ],
    'Grocery Store': [
        { name: 'Fresh Milk 2L', price: 12.90, isClaimable: false },
        { name: 'Bread', price: 6.50, isClaimable: false },
        { name: 'Eggs (10pcs)', price: 9.90, isClaimable: false },
        { name: 'Vegetables', price: 15.80, isClaimable: false },
    ],
    'Bookstore': [
        // Books qualify for Lifestyle relief
        { name: 'Programming Book', price: 89.90, tag: 'Lifestyle', isClaimable: true },
        { name: 'Novel', price: 45.90, tag: 'Lifestyle', isClaimable: true },
        { name: 'Magazine', price: 12.90, tag: 'Lifestyle', isClaimable: true },
        { name: 'Notebook', price: 12.90, isClaimable: false },
        { name: 'Pen Set', price: 15.50, isClaimable: false },
    ],
    'Sports & Fitness': [
        // Sports equipment qualifies for Sports relief
        { name: 'Running Shoes', price: 299.00, tag: 'Sports', isClaimable: true },
        { name: 'Sports Socks', price: 29.90, tag: 'Sports', isClaimable: true },
        { name: 'Gym Membership (Monthly)', price: 150.00, tag: 'Sports', isClaimable: true },
        { name: 'Yoga Mat', price: 89.00, tag: 'Sports', isClaimable: true },
        { name: 'Water Bottle', price: 45.00, isClaimable: false },
    ],
    'Electronics': [
        // Computers, tablets, smartphones qualify for Lifestyle
        { name: 'Laptop', price: 3299.00, tag: 'Lifestyle', isClaimable: true },
        { name: 'Tablet', price: 1599.00, tag: 'Lifestyle', isClaimable: true },
        { name: 'Smartphone', price: 2999.00, tag: 'Lifestyle', isClaimable: true },
        { name: 'Mouse', price: 89.00, isClaimable: false },
        { name: 'Keyboard', price: 199.00, isClaimable: false },
    ],
    default: [
        { name: 'Item 1', price: 25.90, isClaimable: false },
        { name: 'Item 2', price: 18.50, isClaimable: false },
    ],
};

export interface OcrResult {
    merchant: string;
    merchantCategory: MerchantCategory;
    mainCategory: MainCategory;
    subCategories: string[];
    date: string;
    amount: number;
    subtotal: number;
    tax: number;
    taxRate: number;
    items: LineItem[];
    payment: PaymentMethod;
    receiptNumber: string;
    // Suggested LHDN tags based on actual eligible items
    suggestedLhdnTags: LhdnTag[];
}

// Simulate OCR processing with a delay
export async function simulateOcrScan(): Promise<OcrResult> {
    // Simulate processing delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Pick a random merchant
    const merchantInfo = MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)];

    // Get items for this merchant category
    const categoryItems = MOCK_ITEMS[merchantInfo.category] || MOCK_ITEMS.default;

    // Pick 2-4 random items
    const numItems = 2 + Math.floor(Math.random() * 3);
    const shuffledItems = [...categoryItems].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledItems.slice(0, numItems);

    // Create line items
    const lineItems: LineItem[] = selectedItems.map(item => ({
        id: generateId(),
        name: item.name,
        qty: 1 + Math.floor(Math.random() * 2), // 1-2 quantity
        unit: item.price,
        claimable: item.isClaimable,
        tag: item.tag,
    }));

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unit), 0);
    const taxRate = 0.06; // 6% SST
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const amount = Math.round((subtotal + tax) * 100) / 100;

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;

    // Random payment method
    const paymentMethods: PaymentMethod[] = ['Card', 'eWallet', 'Cash'];
    const payment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    // Extract suggested LHDN tags from items that are actually claimable
    const suggestedLhdnTags = lineItems
        .filter(item => item.claimable && item.tag)
        .map(item => item.tag!)
        .filter((tag, i, arr) => arr.indexOf(tag) === i);

    return {
        merchant: merchantInfo.name,
        merchantCategory: merchantInfo.category,
        mainCategory: merchantInfo.mainCategory,
        subCategories: merchantInfo.subCategories,
        date: new Date().toISOString().split('T')[0],
        amount,
        subtotal,
        tax,
        taxRate,
        items: lineItems,
        payment,
        receiptNumber,
        suggestedLhdnTags,
    };
}
