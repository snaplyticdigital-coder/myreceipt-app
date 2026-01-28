/**
 * Co-Pilot High-Entropy Randomization Engine
 * 90 unique Manglish sentences (30 per card type)
 * with dual-state support (Empty vs Live data)
 */

// ============ TYPE DEFINITIONS ============

export type CoPilotCardType = 'unlock_perk' | 'spending_shift' | 'daily_runway';

export interface CoPilotMessage {
    template: string;
    emoji: string;
}

export interface LiveDataContext {
    // Unlock Perk
    receiptsToGoal?: number;
    goalName?: string;
    currentStreak?: number;
    badgeName?: string;
    xpToNextLevel?: number;

    // Spending Shift
    savedAmount?: number;
    overspentAmount?: number;
    percentChange?: number;
    comparisonPeriod?: string;
    categoryName?: string; // Active budget category for category-aware messages

    // Daily Runway
    dailyAllowance?: number;
    daysRemaining?: number;
    budgetRemaining?: number;
    projectedSavings?: number;
}

// ============ CATEGORY A: UNLOCK PERK - EMPTY STATE (30 sentences) ============
// Milestone Encouragement - for users with 0 receipts

export const EMPTY_STATE_MESSAGES: Record<CoPilotCardType, CoPilotMessage[]> = {
    unlock_perk: [
        { template: "Sikit lagi boss! Just need ONE receipt to start your journey.", emoji: "🎯" },
        { template: "Steady la, upload satu receipt je dulu untuk unlock badge!", emoji: "🏅" },
        { template: "Don't stop now... eh wait, you haven't started! Upload receipt!", emoji: "😅" },
        { template: "Eh, scan receipt boleh dapat Streak Freeze tau!", emoji: "❄️" },
        { template: "Kasi jadi boss, one upload and you level up!", emoji: "⬆️" },
        { template: "Wait what? You haven't scanned yet? Faster unlock perk lah!", emoji: "🚀" },
        { template: "Almost reach already... jk, need to start first! Upload now!", emoji: "😂" },
        { template: "One more receipt and you are... wait, need first receipt dulu!", emoji: "👑" },
        { template: "Unlock this and everyone will be jealous of your wallet!", emoji: "💰" },
        { template: "Steady bossku, just need to maintain momentum... after you start!", emoji: "🔥" },
        { template: "Nak badge? Nak achievement? Upload receipt dulu lah boss!", emoji: "🎖️" },
        { template: "Your trophy case empty ni. Let's fill it up!", emoji: "🏆" },
        { template: "Legend status waiting for you. Step 1: Upload receipt!", emoji: "⭐" },
        { template: "Achievement hunter mode: Activate by uploading receipt!", emoji: "🎮" },
        { template: "Rewards macam durian runtuh... but need receipt first!", emoji: "🍈" },
        { template: "Power level: 0. Solution: Upload that first receipt!", emoji: "💪" },
        { template: "XP bar empty lah boss. Feed it with receipts!", emoji: "📊" },
        { template: "Streak counter waiting. Don't make it wait too long!", emoji: "⏰" },
        { template: "Gold badge sikit lagi... after you upload something!", emoji: "🥇" },
        { template: "First receipt = VIP treatment. What you waiting for?", emoji: "👔" },
        { template: "Your achievement path: Currently loading... needs receipt!", emoji: "🛤️" },
        { template: "Perk zone locked. Key: Your first receipt scan!", emoji: "🔐" },
        { template: "Hall of fame reserved for you. Just need one upload!", emoji: "🏛️" },
        { template: "Bonus waiting to drop. Trigger: Upload receipt!", emoji: "🎁" },
        { template: "Level 1 so close, yet so far without receipt!", emoji: "📍" },
        { template: "Milestone: 0/1. Come on boss, you can do this!", emoji: "📈" },
        { template: "Champion material detected. Just need proof - receipt!", emoji: "🦸" },
        { template: "Your journey from zero to hero starts with one scan!", emoji: "🌟" },
        { template: "Badge collection: Empty. Fix it with one receipt!", emoji: "🃏" },
        { template: "Rewards raining soon... after you upload receipt lah!", emoji: "🌧️" },
    ],

    // ============ CATEGORY B: SPENDING SHIFT - EMPTY STATE (30 sentences) ============
    // Savings Insights - for users with 0 receipts

    spending_shift: [
        { template: "Jimat ke boros? I tak tau lagi. Upload receipt dulu!", emoji: "🤷" },
        { template: "Aiyoo, cannot analyze spending without data lah boss!", emoji: "😵" },
        { template: "Mantap or not? Show me your receipts first!", emoji: "🎯" },
        { template: "Eh, why no receipt? How I check your budget?", emoji: "🤔" },
        { template: "Steady or not your spending? Need receipts to tell!", emoji: "⚖️" },
        { template: "Wallet healthy ke? Cannot diagnose without data!", emoji: "🏥" },
        { template: "Sale season coming, but I dunno your spending pattern!", emoji: "🛒" },
        { template: "Lifestyle spending... unknown. Upload to reveal!", emoji: "🔍" },
        { template: "Boss, your spending story blank pages only!", emoji: "📖" },
        { template: "Jimat sikit-sikit? Or boros gila-gila? Show receipts!", emoji: "💸" },
        { template: "Category breakdown loading... forever... need receipts!", emoji: "⏳" },
        { template: "Coffee addict or not? I cannot tell lah boss!", emoji: "☕" },
        { template: "Grab spending high ke low? Mystery without receipts!", emoji: "🚗" },
        { template: "Dining out champion? Or home cook king? Show proof!", emoji: "🍽️" },
        { template: "Your spending DNA: Currently unknown species!", emoji: "🧬" },
        { template: "Save more or spend more? The receipt knows!", emoji: "🔮" },
        { template: "Budget ninja or budget destroyer? Upload to find out!", emoji: "🥷" },
        { template: "Trend spotter offline. Activate with receipt upload!", emoji: "📡" },
        { template: "Smart spender vibes? Prove it with receipts lah!", emoji: "🧠" },
        { template: "Category king title available. Submit receipts to claim!", emoji: "👑" },
        { template: "Your financial fingerprint: Waiting to be scanned!", emoji: "🖐️" },
        { template: "Spending shift detector: No data, no detection!", emoji: "📉" },
        { template: "Week vs week comparison? Need weeks of data first!", emoji: "📅" },
        { template: "Money in, money out - show me the flow boss!", emoji: "🌊" },
        { template: "Habit tracker sleeping. Wake it with receipt upload!", emoji: "😴" },
        { template: "Good spending or bad spending? Receipts will tell!", emoji: "👀" },
        { template: "Auto-pilot spending or mindful spending? Unknown!", emoji: "🤖" },
        { template: "Your saving potential: Infinite? Or zero? Show data!", emoji: "∞" },
        { template: "Pattern recognition: 0 patterns. Feed me receipts!", emoji: "🔄" },
        { template: "Spending habits hidden. Unlock with receipt upload!", emoji: "🔓" },
    ],

    // ============ CATEGORY C: DAILY RUNWAY - EMPTY STATE (30 sentences) ============
    // Budget Awareness - for users with 0 receipts

    daily_runway: [
        { template: "Dining limit: RM ???/day. Cannot calculate without receipts!", emoji: "🍜" },
        { template: "Budget check: Unknown balance. Upload receipts to see!", emoji: "💰" },
        { template: "Daily runway looking... invisible? Need data lah boss!", emoji: "✈️" },
        { template: "Boss, end of month forecast: Maggi or steak? Unknown!", emoji: "🍝" },
        { template: "Pokai alert system: Offline. Needs receipt data!", emoji: "🚨" },
        { template: "Relax or panic? Cannot advise without your spending!", emoji: "😰" },
        { template: "You sure want to buy that? I dunno your balance!", emoji: "🤷" },
        { template: "RM ??? per day. Help me help you - upload receipts!", emoji: "📊" },
        { template: "Runway safe or danger? Flight data missing!", emoji: "🛫" },
        { template: "Manage your duit well... but show me first lah!", emoji: "💵" },
        { template: "Budget GPS: No satellite signal. Needs receipts!", emoji: "🧭" },
        { template: "Cukup ke tidak sampai gaji? I honestly don't know!", emoji: "🤔" },
        { template: "Daily allowance calculator: Buffering forever...", emoji: "⏳" },
        { template: "Ikat perut or lepas makan? Cannot tell without data!", emoji: "🥋" },
        { template: "Survive or thrive this month? Receipts will reveal!", emoji: "🏕️" },
        { template: "Budget breathing room: Suffocating or spacious? Unknown!", emoji: "🫁" },
        { template: "Cash flow analysis: Stuck at loading screen!", emoji: "📱" },
        { template: "Days till payday: Known. Your spending: Mystery!", emoji: "📆" },
        { template: "Money stretch potential: Rubber band or stone? Dunno!", emoji: "📏" },
        { template: "End of month prediction: Crystal ball needs receipts!", emoji: "🔮" },
        { template: "Comfortable or tight budget? The receipts know!", emoji: "🎯" },
        { template: "Wallet health checkup: Doctor needs your data!", emoji: "💊" },
        { template: "Budget fuel gauge: Empty... of information!", emoji: "⛽" },
        { template: "Financial runway length: Calculating... need input!", emoji: "🛤️" },
        { template: "Spend wisely advice loading... waiting for receipts!", emoji: "📚" },
        { template: "Daily spend cap: ??? Boss, help me help you!", emoji: "🎓" },
        { template: "Survival mode or enjoyment mode? Unknown status!", emoji: "🏖️" },
        { template: "Budget navigator: Destination unknown, no map data!", emoji: "🗺️" },
        { template: "RM comfort zone: Undefined. Upload to calculate!", emoji: "🌡️" },
        { template: "Budget co-pilot standing by for your first receipt!", emoji: "🧑‍✈️" },
    ],
};

