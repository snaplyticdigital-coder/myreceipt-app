/**
 * Tax Co-Pilot Randomization Engine
 * Category-specific Manglish suggestions for LHDN tax relief optimization
 * 10 unique variations per tax category
 */

import type { LhdnTag } from '../types';

export interface TaxCoPilotMessage {
    template: string;
    emoji: string;
}

export interface TaxMessageContext {
    remaining: number;
    categoryName: string;
}

// ============ MEDICAL RELIEF MESSAGES (10 variations) ============
// Items: Medical check-ups, vaccinations, dental, optical, traditional treatments

const MEDICAL_MESSAGES: TaxCoPilotMessage[] = [
    { template: "Eh boss, you still have RM{remaining} left for {categoryName} relief. Better do that full medical check-up before year-end k?", emoji: "🏥" },
    { template: "Aiyoo boss, RM{remaining} {categoryName} relief unused! Go for dental cleaning or eye check-up lah!", emoji: "🦷" },
    { template: "Wah, RM{remaining} {categoryName} sitting there! Time for that health screening you keep delaying!", emoji: "💉" },
    { template: "Boss, still got RM{remaining} {categoryName} to claim. Vaccination time or dental check due already?", emoji: "😷" },
    { template: "Don't waste lah! RM{remaining} {categoryName} left. Book that medical check-up now!", emoji: "📋" },
    { template: "Sikit lagi year end! RM{remaining} {categoryName} relief. Go urut traditional ke, check gigi ke!", emoji: "💆" },
    { template: "Eh, RM{remaining} {categoryName} still can claim. Family health screening before new year?", emoji: "👨‍👩‍👧" },
    { template: "Boss got RM{remaining} {categoryName} unutilized. Dental, optical, or full body check - pick one!", emoji: "🔬" },
    { template: "Year end coming! RM{remaining} {categoryName} relief waiting. Health is wealth, boss!", emoji: "❤️" },
    { template: "Jangan lupa! RM{remaining} {categoryName} left to claim. Specialist consultation pun boleh!", emoji: "👨‍⚕️" },
];

// ============ LIFESTYLE RELIEF MESSAGES (10 variations) ============
// Items: Laptops, phones, tablets, books, internet subscriptions

const LIFESTYLE_MESSAGES: TaxCoPilotMessage[] = [
    { template: "Eh boss, you still have RM{remaining} left for {categoryName} relief. Better buy that laptop or phone before year-end k?", emoji: "💻" },
    { template: "Wah, RM{remaining} {categoryName} unutilized! Time to upgrade gadget or renew internet plan!", emoji: "📱" },
    { template: "Boss, RM{remaining} {categoryName} left. New tablet? Smartphone upgrade? Books? Go go go!", emoji: "📚" },
    { template: "Don't let RM{remaining} {categoryName} relief go to waste! E-reader or new laptop waiting for you!", emoji: "🎧" },
    { template: "Sikit lagi year end! RM{remaining} {categoryName} still can claim. Time for that gadget upgrade!", emoji: "⌨️" },
    { template: "Eh, RM{remaining} {categoryName} relief sitting there. New phone or laptop before year-end lah!", emoji: "📲" },
    { template: "Boss got RM{remaining} {categoryName} unutilized. Internet subscription renewal pun kira tau!", emoji: "🌐" },
    { template: "Year end sale coming! RM{remaining} {categoryName} left. Perfect time for tech upgrade!", emoji: "🛒" },
    { template: "Aiyoo, RM{remaining} {categoryName} wasted if don't use! Laptop, tablet, or books - pick lah!", emoji: "🤔" },
    { template: "Jangan tunggu! RM{remaining} {categoryName} relief. New smartphone or e-books before Dec 31!", emoji: "📖" },
];

// ============ SPORTS RELIEF MESSAGES (10 variations) ============
// Items: Gym memberships, sports equipment, fitness classes

const SPORTS_MESSAGES: TaxCoPilotMessage[] = [
    { template: "Eh boss, you still have RM{remaining} left for {categoryName} relief. Time for gym membership or sports equipment!", emoji: "🏋️" },
    { template: "Wah, RM{remaining} {categoryName} unutilized! New running shoes or badminton racket?", emoji: "👟" },
    { template: "Boss, RM{remaining} {categoryName} left. Gym membership renewal or yoga class registration!", emoji: "🧘" },
    { template: "Don't waste RM{remaining} {categoryName} relief! Bicycle, dumbbells, or fitness tracker - go!", emoji: "🚴" },
    { template: "Sikit lagi year end! RM{remaining} {categoryName} still can claim. Sports equipment shopping time!", emoji: "🏸" },
    { template: "Eh, RM{remaining} {categoryName} relief sitting there. Gym sign-up or new sports gear!", emoji: "💪" },
    { template: "Boss got RM{remaining} {categoryName} unutilized. Swimming goggles, tennis racket - anything sports!", emoji: "🏊" },
    { template: "Year end coming! RM{remaining} {categoryName} left. Get fit and get tax relief - win-win!", emoji: "🎾" },
    { template: "Aiyoo, RM{remaining} {categoryName} wasted if don't use! Fitness first, tax relief second!", emoji: "🏃" },
    { template: "Jangan tunggu! RM{remaining} {categoryName} relief. Gym membership or golf set before year-end!", emoji: "⛳" },
];

