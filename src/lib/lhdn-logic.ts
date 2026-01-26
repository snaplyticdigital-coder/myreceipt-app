import type { Receipt, LineItem, LhdnTag } from '../types';

/**
 * LHDN Tax Relief Categories 2025 (Year Assessment)
 * Based on official HASIL Malaysia guidelines
 * Reference: https://www.hasil.gov.my
 */

// Tax Relief Limits for 2025
export const LHDN_LIMITS_2025 = {
    // INDIVIDUAL
    individualAndDependentRelatives: 9000,
    disabledIndividual: 7000,
    husbandWifeAlimony: 4000,
    disabledHusbandWife: 6000,

    // EDUCATION
    educationFees: 7000, // Tertiary level
    skillsEnhancementCourses: 2000, // Sub-limit under education

    // HOUSING
    housingLoanInterestUnder500k: 7000,
    housingLoanInterest500kTo750k: 5000,

    // MEDICAL & SPECIAL NEEDS
    medicalSelfSpouseChild: 10000,
    vaccinationSubLimit: 1000, // Sub-limit under medical
    dentalSubLimit: 1000, // Sub-limit under medical
    medicalExaminationSubLimit: 1000, // Sub-limit under medical
    childLearningDisabilities: 6000, // Sub-limit under medical
    medicalParentsGrandparents: 8000,
    parentsVaccinationSubLimit: 1000, // Sub-limit under parents medical
    disabledSupportEquipment: 6000,

    // LIFESTYLE
    lifestyle: 2500, // Books, gadgets, internet, self-development courses
    sportsAdditional: 1000, // Equipment, gym, facilities, competition fees
    evChargingEquipment: 2500, // EV charging & food waste composting machine

    // INSURANCE & CONTRIBUTIONS
    lifeInsuranceEpf: 7000,
    privateRetirementScheme: 3000,
    sspnNetSavings: 8000,
    socsoContributions: 350,
    educationMedicalInsurance: 4000,

    // CHILD RELIEF
    childBelow18Unmarried: 2000,
    childAbove18FullTimeEducation: 8000, // Diploma & above in Malaysia
    childAbove18ALevel: 2000,
    unmarriedChildWithDisabilities: 8000,
    additionalDisabledChildRelief: 8000,
    childcareTaskaFees: 3000, // Child aged 6 and below
    breastfeedingEquipment: 1000, // Female taxpayer, child aged 2 and below
} as const;

/**
 * Categories that qualify for tax relief based on LHDN 2025 guidelines
 */
export const LHDN_ELIGIBLE_ITEMS = {
    // MEDICAL - RM10,000 (Self/Spouse/Child)
    Medical: {
        limit: 10000,
        eligible: [
            'Serious illness treatment',
            'Fertility treatment',
            'Vaccination', // RM1,000 sub-limit
            'Dental examination and treatment', // RM1,000 sub-limit
            'Full medical check-up', // RM1,000 sub-limit
            'Disease screening tests',
            'Mental health screening/consultation',
            'Self-health monitoring equipment',
            'Self-testing kits (COVID, etc)',
            'Learning disability diagnosis/rehabilitation (child 18 & below)', // RM6,000 sub-limit
        ],
        notEligible: [
            'Vitamins and supplements',
            'General health products',
            'Personal care products',
            'Skincare',
            'Cosmetics',
        ],
    },

    // LIFESTYLE - RM2,500
    Lifestyle: {
        limit: 2500,
        eligible: [
            'Books and reading materials',
            'Magazines and newspapers',
            'Personal computer/laptop',
            'Smartphone',
            'Tablet',
            'Internet subscription',
            'Skills enhancement courses',
            'Self-development courses',
        ],
        notEligible: [
            'Gaming consoles',
            'Smart TV',
            'Audio equipment',
            'Cameras',
        ],
    },

    // SPORTS - RM1,000 (Additional Relief)
    Sports: {
        limit: 1000,
        eligible: [
            'Sports equipment for sports activities',
            'Rental/entrance fees to sports facilities',
            'Sports competition registration fees',
            'Gym membership fees',
            'Sports training fees',
        ],
        notEligible: [
            'Sports apparel/clothing',
            'Sports accessories (bags, bottles)',
            'Smartwatches (unless for sports tracking)',
        ],
    },

    // EDUCATION - RM7,000
    Education: {
        limit: 7000,
        eligible: [
            'Tertiary education fees (other than Masters/PhD)',
            'Masters degree fees',
            'Doctor of Philosophy (PhD) fees',
            'Professional certifications',
        ],
        skillsEnhancementLimit: 2000, // Sub-limit for courses
        notEligible: [
            'Primary/secondary school fees',
            'Tuition fees (non-tertiary)',
        ],
    },

    // CHILDCARE - RM3,000
    Childcare: {
        limit: 3000,
        eligible: [
            'Registered childcare centre (TASKA) fees',
            'Kindergarten (TADIKA) fees',
        ],
        eligibleCondition: 'Child aged 6 years and below',
        notEligible: [
            'Babysitter fees (unregistered)',
            'Nanny fees',
        ],
    },

    // BREASTFEEDING - RM1,000
    Breastfeeding: {
        limit: 1000,
        eligible: [
            'Breastfeeding equipment',
        ],
        eligibleCondition: 'Female taxpayer only, child aged 2 years and below, once every 2 years',
    },

    // EV & GREEN - RM2,500
    EVCharging: {
        limit: 2500,
        eligible: [
            'Electric Vehicle charging equipment installation',
            'EV charging equipment purchase/rental/subscription',
            'Domestic food waste composting machine',
        ],
        eligibleCondition: 'For household use only',
    },
} as const;