// ============ CATEGORY A: UNLOCK PERK - LIVE DATA (30 sentences) ============

export const LIVE_DATA_MESSAGES: Record<CoPilotCardType, CoPilotMessage[]> = {
    unlock_perk: [
        { template: "Sikit lagi boss! {receiptsToGoal} more receipts to reach '{goalName}' status.", emoji: "🎯" },
        { template: "Steady la, sikit lagi nak unlock {badgeName} badge ni!", emoji: "🏅" },
        { template: "Don't stop now, almost there already! {xpToNextLevel} XP more!", emoji: "🚀" },
        { template: "Eh, {receiptsToGoal} more scans and you get the Streak Freeze!", emoji: "❄️" },
        { template: "Kasi jadi boss, sikit lagi level up! {xpToNextLevel} XP to go!", emoji: "⬆️" },
        { template: "Wah {currentStreak}-day streak! Jangan putus, legend vibes!", emoji: "🔥" },
        { template: "Almost reach already! {receiptsToGoal} receipts to '{goalName}'!", emoji: "👑" },
        { template: "One more receipt and you are the king of jimat!", emoji: "💰" },
        { template: "Steady bossku, {currentStreak} days maintain that momentum!", emoji: "🔥" },
        { template: "Unlock this and everyone will be jealous! {receiptsToGoal} more!", emoji: "😎" },
        { template: "Badge alert! {receiptsToGoal} receipts until '{badgeName}' unlocks!", emoji: "🔔" },
        { template: "Power level rising! {xpToNextLevel} XP to evolution!", emoji: "💪" },
        { template: "Streak game strong! {currentStreak} days and counting!", emoji: "📈" },
        { template: "Champion material ni! Just {receiptsToGoal} more to go!", emoji: "🏆" },
        { template: "You're killing it boss! {currentStreak}-day budget warrior!", emoji: "⚔️" },
        { template: "Level up loading... {xpToNextLevel} XP needed. You got this!", emoji: "🎮" },
        { template: "Hebat! {currentStreak} days discipline. Few more for reward!", emoji: "⭐" },
        { template: "So close boss! {receiptsToGoal} uploads to achievement!", emoji: "🎖️" },
        { template: "XP machine! Just {xpToNextLevel} more points needed!", emoji: "💎" },
        { template: "Consistency king! {currentStreak} days tracked. Respect!", emoji: "👊" },
        { template: "Unlocking progress: {receiptsToGoal} receipts remaining!", emoji: "🔓" },
        { template: "Nearly there! {xpToNextLevel} XP untuk next milestone!", emoji: "🏁" },
        { template: "Streak master! {currentStreak} days budget discipline!", emoji: "🥷" },
        { template: "Achievement hunting! {receiptsToGoal} more targets to go!", emoji: "🎯" },
        { template: "Boss mode: {currentStreak}-day streak activated!", emoji: "😎" },
        { template: "Badge collection growing! {receiptsToGoal} to next unlock!", emoji: "🃏" },
        { template: "XP grind strong! {xpToNextLevel} points to glory!", emoji: "✨" },
        { template: "Streak on point! {currentStreak} days of smart spending!", emoji: "📍" },
        { template: "You're cruising! {xpToNextLevel} XP until reward drop!", emoji: "🎰" },
        { template: "Tracking pro! {currentStreak}-day streak, {xpToNextLevel} XP to go!", emoji: "🚀" },
    ],

    // ============ CATEGORY B: SPENDING SHIFT - LIVE DATA (30 sentences) ============

    spending_shift: [
        { template: "Wah, gila jimat! You spent RM{savedAmount} less on {categoryName} this week compared to last month.", emoji: "💰" },
        { template: "Aiyoo, spending on {categoryName} increased RM{overspentAmount}? Control sikit lah.", emoji: "😬" },
        { template: "Mantap! You spent {percentChange}% less on {categoryName} this month. Beres!", emoji: "✅" },
        { template: "Eh, why this week {categoryName} so much? Budget lari liao.", emoji: "📊" },
        { template: "Steady boss, keep this {categoryName} savings rate and you can tapao more!", emoji: "🍱" },
        { template: "Wallet looks healthy today, no weird spending on {categoryName}. Ngam!", emoji: "💚" },
        { template: "Online shopping damage? {categoryName} up RM{overspentAmount}. Oops!", emoji: "🛒" },
        { template: "{categoryName} spending down {percentChange}%? You are on fire!", emoji: "🔥" },
        { template: "Boss, your {categoryName} claims looking good, keep it up!", emoji: "👍" },
        { template: "Jimat sikit-sikit, lama-lama jadi bukit! RM{savedAmount} saved on {categoryName}!", emoji: "⛰️" },
        { template: "{categoryName} spending turun {percentChange}%. Syoknya!", emoji: "📉" },
        { template: "Wah boss, RM{savedAmount} less on {categoryName}. Pro move!", emoji: "🎯" },
        { template: "Eh, {categoryName} naik RM{overspentAmount}. Maybe reduce sikit?", emoji: "📈" },
        { template: "Best week! {categoryName} down RM{savedAmount}. You're winning!", emoji: "🏆" },
        { template: "Budget boss! {categoryName} slashed by {percentChange}%!", emoji: "🗡️" },
        { template: "Smooth spending! {percentChange}% better on {categoryName}!", emoji: "😎" },
        { template: "Heads up: {categoryName} RM{overspentAmount} above target.", emoji: "📢" },
        { template: "Killing it! RM{savedAmount} saved in {categoryName} alone!", emoji: "💪" },
        { template: "Category check: {categoryName} +RM{overspentAmount}. Watchlist!", emoji: "👁️" },
        { template: "Alert: {categoryName} spending creeping up {percentChange}%.", emoji: "🚨" },
        { template: "Champion move! RM{savedAmount} less on {categoryName}!", emoji: "🏅" },
        { template: "Review needed: {categoryName} over by RM{overspentAmount}.", emoji: "📋" },
        { template: "Smart spending! {categoryName} trimmed by {percentChange}%!", emoji: "🧠" },
        { template: "Caution: {categoryName} RM{overspentAmount} above budget.", emoji: "⚠️" },
        { template: "Great shift! {percentChange}% drop in {categoryName}!", emoji: "📉" },
        { template: "Oops! {categoryName} jumped RM{overspentAmount} this week.", emoji: "😅" },
        { template: "Victory! RM{savedAmount} saved on {categoryName} vs last {comparisonPeriod}!", emoji: "🎖️" },
        { template: "Minor slip: {categoryName} up {percentChange}%. Easy fix lah!", emoji: "🔧" },
        { template: "Discipline paid off! RM{savedAmount} less on {categoryName}!", emoji: "💵" },
        { template: "Flag: {categoryName} RM{overspentAmount} over. Adjust sikit!", emoji: "🚩" },
    ],

    // ============ CATEGORY C: DAILY RUNWAY - LIVE DATA ============
    // NOTE: This is a placeholder array. Actual messages are selected via threshold logic.
    // See DAILY_RUNWAY_TIERED_MESSAGES below for the real message pools.
    daily_runway: [],
};