// ============ EDUCATION RELIEF MESSAGES (10 variations) ============
// Items: Course fees, professional certifications, upskilling programs

const EDUCATION_MESSAGES: TaxCoPilotMessage[] = [
    { template: "Eh boss, you still have RM{remaining} left for {categoryName} relief. Better pay those course fees before year-end k?", emoji: "🎓" },
    { template: "Wah, RM{remaining} {categoryName} unutilized! Time to upskill with new certification!", emoji: "📜" },
    { template: "Boss, RM{remaining} {categoryName} left. Online course or professional cert - invest in yourself!", emoji: "💡" },
    { template: "Don't waste RM{remaining} {categoryName} relief! Language class or tech certification awaits!", emoji: "🌍" },
    { template: "Sikit lagi year end! RM{remaining} {categoryName} still can claim. Skill upgrade time!", emoji: "📚" },
    { template: "Eh, RM{remaining} {categoryName} relief sitting there. MBA fees or short course registration!", emoji: "🏫" },
    { template: "Boss got RM{remaining} {categoryName} unutilized. Workshop, seminar, or online learning - go!", emoji: "🖥️" },
    { template: "Year end coming! RM{remaining} {categoryName} left. Best investment is in your brain, boss!", emoji: "🧠" },
    { template: "Aiyoo, RM{remaining} {categoryName} wasted if don't use! Professional development penting tau!", emoji: "📈" },
    { template: "Jangan tunggu! RM{remaining} {categoryName} relief. Enroll in that course you've been eyeing!", emoji: "✏️" },
];

// ============ CHILDCARE RELIEF MESSAGES (10 variations) ============
// Items: TASKA, TADIKA fees, registered childcare centers

const CHILDCARE_MESSAGES: TaxCoPilotMessage[] = [
    { template: "Eh boss, you still have RM{remaining} left for {categoryName} relief. Make sure TASKA/TADIKA fees are paid before year-end k?", emoji: "👶" },
    { template: "Wah, RM{remaining} {categoryName} unutilized! Registered childcare fees can claim tau!", emoji: "🏫" },
    { template: "Boss, RM{remaining} {categoryName} left. TASKA, TADIKA, or registered nursery - all eligible!", emoji: "🧒" },
    { template: "Don't waste RM{remaining} {categoryName} relief! Advance pay childcare fees before Dec 31!", emoji: "📅" },
    { template: "Sikit lagi year end! RM{remaining} {categoryName} still can claim. Check your TASKA receipts!", emoji: "🧾" },
    { template: "Eh, RM{remaining} {categoryName} relief sitting there. Registered childcare centers only tau!", emoji: "✅" },
    { template: "Boss got RM{remaining} {categoryName} unutilized. Kids daycare fees - don't forget to claim!", emoji: "🎒" },
    { template: "Year end coming! RM{remaining} {categoryName} left. TADIKA fees paid already ke?", emoji: "📝" },
    { template: "Aiyoo, RM{remaining} {categoryName} wasted if don't use! Childcare relief very useful for parents!", emoji: "👨‍👩‍👧‍👦" },
    { template: "Jangan tunggu! RM{remaining} {categoryName} relief. Settle TASKA fees before year-end!", emoji: "🏠" },
];

// ============ BOOKS RELIEF MESSAGES (10 variations) ============
// Items: Books, magazines, journals, newspapers (physical and digital)