// ============================================
// LHDN AUTO-TAGGING ENGINE
// ============================================

/**
 * Comprehensive keyword database for auto-categorization
 * Based on LHDN 2025/2026 tax relief guidelines
 */
const LHDN_KEYWORD_DATABASE: Record<LhdnTag, {
    keywords: string[];
    merchantTypes?: string[];
    excludeKeywords?: string[];
}> = {
    Medical: {
        keywords: [
            'prescription', 'diagnostic', 'vaccine', 'vaccination', 'dental', 'checkup', 'check-up',
            'screening', 'consultation', 'treatment', 'medicine', 'pharmacy', 'medical', 'clinic',
            'hospital', 'doctor', 'blood test', 'x-ray', 'mri', 'ct scan', 'ultrasound', 'therapy',
            'physiotherapy', 'mental health', 'counseling', 'psychiatrist', 'psychologist',
            'health monitoring', 'glucose meter', 'blood pressure', 'thermometer', 'oximeter',
            'test kit', 'covid test', 'antigen', 'pcr', 'fertility', 'ivf',
        ],
        merchantTypes: ['Pharmacy & Health', 'Hospital', 'Clinic'],
        excludeKeywords: ['vitamin', 'supplement', 'multivitamin', 'fish oil', 'probiotics', 'omega',
            'collagen', 'skincare', 'shampoo', 'lotion', 'cream', 'makeup', 'cosmetic'],
    },
    Lifestyle: {
        keywords: [
            'laptop', 'computer', 'pc', 'macbook', 'notebook', 'smartphone', 'phone', 'iphone',
            'samsung galaxy', 'tablet', 'ipad', 'internet', 'wifi', 'broadband', 'fibre', 'unifi',
            'maxis', 'time', 'celcom', 'digi', 'subscription', 'course', 'training', 'workshop',
            'seminar', 'udemy', 'coursera', 'skillsfuture', 'self-development', 'online learning',
        ],
        merchantTypes: ['Electronics', 'Mobile & Gadgets', 'Computer & IT'],
        excludeKeywords: ['case', 'cover', 'charger', 'cable', 'adapter', 'screen protector',
            'keyboard', 'mouse', 'stand', 'gaming', 'playstation', 'xbox', 'nintendo',
            'tv', 'television', 'smart tv', 'speaker', 'headphone', 'earphone', 'airpod'],
    },
    Books: {
        keywords: [
            'book', 'novel', 'textbook', 'magazine', 'newspaper', 'ebook', 'kindle', 'reading',
            'journal', 'publication', 'education material', 'reference book', 'comic', 'manga',
            'encyclopedia', 'dictionary', 'atlas', 'stationery', 'pen', 'pencil', 'notebook',
        ],
        merchantTypes: ['Bookstore'],
    },
    Sports: {
        keywords: [
            'gym', 'fitness', 'yoga', 'pilates', 'sports', 'badminton', 'swimming', 'running',
            'jogging', 'cycling', 'bicycle', 'tennis', 'squash', 'golf', 'football', 'futsal',
            'basketball', 'volleyball', 'martial arts', 'taekwondo', 'karate', 'muay thai',
            'gym membership', 'fitness first', 'celebrity fitness', 'anytime fitness',
            'sports equipment', 'racket', 'shuttlecock', 'ball', 'dumbbell', 'treadmill',
        ],
        merchantTypes: ['Sports & Fitness'],
        excludeKeywords: ['jersey', 'shoes', 'sneaker', 'apparel', 'clothing', 'bag', 'bottle',
            'smartwatch', 'watch', 'garmin', 'fitbit'],
    },
    Education: {
        keywords: [
            'tuition fee', 'course fee', 'university', 'college', 'degree', 'masters', 'phd',
            'diploma', 'certificate', 'professional', 'cpa', 'acca', 'cfa', 'certification',
            'exam fee', 'registration fee', 'semester', 'academic', 'faculty',
        ],
    },
    Childcare: {
        keywords: [
            'taska', 'tadika', 'childcare', 'kindergarten', 'nursery', 'preschool', 'daycare',
            'child care', 'early childhood', 'playgroup',
        ],
    },
    Others: {
        keywords: [],
    },
};