// ============ DAILY RUNWAY TIERED MESSAGES (Discipline & Savings Buffer) ============
// Smart Threshold Logic: Pivot from "Permission to Spend" to "Encouragement to Save"

export type RunwayTier = 'high' | 'normal' | 'low';

// HIGH ALLOWANCE (>RM 100/day): "Savings Buffer" - Reward surplus, encourage saving
const DAILY_RUNWAY_HIGH: CoPilotMessage[] = [
    { template: "Wah boss, you have a huge RM{dailyAllowance}/day buffer for {categoryName}! Keep this up and you'll have a massive surplus!", emoji: "💰" },
    { template: "Rich vibes! RM{dailyAllowance}/day left for {categoryName}. Don't simply blow it, save for your next holiday!", emoji: "💰" },
    { template: "Discipline king! You only need RM{dailyAllowance}/day for {categoryName}. The rest can masuk savings!", emoji: "💰" },
    { template: "Boss level budgeting! RM{dailyAllowance}/day for {categoryName} = huge surplus incoming. Keep the momentum!", emoji: "💰" },
    { template: "Gila jimat! RM{dailyAllowance}/day buffer for {categoryName}. This surplus boleh jadi emergency fund!", emoji: "💰" },
    { template: "Financial boss mode! RM{dailyAllowance}/day for {categoryName}. Park the extra in ASB lah!", emoji: "💰" },
    { template: "Wah, RM{dailyAllowance}/day for {categoryName}? You're basically printing money this month!", emoji: "💰" },
    { template: "Surplus alert! RM{dailyAllowance}/day {categoryName} buffer. Future you will thank present you!", emoji: "💰" },
    { template: "Legend status! RM{dailyAllowance}/day for {categoryName}. Save the surplus for raya shopping!", emoji: "💰" },
    { template: "Boss, RM{dailyAllowance}/day for {categoryName} is huge! Channel excess to savings goal!", emoji: "💰" },
];

