/**
 * InsightsCard - "Your Financial Co-Pilot" (Phase 7: Randomized Manglish)
 * 
 * Implements 3 Compulsory Cards with Randomized Localized Copy:
 * A. 'Sikit Lagi' Logic (Achievement)
 * B. 'Syoknya' Logic (Habit)
 * C. 'Boleh Tahan' Logic (Budget)
 */
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { calculateAchievements, ACHIEVEMENTS } from '../lib/achievements';
import {
    Medal, TrendingDown, Plane, ChevronRight, AlertCircle, PlusCircle, ShoppingBag, Target
} from 'lucide-react';

type InsightType = 'progress' | 'habit' | 'runway';

interface InsightItem {
    id: string;
    type: InsightType;
    title: string;
    message: string;
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    linkTo: string;
}

// --- Randomized Phrase Library ---

const PHRASE_LIBRARY = {
    achievement: {
        unlocked: [
            (name: string) => `Mantap! 🏆 Just unlocked the ${name} badge. Power lah you!`,
            (name: string) => `Achievement Unlocked! 🥇 ${name} badge is yours. Jom check your collection.`
        ],
        progress: [
            (name: string, pct: number) => `Sikit lagi boss! 💎 Just ${(100 - pct).toFixed(0)}% more to get ${name}. Jom save a bit more!`,
            (name: string, pct: number) => `Steady lah! 📈 You're ${pct.toFixed(0)}% done with ${name}. One last push je ni.`
        ]
    },
    habit: {
        positive: [
            (cat: string, diff: number) => `Syoknya! 🌟 Saved RM${diff.toFixed(0)} on ${cat} this month. Boleh belanja kawan makan!`,
            (cat: string, _diff: number) => `Jimat betul! ✨ Spending on ${cat} dropped this week. Good job, keep it up!`
        ],
        frequency: [
            (merchant: string) => `Perasan tak? 🤔 You visited ${merchant} a lot lately. Loyal customer ni!`,
            (merchant: string) => `Always at ${merchant}? 🛍️ Want to set a special budget for this spot?`
        ]
    },
    budget: {
        healthy: [
            (cat: string, _days: number, daily: number) => `Boleh tahan! 👍 To stay safe with ${cat}, spend less than RM${daily.toFixed(0)}/day. Can one lah.`,
            (cat: string, _days: number, daily: number) => `On track! ✅ Keep ${cat} spending below RM${daily.toFixed(0)}/day and you'll be fine. Rilek je.`
        ],
        warning: [
            (cat: string, _days: number, daily: number) => `Alamak! ⚠️ ${cat} funds low. Limit to RM${daily.toFixed(0)}/day baru survive till payday.`,
            (cat: string, _days: number, daily: number) => `Hati-hati sikit! 🚦 ${cat} almost empty. Try spending RM${daily.toFixed(0)}/day okay?`
        ]
    }
};