// Keywords for forensic item categorization (ineligible items)
// Export for use in audit transparency view
export const SUPPLEMENT_KEYWORDS = ['vitamin', 'supplement', 'multivitamin', 'fish oil', 'probiotics', 'omega', 'collagen'];
export const ACCESSORY_KEYWORDS = ['pencil', 'case', 'charger', 'adapter', 'cable', 'screen protector', 'keyboard', 'mouse', 'stand'];
export const PERSONAL_CARE_KEYWORDS = ['skincare', 'shampoo', 'lotion', 'cream', 'makeup', 'cosmetic', 'perfume'];

/**
 * Exclusion reason types for audit transparency
 */
export type ExclusionReason =
    | 'Non-medical supplement'
    | 'Personal care item'
    | 'Accessory only'
    | 'No tax category matched'
    | 'Exceeds Category Cap'
    | null;

/**
 * Get human-readable exclusion reason for an item
 * Used in the Tax Audit Breakdown view
 */
export function getExclusionReason(
    itemName: string,
    tag?: LhdnTag,
    claimable?: boolean
): ExclusionReason {
    // If item is claimable, no exclusion reason
    if (claimable) return null;

    const lowerName = itemName.toLowerCase();

    // Check for supplements/vitamins
    if (SUPPLEMENT_KEYWORDS.some(kw => lowerName.includes(kw))) {
        return 'Non-medical supplement';
    }

    // Check for personal care items
    if (PERSONAL_CARE_KEYWORDS.some(kw => lowerName.includes(kw))) {
        return 'Personal care item';
    }

    // Check for accessories (tech accessories not claimable under Lifestyle)
    if (ACCESSORY_KEYWORDS.some(kw => lowerName.includes(kw))) {
        return 'Accessory only';
    }

    // No tag assigned means no category matched
    if (!tag) {
        return 'No tax category matched';
    }

    return null;
}

/**
 * Auto-tag a line item based on its name and merchant category
 * Uses keyword matching against LHDN 2025/2026 database
 */
