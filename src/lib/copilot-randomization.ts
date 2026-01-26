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
    topCategory?: string;
    percentChange?: number;
    comparisonPeriod?: string;

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
        { template: "Shopee 11.11 coming, but I dunno your spending pattern!", emoji: "🛒" },
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
        { template: "Wah, saved RM{savedAmount} on {topCategory} this week. Gila jimat boss!", emoji: "💰" },
        { template: "Aiyoo, spending on {topCategory} increased RM{overspentAmount}? Control sikit lah.", emoji: "😬" },
        { template: "Mantap! You spent {percentChange}% less on {topCategory} this month. Beres!", emoji: "✅" },
        { template: "Eh, why this week {topCategory} so much? Budget lari liao.", emoji: "📊" },
        { template: "Steady boss, keep this savings rate and you can tapao more!", emoji: "🍱" },
        { template: "Wallet looks healthy today, no weird spending on {topCategory}. Ngam!", emoji: "💚" },
        { template: "Shopee 11.11 damage? {topCategory} up RM{overspentAmount}. Oops!", emoji: "🛒" },
        { template: "Lifestyle spending down {percentChange}%? You are on fire!", emoji: "🔥" },
        { template: "Boss, your {topCategory} claims looking good, keep it up!", emoji: "👍" },
        { template: "Jimat sikit-sikit, lama-lama jadi bukit! RM{savedAmount} saved!", emoji: "⛰️" },
        { template: "{topCategory} spending turun {percentChange}%. Syoknya!", emoji: "📉" },
        { template: "Wah boss, RM{savedAmount} less on {topCategory}. Pro move!", emoji: "🎯" },
        { template: "Eh, {topCategory} naik RM{overspentAmount}. Maybe reduce sikit?", emoji: "📈" },
        { template: "Best week! {topCategory} down RM{savedAmount}. You're winning!", emoji: "🏆" },
        { template: "Budget boss! {topCategory} slashed by {percentChange}%!", emoji: "🗡️" },
        { template: "Smooth spending! {percentChange}% better on {topCategory}!", emoji: "😎" },
        { template: "Heads up: {topCategory} RM{overspentAmount} above target.", emoji: "📢" },
        { template: "Killing it! RM{savedAmount} saved in {topCategory} alone!", emoji: "💪" },
        { template: "Category check: {topCategory} +RM{overspentAmount}. Watchlist!", emoji: "👁️" },
        { template: "Alert: {topCategory} spending creeping up {percentChange}%.", emoji: "🚨" },
        { template: "Champion move! RM{savedAmount} less on {topCategory}!", emoji: "🏅" },
        { template: "Review needed: {topCategory} over by RM{overspentAmount}.", emoji: "📋" },
        { template: "Smart spending! {topCategory} trimmed by {percentChange}%!", emoji: "🧠" },
        { template: "Caution: {topCategory} RM{overspentAmount} above budget.", emoji: "⚠️" },
        { template: "Great shift! {percentChange}% drop in {topCategory}!", emoji: "📉" },
        { template: "Oops! {topCategory} jumped RM{overspentAmount} this week.", emoji: "😅" },
        { template: "Victory! RM{savedAmount} saved vs last {comparisonPeriod}!", emoji: "🎖️" },
        { template: "Minor slip: {topCategory} up {percentChange}%. Easy fix lah!", emoji: "🔧" },
        { template: "Discipline paid off! RM{savedAmount} less on {topCategory}!", emoji: "💵" },
        { template: "Flag: {topCategory} RM{overspentAmount} over. Adjust sikit!", emoji: "🚩" },
    ],

    // ============ CATEGORY C: DAILY RUNWAY - LIVE DATA (30 sentences) ============

    daily_runway: [
        { template: "Dining limit: RM{dailyAllowance}/day for the next {daysRemaining} days. Boleh?", emoji: "🍜" },
        { template: "Budget check: You have RM{budgetRemaining} left until payday. Cukup bo?", emoji: "💰" },
        { template: "Daily runway looking short... RM{dailyAllowance}/day. Ikat perut sikit lah.", emoji: "🥋" },
        { template: "Boss, if you spend like this, end of month makan Maggi only!", emoji: "🍝" },
        { template: "Pokai alert! RM{budgetRemaining} left. Better stop the spending spree now.", emoji: "🚨" },
        { template: "Relax boss, RM{budgetRemaining} still got balance. Can chill a bit.", emoji: "😌" },
        { template: "You sure want to buy that? RM{dailyAllowance}/day only remaining!", emoji: "🤔" },
        { template: "RM{dailyAllowance} per day or you lose your Gold status. Steady?", emoji: "🥇" },
        { template: "Runway safe for {daysRemaining} days. Don't go goyang kaki yet!", emoji: "🛋️" },
        { template: "Manage your duit well! RM{budgetRemaining} for {daysRemaining} days.", emoji: "💵" },
        { template: "Budget GPS: RM{dailyAllowance}/day to reach end of month!", emoji: "🧭" },
        { template: "Cukup-cukup makan: RM{dailyAllowance} daily. Stay focused boss!", emoji: "🎯" },
        { template: "Boleh tahan! RM{dailyAllowance}/day should last till gaji!", emoji: "💪" },
        { template: "RM{dailyAllowance} per day x {daysRemaining} days = You're safe!", emoji: "✅" },
        { template: "Stretching budget: RM{dailyAllowance} daily. Discipline mode!", emoji: "🧘" },
        { template: "Sweet spot! RM{dailyAllowance}/day with RM{budgetRemaining} left!", emoji: "🎰" },
        { template: "Runway extended! RM{dailyAllowance} daily for {daysRemaining} days!", emoji: "🛫" },
        { template: "Money stretch: RM{budgetRemaining} / {daysRemaining} days = Doable!", emoji: "📐" },
        { template: "Projected savings: RM{projectedSavings} if you maintain pace!", emoji: "💎" },
        { template: "RM{dailyAllowance} a day keeps hutang away! {daysRemaining} days left!", emoji: "🏥" },
        { template: "Budget breathing room: RM{dailyAllowance}/day. Manageable lah!", emoji: "🫁" },
        { template: "Pace setter: RM{dailyAllowance} daily = Comfortable month!", emoji: "🏆" },
        { template: "RM{budgetRemaining} in tank, {daysRemaining} days journey. Steady!", emoji: "⛽" },
        { template: "Daily spend cap: RM{dailyAllowance}. You've got this boss!", emoji: "🎓" },
        { template: "Survival mode: RM{dailyAllowance}/day for {daysRemaining} more days!", emoji: "🏕️" },
        { template: "End of month forecast: RM{projectedSavings} surplus if careful!", emoji: "🌈" },
        { template: "Runway solid! RM{dailyAllowance} daily budget secured!", emoji: "🔐" },
        { template: "Budget navigator: RM{dailyAllowance}/day for {daysRemaining} days!", emoji: "🗺️" },
        { template: "Comfortable pace: RM{dailyAllowance} daily. Keep it up boss!", emoji: "😊" },
        { template: "Budget co-pilot says: RM{dailyAllowance}/day. Smooth flying!", emoji: "🧑‍✈️" },
    ],
};

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
 */
export function getLiveDataMessage(
    cardType: CoPilotCardType,
    context: LiveDataContext
): CoPilotMessage {
    const messages = LIVE_DATA_MESSAGES[cardType];
    const index = getRandomIndex(cardType, messages.length);
    const message = messages[index];

    // Interpolate variables in template
    let interpolated = message.template;

    Object.entries(context).forEach(([key, value]) => {
        if (value !== undefined) {
            const placeholder = `{${key}}`;
            const displayValue = typeof value === 'number'
                ? (key.includes('Amount') || key.includes('Allowance') || key.includes('Remaining') || key.includes('Savings')
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