export function InsightsCard() {
    const { receipts, budget, streak } = useStore();
    const navigate = useNavigate();

    // Randomization Seed (persists for session to avoid flicker, or simple state)
    // Using state ensures it's set once per mount
    const [seed, setSeed] = useState<number>(0);

    useEffect(() => {
        setSeed(Math.random());
    }, []);

    const insights = useMemo(() => {
        const generatedInsights: InsightItem[] = [];
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = daysInMonth - currentDay;

        // Helper to pick random phrase
        const pick = (arr: any[]) => arr[Math.floor(seed * arr.length) % arr.length];

        // =================================================================
        // CARD 1: 'SIKIT LAGI' Logic (Achievement & Progress)
        // =================================================================
        const achievementProgress = calculateAchievements(receipts, streak, budget);
        const bestLocked = achievementProgress
            .filter(a => !a.isUnlocked)
            .sort((a, b) => b.progressPercent - a.progressPercent)[0];

        const recentlyUnlocked = achievementProgress
            .filter(a => a.isUnlocked)
            .sort((a, b) => b.progressPercent - a.progressPercent)[0]; // Just creating a stable sort

        if (bestLocked && bestLocked.progressPercent > 0) {
            const def = ACHIEVEMENTS.find(d => d.id === bestLocked.achievementId);
            if (def) {
                generatedInsights.push({
                    id: 'sikit-lagi-progress',
                    type: 'progress',
                    title: `Target: ${def.title}`,
                    message: pick(PHRASE_LIBRARY.achievement.progress)(def.title, bestLocked.progressPercent),
                    icon: <Medal size={18} className="text-amber-600" />,
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-100',
                    linkTo: '/achievements'
                });
            }
        } else if (recentlyUnlocked) {
            const def = ACHIEVEMENTS.find(d => d.id === recentlyUnlocked.achievementId);
            if (def) {
                generatedInsights.push({
                    id: 'sikit-lagi-unlocked',
                    type: 'progress',
                    title: 'New Badge!',
                    message: pick(PHRASE_LIBRARY.achievement.unlocked)(def.title),
                    icon: <Medal size={18} className="text-amber-600" />,
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-100',
                    linkTo: '/achievements'
                });
            }
        } else {
            // Fallback
            generatedInsights.push({
                id: 'sikit-lagi-fallback',
                type: 'progress',
                title: 'Jom Start!',
                message: '🏆 Upload resit pertama you untuk start collect badges!',
                icon: <Medal size={18} className="text-amber-600" />,
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-100',
                linkTo: '/achievements'
            });
        }

        // =================================================================
        // CARD 2: 'SYOKNYA' Logic (Habit Mirror)
        // =================================================================
        // Frequency check
        const merchantCounts: Record<string, number> = {};
        receipts.forEach(r => {
            merchantCounts[r.merchant] = (merchantCounts[r.merchant] || 0) + 1;
        });
        const frequentMerchant = Object.entries(merchantCounts).sort((a, b) => b[1] - a[1])[0];

        // Savings Check
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        const weekReceipts = receipts.filter(r => new Date(r.date) >= weekStart);
        const categorySpend: Record<string, number> = {};
        weekReceipts.forEach(r => {
            categorySpend[r.spendingCategory] = (categorySpend[r.spendingCategory] || 0) + r.amount;
        });
        const topCat = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];

        let habitCard: InsightItem | null = null;

        if (topCat) {
            const [catName, amount] = topCat;
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            const lastMonthTotal = receipts
                .filter(r => {
                    const d = new Date(r.date);
                    return d >= startOfLastMonth && d <= endOfLastMonth && r.spendingCategory === catName;
                })
                .reduce((sum, r) => sum + r.amount, 0);
            const lastMonthAvg = lastMonthTotal / 4;

            if (amount < lastMonthAvg && lastMonthAvg > 0) {
                const diff = lastMonthAvg - amount;
                habitCard = {
                    id: 'syoknya-save',
                    type: 'habit',
                    title: 'Syoknya!',
                    message: pick(PHRASE_LIBRARY.habit.positive)(catName, diff),
                    icon: <TrendingDown size={18} className="text-emerald-600" />,
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-100',
                    linkTo: '/analytics'
                };
            }
        }

        if (!habitCard && frequentMerchant && frequentMerchant[1] > 2) {
            // Frequency Fallback
            habitCard = {
                id: 'syoknya-freq',
                type: 'habit',
                title: 'Loyal Customer',
                message: pick(PHRASE_LIBRARY.habit.frequency)(frequentMerchant[0]),
                icon: <ShoppingBag size={18} className="text-emerald-600" />,
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-100',
                linkTo: '/analytics'
            };
        }

        if (habitCard) {
            generatedInsights.push(habitCard);
        } else {
            generatedInsights.push({
                id: 'syoknya-empty',
                type: 'habit',
                title: 'Spending Monitor',
                message: '📊 Snap resit makan-makan you. Nanti kita tengok habit spending macam mana.',
                icon: <PlusCircle size={18} className="text-emerald-600" />,
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-100',
                linkTo: '/add'
            });
        }

        // =================================================================
        // CARD 3: 'BOLEH TAHAN' Logic (Budget Guidance)
        // Logic: Days Remaining vs Budget for Active Category
        // =================================================================
        const activeCategory = budget.categories?.find(cat => {
            const spent = receipts
                .filter(r => r.spendingCategory === cat.name && new Date(r.date) >= startOfMonth)
                .reduce((sum, r) => sum + r.amount, 0);
            const remaining = cat.amount - spent;
            return remaining > 0; // Just find one that has money left
        }) || budget.categories?.[0];

        if (activeCategory) {
            const spent = receipts
                .filter(r => r.spendingCategory === activeCategory.name && new Date(r.date) >= startOfMonth)
                .reduce((sum, r) => sum + r.amount, 0);
            const remaining = Math.max(0, activeCategory.amount - spent);
            const safeDaily = remaining / (daysRemaining || 1);

            // Determine Health
            const isLow = remaining < (activeCategory.amount * 0.2); // Less than 20% left

            if (isLow) {
                generatedInsights.push({
                    id: 'boleh-tahan-warn',
                    type: 'runway',
                    title: 'Hati-Hati!',
                    message: pick(PHRASE_LIBRARY.budget.warning)(activeCategory.name, daysRemaining, safeDaily),
                    icon: <AlertCircle size={18} className="text-blue-600" />,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-100',
                    linkTo: '/analytics'
                });
            } else {
                generatedInsights.push({
                    id: 'boleh-tahan-ok',
                    type: 'runway',
                    title: 'Boleh Tahan!',
                    message: pick(PHRASE_LIBRARY.budget.healthy)(activeCategory.name, daysRemaining, safeDaily),
                    icon: <Target size={18} className="text-blue-600" />,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-100',
                    linkTo: '/analytics'
                });
            }
        } else {
            generatedInsights.push({
                id: 'boleh-tahan-fallback',
                type: 'runway',
                title: 'Set Budget',
                message: '🎯 Set budget dulu boss. Baru boleh kira runway sampai gaji.',
                icon: <Plane size={18} className="text-blue-600" />,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-100',
                linkTo: '/budget' // Changed to /budget
            });
        }

        return generatedInsights.slice(0, 3); // Compulsory 3

    }, [receipts, budget, streak, seed]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 px-1">Your Financial Co-Pilot</h2>

            <div className="space-y-2.5 pr-1">
                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        onClick={() => navigate(insight.linkTo)}
                        className={`rounded-2xl p-3 border ${insight.borderColor} ${insight.bgColor} shadow-sm backdrop-blur-sm relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:bg-opacity-80`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                                {insight.icon}
                            </div>
                            <div className="flex-1 min-w-0 py-0.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-800 text-sm tracking-tight">{insight.title}</h4>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                                    {insight.message}
                                </p>
                            </div>
                            <ChevronRight size={14} className="text-gray-400 flex-shrink-0 ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