// NORMAL ALLOWANCE (RM 30-100/day): "Steady Pace" - Balanced messaging
const DAILY_RUNWAY_NORMAL: CoPilotMessage[] = [
    { template: "Steady pace! You've got RM{dailyAllowance}/day for {categoryName}. On track for a clean month.", emoji: "✅" },
    { template: "Balanced vibes! RM{dailyAllowance}/day for {categoryName}. Not tight, not loose - just nice!", emoji: "⚖️" },
    { template: "Comfortable zone! RM{dailyAllowance}/day for {categoryName}. Maintain this and you're golden!", emoji: "👍" },
    { template: "On track boss! RM{dailyAllowance}/day for {categoryName}. Keep the discipline going!", emoji: "🎯" },
    { template: "Manageable! RM{dailyAllowance}/day for {categoryName}. Stay mindful and you'll finish strong!", emoji: "💪" },
    { template: "Budget GPS says: RM{dailyAllowance}/day for {categoryName}. Smooth sailing ahead!", emoji: "🧭" },
    { template: "Looking good! RM{dailyAllowance}/day for {categoryName}. Small savings still add up!", emoji: "📈" },
    { template: "Boleh tahan! RM{dailyAllowance}/day for {categoryName}. Room to breathe, room to save!", emoji: "🫁" },
    { template: "Sweet spot! RM{dailyAllowance}/day for {categoryName}. Consistency is key, boss!", emoji: "🔑" },
    { template: "Steady Eddie! RM{dailyAllowance}/day for {categoryName}. Keep this pace till month end!", emoji: "🏃" },
];