const BOOKS_MESSAGES: TaxCoPilotMessage[] = [
    { template: "Eh boss, you still have RM{remaining} left for {categoryName} relief. Time to stock up on reading materials!", emoji: "📚" },
    { template: "Wah, RM{remaining} {categoryName} unutilized! E-books, magazines, newspapers - all can claim!", emoji: "📖" },
    { template: "Boss, RM{remaining} {categoryName} left. Visit bookstore or subscribe to digital publications!", emoji: "📰" },
    { template: "Don't waste RM{remaining} {categoryName} relief! Reading is fundamental, tax relief is bonus!", emoji: "🤓" },
    { template: "Sikit lagi year end! RM{remaining} {categoryName} still can claim. Popular or Kinokuniya trip?", emoji: "🏪" },
    { template: "Eh, RM{remaining} {categoryName} relief sitting there. Magazine subscription or new novel!", emoji: "📕" },
    { template: "Boss got RM{remaining} {categoryName} unutilized. Kindle books and digital mags count too!", emoji: "📱" },
    { template: "Year end coming! RM{remaining} {categoryName} left. Feed your brain, reduce your tax!", emoji: "🧠" },
    { template: "Aiyoo, RM{remaining} {categoryName} wasted if don't use! Newspaper subscription pun boleh!", emoji: "📰" },
    { template: "Jangan tunggu! RM{remaining} {categoryName} relief. Big Bad Wolf coming - perfect timing!", emoji: "🐺" },
];

// ============ GENERIC/OTHERS RELIEF MESSAGES (10 variations) ============

const GENERIC_MESSAGES: TaxCoPilotMessage[] = [
    { template: "Eh boss, you still have RM{remaining} left for {categoryName} relief. Use it before year-end k?", emoji: "💰" },
    { template: "Wah, RM{remaining} {categoryName} unutilized! Don't let tax relief go to waste!", emoji: "📊" },
    { template: "Boss, RM{remaining} {categoryName} left. Check eligible expenses and claim before Dec 31!", emoji: "✅" },
    { template: "Don't waste RM{remaining} {categoryName} relief! Every ringgit counts for tax savings!", emoji: "💵" },
    { template: "Sikit lagi year end! RM{remaining} {categoryName} still can claim. Act now!", emoji: "⏰" },
    { template: "Eh, RM{remaining} {categoryName} relief sitting there. Make it count before year-end!", emoji: "🎯" },
    { template: "Boss got RM{remaining} {categoryName} unutilized. Review eligible items and claim!", emoji: "📋" },
    { template: "Year end coming! RM{remaining} {categoryName} left. Smart spending = smart tax savings!", emoji: "🧠" },
    { template: "Aiyoo, RM{remaining} {categoryName} wasted if don't use! Tax relief is free money lah!", emoji: "🤑" },
    { template: "Jangan tunggu! RM{remaining} {categoryName} relief. Year-end deadline approaching!", emoji: "📅" },
];

// ============ MESSAGE REGISTRY ============

const TAX_MESSAGES: Record<LhdnTag, TaxCoPilotMessage[]> = {
    Medical: MEDICAL_MESSAGES,
    Lifestyle: LIFESTYLE_MESSAGES,
    Sports: SPORTS_MESSAGES,
    Education: EDUCATION_MESSAGES,
    Childcare: CHILDCARE_MESSAGES,
    Books: BOOKS_MESSAGES,
    Others: GENERIC_MESSAGES,
};

// ============ SESSION INDEX TRACKING ============

const sessionIndices: Record<LhdnTag, Set<number>> = {
    Medical: new Set(),
    Lifestyle: new Set(),
    Sports: new Set(),
    Education: new Set(),
    Childcare: new Set(),
    Books: new Set(),
    Others: new Set(),
};

/**
 * Get a random index that hasn't been used recently for this category
 */
function getRandomIndex(category: LhdnTag, maxIndex: number): number {
    const usedIndices = sessionIndices[category];

    // Reset if we've used more than 70% of messages
    if (usedIndices.size > maxIndex * 0.7) {
        usedIndices.clear();
    }

    let index: number;
    let attempts = 0;

    do {
        index = Math.floor(Math.random() * maxIndex);
        attempts++;
    } while (usedIndices.has(index) && attempts < 10);

    usedIndices.add(index);
    return index;
}

/**
 * Get a randomized tax optimization message for a specific LHDN category
 */
export function getTaxOptimizationMessage(
    category: LhdnTag,
    context: TaxMessageContext
): TaxCoPilotMessage {
    const messages = TAX_MESSAGES[category] || GENERIC_MESSAGES;
    const index = getRandomIndex(category, messages.length);
    const message = messages[index];

    // Interpolate variables in template
    let interpolated = message.template
        .replace(/{remaining}/g, context.remaining.toFixed(2))
        .replace(/{categoryName}/g, context.categoryName);

    return {
        template: interpolated,
        emoji: message.emoji,
    };
}

/**
 * Reset session indices (call on page load or refresh)
 */
export function resetTaxSessionIndices(): void {
    Object.keys(sessionIndices).forEach(key => {
        sessionIndices[key as LhdnTag].clear();
    });
}

/**
 * Get all messages for a category (for testing/preview)
 */
export function getAllTaxMessages(category: LhdnTag): TaxCoPilotMessage[] {
    return TAX_MESSAGES[category] || GENERIC_MESSAGES;
}