export function autoTagLineItem(
    itemName: string,
    merchantCategory?: string
): {
    tag: LhdnTag | null;
    claimable: boolean;
    confidence: 'high' | 'medium' | 'low';
    autoAssigned: boolean;
} {
    const lowerName = itemName.toLowerCase();

    // First check if item is explicitly ineligible
    const ineligibleCheck = isItemExplicitlyIneligible(lowerName);
    if (ineligibleCheck) {
        return {
            tag: null,
            claimable: false,
            confidence: 'high',
            autoAssigned: true,
        };
    }

    // Check each category for keyword matches
    const categories: LhdnTag[] = ['Medical', 'Lifestyle', 'Books', 'Sports', 'Education', 'Childcare'];

    for (const category of categories) {
        const config = LHDN_KEYWORD_DATABASE[category];

        // Check if any exclude keywords match first
        if (config.excludeKeywords?.some(kw => lowerName.includes(kw))) {
            continue;
        }

        // Check for keyword matches
        const keywordMatch = config.keywords.some(kw => lowerName.includes(kw));

        // Check for merchant type match
        const merchantMatch = merchantCategory &&
            config.merchantTypes?.some(mt => merchantCategory.includes(mt));

        if (keywordMatch) {
            return {
                tag: category,
                claimable: true,
                confidence: merchantMatch ? 'high' : 'medium',
                autoAssigned: true,
            };
        }

        // Merchant match alone gives lower confidence
        if (merchantMatch && category === 'Medical') {
            // For pharmacy/health stores, still try to auto-tag Medical
            return {
                tag: category,
                claimable: true,
                confidence: 'low',
                autoAssigned: true,
            };
        }
    }

    // No match found - return as not claimable
    return {
        tag: null,
        claimable: false,
        confidence: 'low',
        autoAssigned: false,
    };
}

/**
 * Check if an item is explicitly ineligible (supplements, personal care, etc.)
 */
function isItemExplicitlyIneligible(lowerName: string): boolean {
    return (
        SUPPLEMENT_KEYWORDS.some(kw => lowerName.includes(kw)) ||
        PERSONAL_CARE_KEYWORDS.some(kw => lowerName.includes(kw))
    );
}

/**
 * Check if an item name is typically ineligible for LHDN tax relief
 * Used to show warnings when user marks such items as claimable
 */
export function isTypicallyIneligible(itemName: string, proposedCategory?: string): {
    ineligible: boolean;
    reason?: string;
    suggestedAction?: string;
} {
    const lowerName = itemName.toLowerCase();

    // Check for supplements/vitamins (not claimable under Medical)
    if (SUPPLEMENT_KEYWORDS.some(kw => lowerName.includes(kw))) {
        return {
            ineligible: true,
            reason: 'LHDN guidelines usually exclude supplements and vitamins from medical relief.',
            suggestedAction: 'Consider unchecking claimable status.',
        };
    }

    // Check for personal care (not Medical)
    if (PERSONAL_CARE_KEYWORDS.some(kw => lowerName.includes(kw))) {
        return {
            ineligible: true,
            reason: 'Personal care items are not eligible for tax relief.',
            suggestedAction: 'Consider unchecking claimable status.',
        };
    }

    // Check for accessories when marked as Lifestyle (only primary tech is claimable)
    if (proposedCategory === 'Lifestyle' && ACCESSORY_KEYWORDS.some(kw => lowerName.includes(kw))) {
        return {
            ineligible: true,
            reason: 'Accessories like cases and chargers are usually not claimable under Lifestyle.',
            suggestedAction: 'Only primary devices (phone, tablet, laptop) qualify.',
        };
    }

    return { ineligible: false };
}

/**
 * Calculate total claimable amount from a receipt's line items
 */
export function calculateClaimableTotal(items: LineItem[]): number {
    return items
        .filter(item => item.claimable)
        .reduce((sum, item) => sum + (item.qty * item.unit), 0);
}

/**
 * Calculate total non-claimable amount from a receipt's line items
 */
export function calculateNonClaimableTotal(items: LineItem[]): number {
    return items
        .filter(item => !item.claimable)
        .reduce((sum, item) => sum + (item.qty * item.unit), 0);
}

/**
 * Check if Lifestyle cap would be exceeded with a new amount
 */
export function wouldExceedLifestyleCap(
    currentYtd: number,
    lifestyleCap: number,
    newAmount: number
): boolean {
    return (currentYtd + newAmount) > lifestyleCap;
}

/**
 * Get remaining Lifestyle cap amount
 */