// LOW ALLOWANCE (<RM 30/day): "Ikat Perut" - Warning mode
const DAILY_RUNWAY_LOW: CoPilotMessage[] = [
    { template: "Careful boss! RM{dailyAllowance}/day only for {categoryName}. Ikat perut sikit this week.", emoji: "🚨" },
    { template: "Warning: RM{dailyAllowance}/day for {categoryName}. Think twice before that purchase!", emoji: "⚠️" },
    { template: "Tight runway! RM{dailyAllowance}/day for {categoryName}. Cook at home, save outside money!", emoji: "🍳" },
    { template: "Budget alert! RM{dailyAllowance}/day for {categoryName}. Survival mode activated!", emoji: "🚨" },
    { template: "Yikes! RM{dailyAllowance}/day for {categoryName}. Skip the Grab, take LRT this week!", emoji: "🚇" },
    { template: "Danger zone! RM{dailyAllowance}/day for {categoryName}. Every ringgit counts now!", emoji: "🚨" },
    { template: "Pokai incoming! RM{dailyAllowance}/day for {categoryName}. Time to channel inner jimat spirit!", emoji: "😰" },
    { template: "Red alert! RM{dailyAllowance}/day for {categoryName}. Postpone non-essentials lah boss!", emoji: "🔴" },
    { template: "Oops! RM{dailyAllowance}/day for {categoryName}. Maggi week incoming if not careful!", emoji: "🍜" },
    { template: "SOS! RM{dailyAllowance}/day for {categoryName}. Discipline mode: Maximum level!", emoji: "🆘" },
];

