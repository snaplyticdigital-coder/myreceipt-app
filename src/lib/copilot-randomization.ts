/**
 * Co-Pilot High-Entropy Randomization Engine
 * Provides 30 unique Manglish variations for each card type
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

// ============ EMPTY STATE MESSAGES (30 variations each) ============

export const EMPTY_STATE_MESSAGES: Record<CoPilotCardType, CoPilotMessage[]> = {
    unlock_perk: [
        { template: "Hey boss, upload sikit receipt dulu! I nak unlock your achievement path.", emoji: "🎯" },
        { template: "Eh, mana receipt? Upload satu je pun okay, baru boleh start track!", emoji: "📱" },
        { template: "Sikit lagi boss! Just need ONE receipt to kickstart your journey.", emoji: "🚀" },
        { template: "Weh, upload receipt lah. Nanti I tunjuk how much you boleh save!", emoji: "💡" },
        { template: "First receipt = first badge. Jom start collect achievement!", emoji: "🏅" },
        { template: "Boss, I cannot kenal your pattern yet. Upload receipt boleh?", emoji: "🤔" },
        { template: "Nak unlock rewards? Simple je - upload your first transaction!", emoji: "🎁" },
        { template: "Your Co-Pilot ready lah, but need data first. Upload receipt!", emoji: "✈️" },
        { template: "One small upload, one giant leap for your wallet! Jom boss!", emoji: "🌟" },
        { template: "Eh waiting for you ni. Upload receipt, then we talk savings!", emoji: "⏳" },
        { template: "Zero receipts = zero insights. Let's change that, boss!", emoji: "📊" },
        { template: "I'm excited nak help you, but need receipt dulu okay?", emoji: "😊" },
        { template: "Sikit je lagi - one upload and your journey begins!", emoji: "🏁" },
        { template: "Boss, jangan shy! Upload receipt, I won't judge spending.", emoji: "🤫" },
        { template: "Ready to track? Just need that first receipt to start!", emoji: "✅" },
        { template: "Your financial journey starts here. Upload receipt sekarang!", emoji: "🗺️" },
        { template: "Nak tau spending habit? I need data first lah boss!", emoji: "📈" },
        { template: "Achievement unlocked: Open App. Next: Upload First Receipt!", emoji: "🎮" },
        { template: "Woi boss, camera tu for scanning receipt tau, bukan selfie!", emoji: "📸" },
        { template: "Empty wallet data ni. Feed me receipt, I feed you insights!", emoji: "🍽️" },
        { template: "Jom boss! First receipt gets special welcome bonus XP!", emoji: "⭐" },
        { template: "I boleh predict your spending, tapi need receipt dulu!", emoji: "🔮" },
        { template: "Waiting mode activated. Deactivate by uploading receipt!", emoji: "⏸️" },
        { template: "Hey, your Co-Pilot here. Upload receipt, then we fly!", emoji: "🛫" },
        { template: "Solid advice coming your way - after first upload lah!", emoji: "💪" },
        { template: "Boss said upload? Boss uploads! Jom start tracking!", emoji: "👊" },
        { template: "Receipt = Power. No receipt = I can't help much yet.", emoji: "⚡" },
        { template: "Nak rewards? Nak badges? First step: upload that receipt!", emoji: "🎖️" },
        { template: "Your data vault empty ni. Time to fill it up, boss!", emoji: "🏦" },
        { template: "Let me be your money buddy - just need one receipt!", emoji: "🤝" },
    ],

    spending_shift: [
        { template: "Jimat ke boros? I tak tau lagi. Upload receipt dulu!", emoji: "🤷" },
        { template: "Spending pattern? Belum nampak. Kasi receipt sikit!", emoji: "👀" },
        { template: "Nak compare spending? Need data first lah boss!", emoji: "📊" },
        { template: "Mantap ke tidak? I cannot tell without receipts!", emoji: "🎯" },
        { template: "Your spending mystery to me now. Upload to reveal!", emoji: "🔍" },
        { template: "Steady spending or not? Kena upload receipt baru tau!", emoji: "⚖️" },
        { template: "Weh, I nak analyze your habits, tapi mana data?", emoji: "🧐" },
        { template: "Good spender or naughty spender? Upload and I tell!", emoji: "😇" },
        { template: "Trend line flat je now. Add receipts to see pattern!", emoji: "📉" },
        { template: "Your spending story - blank pages. Let's write it!", emoji: "📖" },
        { template: "Jimat gila or spend gila? Only receipts will tell!", emoji: "💸" },
        { template: "Category breakdown loading... needs receipts to complete!", emoji: "⏳" },
        { template: "I nak share spending tips, but need your data first!", emoji: "💡" },
        { template: "Positive shift or negative shift? Upload to find out!", emoji: "↕️" },
        { template: "Your financial health check - pending receipt upload!", emoji: "🏥" },
        { template: "Savings potential: Unknown. Solution: Upload receipts!", emoji: "❓" },
        { template: "Comparison mode offline. Upload receipts to activate!", emoji: "🔌" },
        { template: "Week vs week analysis? Need weeks of data first lah!", emoji: "📅" },
        { template: "Nak tau habit baik ke tak? Kasi receipt boleh?", emoji: "🪞" },
        { template: "Spending shift detector: Standby. Waiting for input!", emoji: "📡" },
        { template: "Your wallet whispers secrets - I just need receipts to hear!", emoji: "👂" },
        { template: "Pattern recognition: 0 patterns found. Upload to change!", emoji: "🔄" },
        { template: "Shift happens - but I need data to track it boss!", emoji: "🔀" },
        { template: "Money in, money out - help me track by uploading!", emoji: "💰" },
        { template: "Category king? Category rookie? Upload and find out!", emoji: "👑" },
        { template: "Spending DNA analysis pending... needs sample receipts!", emoji: "🧬" },
        { template: "Trend spotter mode: Need minimum 1 receipt to start!", emoji: "🔭" },
        { template: "Your spending fingerprint - unique but invisible still!", emoji: "🖐️" },
        { template: "Habit tracker idle. Wake it up with receipt upload!", emoji: "😴" },
        { template: "Smart spending or auto-pilot spending? Let's discover!", emoji: "🤖" },
    ],

    daily_runway: [
        { template: "Daily budget? Cannot calculate without spending history!", emoji: "🧮" },
        { template: "Runway check: No flight data. Upload receipts to taxi!", emoji: "✈️" },
        { template: "Boleh tahan sampai gaji? I don't know yet lah boss!", emoji: "💭" },
        { template: "Budget pacing unknown. Receipts will light the way!", emoji: "🔦" },
        { template: "Your daily allowance: Loading... needs receipts!", emoji: "⌛" },
        { template: "Ikat perut or loose belt? Upload to find out!", emoji: "🥋" },
        { template: "Days till payday: Known. Daily budget: Needs data!", emoji: "📆" },
        { template: "Runway length: Infinite possibilities. Upload to narrow!", emoji: "∞" },
        { template: "Budget GPS offline. Upload receipt to get directions!", emoji: "🧭" },
        { template: "Cukup ke tidak sampai end month? Let's calculate!", emoji: "🔢" },
        { template: "Your spending runway: Clear skies, no data. Upload!", emoji: "☀️" },
        { template: "Daily limit calculator buffering... feed me receipts!", emoji: "📲" },
        { template: "Can last until pay day? Upload receipts to predict!", emoji: "🔮" },
        { template: "Budget forecast: Cloudy, chance of receipts needed!", emoji: "🌤️" },
        { template: "Money runway check: Insufficient data for takeoff!", emoji: "🛬" },
        { template: "Spend wisely? Spend freely? Need data to advise!", emoji: "⚖️" },
        { template: "Daily allowance oracle here - just need receipts!", emoji: "🔮" },
        { template: "Budget meter: Empty. Fill up with receipt uploads!", emoji: "⛽" },
        { template: "Your spending fuel gauge: Waiting for calibration!", emoji: "🌡️" },
        { template: "Survival mode or thriving mode? Receipts will tell!", emoji: "🏕️" },
        { template: "Cash flow analysis: Pending your first transaction!", emoji: "🌊" },
        { template: "Days remaining: Many. Daily budget: Calculating...", emoji: "🔄" },
        { template: "Money stretch potential: Unknown. Upload to measure!", emoji: "📏" },
        { template: "Budget breathing room: Need receipts to measure!", emoji: "🫁" },
        { template: "Tight budget or comfortable? I'll tell you - with data!", emoji: "🎯" },
        { template: "Your wallet health: Checkup pending receipt upload!", emoji: "💊" },
        { template: "End of month forecast: Sunny with chance of receipts!", emoji: "🌈" },
        { template: "Daily spending guide loading... upload to complete!", emoji: "📚" },
        { template: "Runway status: Under construction. Add receipts!", emoji: "🚧" },
        { template: "Budget co-pilot standing by for your first receipt!", emoji: "🧑‍✈️" },
    ],
};

// ============ LIVE DATA MESSAGES (30 variations each) ============

export const LIVE_DATA_MESSAGES: Record<CoPilotCardType, CoPilotMessage[]> = {
    unlock_perk: [
        { template: "Sikit lagi boss! {receiptsToGoal} more receipts to '{goalName}' status!", emoji: "🏅" },
        { template: "Wah, {currentStreak}-day streak! Jangan putus, mantap sangat!", emoji: "🔥" },
        { template: "Almost there! {receiptsToGoal} receipts je lagi untuk unlock badge!", emoji: "🎯" },
        { template: "Nak sampai dah! {xpToNextLevel} XP to level up. Keep going boss!", emoji: "⬆️" },
        { template: "Steady boss! {currentStreak} days consistent. Legend vibes!", emoji: "👑" },
        { template: "On fire lah you! {receiptsToGoal} more untuk '{badgeName}' badge!", emoji: "💥" },
        { template: "Progress looking good! {xpToNextLevel} XP away from next reward!", emoji: "🎁" },
        { template: "Streak game strong! {currentStreak} days and counting!", emoji: "📈" },
        { template: "Champion material ni! Just {receiptsToGoal} more to go!", emoji: "🏆" },
        { template: "You're killing it boss! {currentStreak}-day budget warrior!", emoji: "⚔️" },
        { template: "Badge alert! {receiptsToGoal} receipts until '{goalName}' unlocks!", emoji: "🔔" },
        { template: "Level up loading... {xpToNextLevel} XP needed. You got this!", emoji: "🎮" },
        { template: "Hebat! {currentStreak} days discipline. Few more for reward!", emoji: "💪" },
        { template: "So close boss! {receiptsToGoal} uploads to achievement!", emoji: "🎖️" },
        { template: "XP machine! Just {xpToNextLevel} more points needed!", emoji: "⭐" },
        { template: "Consistency king! {currentStreak} days tracked. Respect!", emoji: "👊" },
        { template: "Unlocking progress: {receiptsToGoal} receipts remaining!", emoji: "🔓" },
        { template: "Nearly there! {xpToNextLevel} XP untuk next milestone!", emoji: "🏁" },
        { template: "Streak master! {currentStreak} days budget discipline!", emoji: "🥷" },
        { template: "Achievement hunting! {receiptsToGoal} more targets to go!", emoji: "🎯" },
        { template: "Power level rising! {xpToNextLevel} XP to evolution!", emoji: "🐉" },
        { template: "Boss mode: {currentStreak}-day streak activated!", emoji: "😎" },
        { template: "Badge collection growing! {receiptsToGoal} to next unlock!", emoji: "🃏" },
        { template: "XP grind strong! {xpToNextLevel} points to glory!", emoji: "💎" },
        { template: "Streak on point! {currentStreak} days of smart spending!", emoji: "📍" },
        { template: "Achievement progress: {receiptsToGoal} receipts away!", emoji: "🔥" },
        { template: "You're crusing! {xpToNextLevel} XP until reward drop!", emoji: "🎰" },
        { template: "Budget hero! {currentStreak} days saved. Keep it up!", emoji: "🦸" },
        { template: "Close! {receiptsToGoal} more uploads to milestone!", emoji: "🌟" },
        { template: "Tracking pro! {currentStreak}-day streak, {xpToNextLevel} XP to go!", emoji: "🚀" },
    ],

    spending_shift: [
        { template: "Jimat RM{savedAmount} on {topCategory} vs last month. Mantap!", emoji: "🌟" },
        { template: "Steady lah! {topCategory} spending turun {percentChange}%!", emoji: "📉" },
        { template: "Wah, saved RM{savedAmount} this week. Gila jimat boss!", emoji: "💰" },
        { template: "{topCategory} naik sikit - RM{overspentAmount} more than usual.", emoji: "📊" },
        { template: "Best week! {topCategory} down RM{savedAmount}. You're winning!", emoji: "🏆" },
        { template: "Eh, {topCategory} lari budget sikit - RM{overspentAmount} over.", emoji: "⚠️" },
        { template: "Jimat gila! RM{savedAmount} less on {topCategory} this month!", emoji: "🎉" },
        { template: "Nice shift! {percentChange}% reduction in {topCategory}!", emoji: "✅" },
        { template: "Spending alert: {topCategory} up RM{overspentAmount} vs average.", emoji: "🔔" },
        { template: "Solid savings! RM{savedAmount} cut from {topCategory}. Pro move!", emoji: "💪" },
        { template: "Watch out! {topCategory} trending up {percentChange}%.", emoji: "👀" },
        { template: "Budget boss! {topCategory} slashed by RM{savedAmount}!", emoji: "🗡️" },
        { template: "Smooth! {percentChange}% better on {topCategory} spending!", emoji: "😎" },
        { template: "Heads up: {topCategory} RM{overspentAmount} above target.", emoji: "📢" },
        { template: "Killing it! RM{savedAmount} saved in {topCategory} alone!", emoji: "🔥" },
        { template: "Category check: {topCategory} +RM{overspentAmount}. Watchlist!", emoji: "👁️" },
        { template: "Syoknya! {topCategory} expenses down {percentChange}%!", emoji: "🥳" },
        { template: "Alert: {topCategory} spending creeping up RM{overspentAmount}.", emoji: "🚨" },
        { template: "Champion move! RM{savedAmount} less on {topCategory}!", emoji: "🏅" },
        { template: "Review needed: {topCategory} over by {percentChange}%.", emoji: "📋" },
        { template: "Smart spending! {topCategory} trimmed by RM{savedAmount}!", emoji: "🧠" },
        { template: "Caution: {topCategory} RM{overspentAmount} above budget.", emoji: "⛔" },
        { template: "Great shift! {percentChange}% drop in {topCategory}!", emoji: "📉" },
        { template: "Oops! {topCategory} jumped RM{overspentAmount} this week.", emoji: "😬" },
        { template: "Victory! RM{savedAmount} saved vs last {comparisonPeriod}!", emoji: "🎖️" },
        { template: "Minor slip: {topCategory} up {percentChange}%. Easy fix!", emoji: "🔧" },
        { template: "Discipline paid off! RM{savedAmount} less on {topCategory}!", emoji: "💵" },
        { template: "Check this: {topCategory} trending RM{overspentAmount} high.", emoji: "📈" },
        { template: "Boss move! {topCategory} cut {percentChange}% vs average!", emoji: "👔" },
        { template: "Flag: {topCategory} RM{overspentAmount} over. Adjust lah!", emoji: "🚩" },
    ],

    daily_runway: [
        { template: "Daily limit: RM{dailyAllowance}/day for the next {daysRemaining} days. Boleh!", emoji: "👍" },
        { template: "RM{budgetRemaining} left. That's RM{dailyAllowance}/day until payday!", emoji: "💰" },
        { template: "Runway check: RM{dailyAllowance} daily for {daysRemaining} days. Cukup!", emoji: "✈️" },
        { template: "Tight budget: RM{dailyAllowance}/day. Ikat perut sikit boss!", emoji: "🥋" },
        { template: "Looking good! RM{dailyAllowance} daily, {daysRemaining} days to go!", emoji: "🌟" },
        { template: "Budget status: RM{budgetRemaining} remaining. Pace wisely!", emoji: "🏃" },
        { template: "Boleh tahan! RM{dailyAllowance}/day should last till gaji!", emoji: "💪" },
        { template: "RM{dailyAllowance} per day x {daysRemaining} days = You're safe!", emoji: "✅" },
        { template: "Stretching budget: RM{dailyAllowance} daily. Discipline mode!", emoji: "🎯" },
        { template: "Sweet spot! RM{dailyAllowance}/day with RM{budgetRemaining} left!", emoji: "🎰" },
        { template: "Runway extended! RM{dailyAllowance} daily for {daysRemaining} days!", emoji: "🛫" },
        { template: "Budget GPS: RM{dailyAllowance}/day to reach end of month!", emoji: "🧭" },
        { template: "Cukup-cukup makan: RM{dailyAllowance} daily. Stay focused!", emoji: "🍜" },
        { template: "Money stretch: RM{budgetRemaining} / {daysRemaining} days = Doable!", emoji: "📐" },
        { template: "Daily allowance: RM{dailyAllowance}. {daysRemaining} days runway!", emoji: "📊" },
        { template: "Projected savings: RM{projectedSavings} if you maintain pace!", emoji: "💎" },
        { template: "RM{dailyAllowance} a day keeps debt away! {daysRemaining} days left!", emoji: "🏥" },
        { template: "Budget breathing room: RM{dailyAllowance}/day. Manageable!", emoji: "🫁" },
        { template: "Pace setter: RM{dailyAllowance} daily = Comfortable month!", emoji: "🏆" },
        { template: "RM{budgetRemaining} in tank, {daysRemaining} days journey. Steady!", emoji: "⛽" },
        { template: "Daily spend cap: RM{dailyAllowance}. You've got this boss!", emoji: "🎓" },
        { template: "Survival mode: RM{dailyAllowance}/day for {daysRemaining} more days!", emoji: "🏕️" },
        { template: "End of month forecast: RM{projectedSavings} surplus if careful!", emoji: "🌈" },
        { template: "Runway solid! RM{dailyAllowance} daily budget secured!", emoji: "🔐" },
        { template: "Money meter: RM{budgetRemaining} left, RM{dailyAllowance}/day target!", emoji: "🌡️" },
        { template: "Budget navigator: RM{dailyAllowance}/day for {daysRemaining} days!", emoji: "🗺️" },
        { template: "Comfortable pace: RM{dailyAllowance} daily. Keep it up!", emoji: "😌" },
        { template: "Financial runway: RM{budgetRemaining} = {daysRemaining} days covered!", emoji: "🛤️" },
        { template: "Daily target locked: RM{dailyAllowance}. {daysRemaining} days remain!", emoji: "🔒" },
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