export function getRemainingLifestyleCap(currentYtd: number, lifestyleCap: number): number {
    return Math.max(0, lifestyleCap - currentYtd);
}

/**
 * Calculate spending by LHDN category from receipts
 */
export function calculateLhdnCategoryTotals(receipts: Receipt[]): Record<LhdnTag, number> {
    const totals: Record<string, number> = {
        Lifestyle: 0,
        Education: 0,
        Medical: 0,
        Sports: 0,
        Childcare: 0,
        Books: 0,
        Others: 0,
    };

    receipts.forEach(receipt => {
        receipt.items.forEach(item => {
            if (item.claimable && item.tag) {
                totals[item.tag] = (totals[item.tag] || 0) + (item.qty * item.unit);
            }
        });
    });

    return totals as Record<LhdnTag, number>;
}

/**
 * Get remaining relief amount for a category
 */
export function getRemainingRelief(
    category: keyof typeof LHDN_ELIGIBLE_ITEMS,
    currentSpent: number
): number {
    const limit = LHDN_ELIGIBLE_ITEMS[category]?.limit || 0;
    return Math.max(0, limit - currentSpent);
}

/**
 * Check if an item/expense would exceed the category limit
 */
export function wouldExceedLimit(
    category: keyof typeof LHDN_ELIGIBLE_ITEMS,
    currentSpent: number,
    newAmount: number
): boolean {
    const limit = LHDN_ELIGIBLE_ITEMS[category]?.limit || 0;
    return (currentSpent + newAmount) > limit;
}

/**
 * Get category limit
 */
export function getCategoryLimit(category: keyof typeof LHDN_ELIGIBLE_ITEMS): number {
    return LHDN_ELIGIBLE_ITEMS[category]?.limit || 0;
}

/**
 * Get LHDN tags used in a receipt
 */
export function getReceiptTags(receipt: Receipt): LhdnTag[] {
    const tags = new Set<LhdnTag>();

    receipt.items.forEach(item => {
        if (item.tag) {
            tags.add(item.tag);
        }
    });

    return Array.from(tags);
}

/**
 * Check if receipt has any claimable items
 */
export function hasClaimableItems(receipt: Receipt): boolean {
    return receipt.items.some(item => item.claimable);
}

/**
 * Filter receipts by month (YYYY-MM format)
 */
export function filterReceiptsByMonth(receipts: Receipt[], month: string): Receipt[] {
    return receipts.filter(receipt => receipt.date.startsWith(month));
}

/**
 * Filter receipts by year
 */
export function filterReceiptsByYear(receipts: Receipt[], year: string): Receipt[] {
    return receipts.filter(receipt => receipt.date.startsWith(year));
}

/**
 * Filter receipts by tag
 */
export function filterReceiptsByTag(receipts: Receipt[], tag: LhdnTag): Receipt[] {
    return receipts.filter(receipt =>
        receipt.items.some(item => item.tag === tag)
    );
}

/**
 * Calculate percentage of limit used
 */
export function calculateLimitUsagePercent(spent: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.min(100, (spent / limit) * 100);
}

/**
 * Get summary of all LHDN relief usage for a year
 */
export function getLhdnReliefSummary(receipts: Receipt[]): {
    category: string;
    spent: number;
    limit: number;
    remaining: number;
    percentUsed: number;
}[] {
    const categoryTotals = calculateLhdnCategoryTotals(receipts);

    const categories: { category: string; limitKey: keyof typeof LHDN_ELIGIBLE_ITEMS }[] = [
        { category: 'Medical', limitKey: 'Medical' },
        { category: 'Lifestyle', limitKey: 'Lifestyle' },
        { category: 'Sports', limitKey: 'Sports' },
        { category: 'Education', limitKey: 'Education' },
        { category: 'Childcare', limitKey: 'Childcare' },
    ];

    return categories.map(({ category, limitKey }) => {
        const spent = categoryTotals[category as LhdnTag] || 0;
        const limit = LHDN_ELIGIBLE_ITEMS[limitKey]?.limit || 0;
        const remaining = Math.max(0, limit - spent);
        const percentUsed = calculateLimitUsagePercent(spent, limit);

        return { category, spent, limit, remaining, percentUsed };
    });
}