export const DAILY_RUNWAY_TIERED_MESSAGES: Record<RunwayTier, CoPilotMessage[]> = {
    high: DAILY_RUNWAY_HIGH,
    normal: DAILY_RUNWAY_NORMAL,
    low: DAILY_RUNWAY_LOW,
};

// Threshold constants
const HIGH_ALLOWANCE_THRESHOLD = 100; // >RM 100/day = Savings Buffer
const LOW_ALLOWANCE_THRESHOLD = 30;   // <RM 30/day = Ikat Perut

/**
 * Determine runway tier based on daily allowance
 */
export function getRunwayTier(dailyAllowance: number): RunwayTier {
    if (dailyAllowance > HIGH_ALLOWANCE_THRESHOLD) return 'high';
    if (dailyAllowance < LOW_ALLOWANCE_THRESHOLD) return 'low';
    return 'normal';
}

// ============ RANDOMIZATION ENGINE ============

/**
 * Session-based index tracker to prevent repetition
 */
const sessionIndices: Record<CoPilotCardType, Set<number>> = {
    unlock_perk: new Set(),
    spending_shift: new Set(),
    daily_runway: new Set(),
};

/**
 * Get a random index that hasn't been used recently
 */
function getRandomIndex(cardType: CoPilotCardType, maxIndex: number): number {
    const usedIndices = sessionIndices[cardType];

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
 * Get random empty state message for a card type
 */
export function getEmptyStateMessage(cardType: CoPilotCardType): CoPilotMessage {
    const messages = EMPTY_STATE_MESSAGES[cardType];
    const index = getRandomIndex(cardType, messages.length);
    return messages[index];
}

/**
 * Get random live data message with variable interpolation
 * For daily_runway, uses smart threshold logic to select appropriate message tier
 */
export function getLiveDataMessage(
    cardType: CoPilotCardType,
    context: LiveDataContext
): CoPilotMessage {
    let messages: CoPilotMessage[];

    // Smart threshold logic for Daily Runway
    if (cardType === 'daily_runway' && context.dailyAllowance !== undefined) {
        const tier = getRunwayTier(context.dailyAllowance);
        messages = DAILY_RUNWAY_TIERED_MESSAGES[tier];
    } else {
        messages = LIVE_DATA_MESSAGES[cardType];
    }

    // Handle empty array case (shouldn't happen, but safety check)
    if (messages.length === 0) {
        messages = DAILY_RUNWAY_TIERED_MESSAGES['normal'];
    }

    const index = getRandomIndex(cardType, messages.length);
    const message = messages[index];

    // Interpolate variables in template
    let interpolated = message.template;

    Object.entries(context).forEach(([key, value]) => {
        if (value !== undefined) {
            const placeholder = `{${key}}`;
            const displayValue = typeof value === 'number'
                ? (key !== 'daysRemaining' && (key.includes('Amount') || key.includes('Allowance') || key.includes('Remaining') || key.includes('Savings'))
                    ? value.toFixed(2)
                    : value.toString())
                : value.toString();
            interpolated = interpolated.replace(new RegExp(placeholder, 'g'), displayValue);
        }
    });

    return {
        template: interpolated,
        emoji: message.emoji,
    };
}

/**
 * Reset session indices (call on app launch or dashboard refresh)
 */
export function resetSessionIndices(): void {
    sessionIndices.unlock_perk.clear();
    sessionIndices.spending_shift.clear();
    sessionIndices.daily_runway.clear();
}

/**
 * Get all messages for a card type (for testing/preview)
 */
export function getAllMessages(
    cardType: CoPilotCardType,
    isEmpty: boolean
): CoPilotMessage[] {
    return isEmpty ? EMPTY_STATE_MESSAGES[cardType] : LIVE_DATA_MESSAGES[cardType];
}
