import { useState } from 'react';
import type { ReactNode } from 'react';
import { useStore } from '../lib/store';
import { ACHIEVEMENTS, calculateAchievements } from '../lib/achievements';
import type { AchievementTier } from '../lib/achievements';
import { Search, Bell, Trophy, Target, Lock, Flame } from 'lucide-react';

export function AchievementsPage() {
    const { points, streak, receipts, budget, user } = useStore();
    const [activeTab, setActiveTab] = useState<'achievements' | 'challenges'>('achievements');

    // Calculate progress for all achievements
    const progressData = calculateAchievements(receipts, streak, budget, user.referralsCount || 0);

    // Calculate stats
    const totalAchievements = ACHIEVEMENTS.length;
    const unlockedCount = progressData.filter(p => p.isUnlocked).length;

    // Group by tier
    const achievementsByTier = (tier: AchievementTier) => {
        return ACHIEVEMENTS.filter(a => a.tier === tier).map(achievement => {
            const progress = progressData.find(p => p.achievementId === achievement.id)!;
            return {
                ...achievement,
                progress
            };
        });
    };

    const tiers: AchievementTier[] = ['Legendary', 'Epic', 'Rare', 'Common'];
    const tierIcons: Record<AchievementTier, ReactNode> = {
        'Legendary': <span className="text-yellow-500">👑</span>,
        'Epic': <span className="text-purple-500">⭐</span>,
        'Rare': <span className="text-blue-500">⚡</span>,
        'Common': <span className="text-gray-500">🎁</span>,
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900">Achievements</h1>
                <div className="flex items-center gap-3">
                    <button className="text-gray-600"><Search size={24} /></button>
                    <button className="text-gray-600 relative">
                        <Bell size={24} />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Hero Card */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm -mt-1">
                                <Trophy size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold leading-tight">Your Progress</h2>
                                <p className="text-white/80 text-xs">Keep earning achievements!</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{points}</div>
                            <div className="text-xs uppercase tracking-wider text-white/80">Total Points</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                            <div className="text-lg font-bold">{unlockedCount}/{totalAchievements}</div>
                            <div className="text-xs text-white/80">Achievements</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                            <div className="text-lg font-bold flex items-center justify-center gap-1">
                                <Flame size={14} className="text-orange-400" fill="currentColor" />
                                {streak.currentStreak}
                            </div>
                            <div className="text-xs text-white/80">Day Streak</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                            <div className="text-lg font-bold">0</div>
                            <div className="text-xs text-white/80">Challenges</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white p-1 rounded-xl flex shadow-sm">
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'achievements'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Trophy size={16} />
                        Achievements
                    </button>
                    <button
                        onClick={() => setActiveTab('challenges')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'challenges'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Target size={16} />
                        Challenges
                    </button>
                </div>

                {/* Achievements List */}
                {activeTab === 'achievements' ? (
                    <div className="space-y-6">
                        {tiers.map(tier => {
                            const items = achievementsByTier(tier);
                            if (items.length === 0) return null;
                            const tierUnlocked = items.filter(i => i.progress.isUnlocked).length;

                            return (
                                <div key={tier}>
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 px-1">
                                        {tierIcons[tier]}
                                        {tier}
                                        <span className="text-gray-400 font-normal ml-1">
                                            ({tierUnlocked}/{items.length})
                                        </span>
                                    </h3>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {items.map(item => (
                                            <div
                                                key={item.id}
                                                className={`bg-white rounded-xl p-3 border shadow-sm relative overflow-hidden flex flex-col items-center text-center h-full transition-all ${item.progress.isUnlocked
                                                    ? 'border-gray-100'
                                                    : 'border-gray-100 bg-gray-50/50'
                                                    }`}
                                            >
                                                {/* Lock Icon */}
                                                {!item.progress.isUnlocked && (
                                                    <div className="absolute top-2 right-2 text-gray-300">
                                                        <Lock size={12} />
                                                    </div>
                                                )}

                                                {/* Icon */}
                                                <div className={`text-3xl mb-2 ${!item.progress.isUnlocked && 'opacity-50 grayscale'}`}>
                                                    {item.icon}
                                                </div>

                                                {/* Title */}
                                                <h4 className={`text-xs font-semibold mb-2 leading-tight ${item.progress.isUnlocked ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                    {item.title}
                                                </h4>

                                                {/* Progress Bar */}
                                                <div className="w-full mt-auto pt-2">
                                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-2">
                                                        <div
                                                            className={`h-full rounded-full ${item.progress.isUnlocked ? 'bg-blue-500' : 'bg-gray-300'
                                                                }`}
                                                            style={{ width: `${item.progress.progressPercent}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-gray-400 text-center">
                                                        {Math.round(item.progress.progressPercent)}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Challenges Placeholder */
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-2">No Active Challenges</h3>
                        <p className="text-sm text-gray-500">Check back later for new challenges!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