// ============================================
// JIMAT TAX SINI - Smart Tax Insight Engine
// ============================================

/**
 * Tax insight type for the "Jimat Tax Sini" Co-Pilot feature
 */
export interface TaxInsight {
    category: LhdnTag;
    remaining: number;
    limit: number;
    percentUsed: number;
    suggestion: string;
    emoji: string;
    priority: 'high' | 'medium' | 'low';
}

/**
 * Category-specific suggestion templates (Manglish)
 * IMPORTANT: Medical is ONLY for health-related items (checkups, vaccines, treatments)
 * Laptops, books, gadgets belong to Lifestyle category
 */
const TAX_SUGGESTION_TEMPLATES: Record<LhdnTag, {
    highRemaining: string[];  // >70% remaining
    mediumRemaining: string[]; // 30-70% remaining
    lowRemaining: string[];    // <30% remaining
    emoji: string;
}> = {
    Medical: {
        highRemaining: [
            "Eh boss, you still have RM {amount} for health! Better do that full medical check-up or vaccination now k?",
            "Banyak lagi Medical relief boss! RM {amount} available. Time for dental check or health screening!",
            "Your RM {amount} Medical balance untouched! Go get that annual checkup or vaccine before year end!",
        ],
        mediumRemaining: [
            "Medical relief half used. Still got RM {amount} for checkups, vaccines or mental health consultation!",
            "RM {amount} left for Medical. Consider fertility treatment, physiotherapy or health screening!",
        ],
        lowRemaining: [
            "Medical relief almost maxed! Only RM {amount} left. Use wisely for remaining health needs!",
        ],
        emoji: "🏥",
    },
    Lifestyle: {
        highRemaining: [
            "Boss, Lifestyle relief still ada RM {amount}! Perfect for that new laptop, phone or online course!",
            "Got RM {amount} Lifestyle balance! Buy computer, smartphone, or upskill with courses - all claimable!",
            "Internet, gadgets, books - RM {amount} waiting! Time to upgrade your tech or skills!",
        ],
        mediumRemaining: [
            "Lifestyle relief halfway there. RM {amount} left for phones, laptops, books or courses!",
            "RM {amount} Lifestyle balance. Get that tablet, internet subscription, or skill workshop!",
        ],
        lowRemaining: [
            "Lifestyle relief almost habis! Only RM {amount}. Choose wisely - book, course or gadget?",
        ],
        emoji: "💻",
    },
    Books: {
        highRemaining: [
            "Bookworm alert! RM {amount} available for reading materials. Time to stock up!",
            "Books, magazines, ebooks - RM {amount} claimable. Feed your mind, boss!",
        ],
        mediumRemaining: [
            "Half your Books relief used. Still got RM {amount} for more reading materials!",
        ],
        lowRemaining: [
            "Books relief running low - RM {amount} left. Choose your next read wisely!",
        ],
        emoji: "📚",
    },
    Sports: {
        highRemaining: [
            "Get fit and claim tax! RM {amount} for gym, sports equipment or fitness classes!",
            "Sports relief RM {amount} available! Gym membership, badminton racket, or swimming lessons?",
        ],
        mediumRemaining: [
            "RM {amount} Sports relief left. Time for new equipment or renew that gym membership!",
        ],
        lowRemaining: [
            "Sports relief almost done - RM {amount}. One more gym month or equipment purchase?",
        ],
        emoji: "🏃",
    },
    Education: {
        highRemaining: [
            "Education relief loaded with RM {amount}! Perfect for courses, certifications or degree fees!",
            "Got RM {amount} for Education. Masters degree, professional cert, or upskilling - all claimable!",
        ],
        mediumRemaining: [
            "Education halfway used. RM {amount} left for courses or certifications!",
        ],
        lowRemaining: [
            "Education relief almost maxed! RM {amount} remaining for final course payments.",
        ],
        emoji: "🎓",
    },
    Childcare: {
        highRemaining: [
            "TASKA/TADIKA fees are claimable! RM {amount} available for registered childcare!",
            "Got kids 6 and below? RM {amount} Childcare relief waiting - for registered centers only!",
        ],
        mediumRemaining: [
            "Childcare relief half used. RM {amount} left for TASKA/TADIKA fees!",
        ],
        lowRemaining: [
            "Childcare relief almost full! Only RM {amount} for remaining nursery fees.",
        ],
        emoji: "👶",
    },
    Others: {
        highRemaining: [],
        mediumRemaining: [],
        lowRemaining: [],
        emoji: "📝",
    },
};

/**
 * Generate smart tax insights based on user's current LHDN relief usage
 * Returns prioritized suggestions for categories with high remaining balance
 */
export function generateTaxInsights(receipts: Receipt[]): TaxInsight[] {
    const summary = getLhdnReliefSummary(receipts);
    const insights: TaxInsight[] = [];

    summary.forEach(({ category, limit, remaining, percentUsed }) => {
        const tag = category as LhdnTag;
        const templates = TAX_SUGGESTION_TEMPLATES[tag];

        if (!templates || templates.highRemaining.length === 0) return;

        let suggestionPool: string[];
        let priority: 'high' | 'medium' | 'low';

        // Determine suggestion tier based on remaining percentage
        const remainingPercent = 100 - percentUsed;

        if (remainingPercent > 70) {
            suggestionPool = templates.highRemaining;
            priority = 'high';
        } else if (remainingPercent > 30) {
            suggestionPool = templates.mediumRemaining;
            priority = 'medium';
        } else if (remaining > 0) {
            suggestionPool = templates.lowRemaining;
            priority = 'low';
        } else {
            return; // No suggestion if fully used
        }

        // Pick a random suggestion from the pool
        const randomIndex = Math.floor(Math.random() * suggestionPool.length);
        const suggestion = suggestionPool[randomIndex].replace('{amount}', remaining.toFixed(0));

        insights.push({
            category: tag,
            remaining,
            limit,
            percentUsed,
            suggestion,
            emoji: templates.emoji,
            priority,
        });
    });

    // Sort by priority (high first) then by remaining amount (highest first)
    insights.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.remaining - a.remaining;
    });

    return insights;
}

/**
 * Get the top tax insight for display in Co-Pilot card
 * Prioritizes categories with highest remaining balance
 */
export function getTopTaxInsight(receipts: Receipt[]): TaxInsight | null {
    const insights = generateTaxInsights(receipts);
    return insights.length > 0 ? insights[0] : null;
}

/**
 * Check if an item is correctly categorized for LHDN
 * CRITICAL: Laptops/phones/books are Lifestyle, NOT Medical
 */
export function validateLhdnCategorization(itemName: string, assignedTag: LhdnTag): {
    isValid: boolean;
    correctTag?: LhdnTag;
    reason?: string;
} {
    const lowerName = itemName.toLowerCase();

    // Items that should NEVER be Medical
    const notMedicalItems = ['laptop', 'computer', 'phone', 'smartphone', 'tablet', 'ipad', 'macbook',
        'book', 'magazine', 'newspaper', 'ebook', 'course', 'training', 'internet', 'wifi', 'broadband'];

    if (assignedTag === 'Medical') {
        const isWronglyMedical = notMedicalItems.some(kw => lowerName.includes(kw));
        if (isWronglyMedical) {
            return {
                isValid: false,
                correctTag: 'Lifestyle',
                reason: 'Gadgets, books, and courses belong to Lifestyle (RM 2,500), not Medical relief.',
            };
        }
    }

    // Items that should be Medical (not Lifestyle)
    const medicalOnlyItems = ['vaccine', 'vaccination', 'checkup', 'check-up', 'treatment', 'surgery',
        'dental', 'clinic', 'hospital', 'doctor', 'prescription', 'physiotherapy', 'fertility'];

    if (assignedTag === 'Lifestyle') {
        const shouldBeMedical = medicalOnlyItems.some(kw => lowerName.includes(kw));
        if (shouldBeMedical) {
            return {
                isValid: false,
                correctTag: 'Medical',
                reason: 'Health treatments and checkups belong to Medical (RM 10,000), not Lifestyle.',
            };
        }
    }

    return { isValid: true };
}
