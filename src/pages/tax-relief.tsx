import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import type { LhdnTag } from '../types';
import { FileText, TrendingUp, AlertCircle, Users, ChevronLeft, ChevronRight, Shield, Tag } from 'lucide-react';
import { ProLockOverlay } from '../components/pro-lock-overlay';
import { SectionHeader } from '../components/ui/section-header';

export function TaxReliefPage() {
    const navigate = useNavigate();
    const receipts = useStore(state => state.receipts);
    const user = useStore(state => state.user);
    const [yearOffset, setYearOffset] = useState(0);

    // Calculate selected year
    const currentYear = new Date().getFullYear();
    const selectedYear = currentYear + yearOffset;

    // Filter receipts by year
    const filteredReceipts = receipts.filter(receipt => {
        const receiptYear = new Date(receipt.date).getFullYear();
        return receiptYear === selectedYear;
    });

    // Calculate LHDN category totals based on filtered receipts
    const lhdnBreakdown: Record<LhdnTag, number> = {
        Medical: 0,
        Lifestyle: 0,
        Education: 0,
        Books: 0,
        Sports: 0,
        Childcare: 0,
        Others: 0,
    };

    filteredReceipts.forEach(receipt => {
        if (receipt.claimable) {
            receipt.items.forEach(item => {
                if (item.tag && item.claimable) {
                    lhdnBreakdown[item.tag] = (lhdnBreakdown[item.tag] || 0) + (item.qty * item.unit);
                }
            });
        }
    });

    // Calculate totals
    const totalClaimable = Object.values(lhdnBreakdown).reduce((sum, val) => sum + val, 0);
    const lifestyleTotal = lhdnBreakdown.Lifestyle;
    const lifestyleCap = user.lifestyleCap;
    const lifestyleRemaining = Math.max(0, lifestyleCap - lifestyleTotal);
    const lifestyleExceeded = lifestyleTotal > lifestyleCap;
    const lifestylePercent = (lifestyleTotal / lifestyleCap) * 100;

    // LHDN category limits (2024 reference)
    const categoryLimits: Record<LhdnTag, number | null> = {
        Medical: 10000,
        Lifestyle: lifestyleCap,
        Education: null, // No limit
        Books: 2500,
        Sports: 1000,
        Childcare: 3000,
        Others: null,
    };

    const allCategories: { tag: LhdnTag; amount: number; limit: number | null; color: string }[] = [
        { tag: 'Medical', amount: lhdnBreakdown.Medical, limit: categoryLimits.Medical, color: 'bg-green-500' },
        { tag: 'Lifestyle', amount: lhdnBreakdown.Lifestyle, limit: categoryLimits.Lifestyle, color: 'bg-blue-500' },
        { tag: 'Education', amount: lhdnBreakdown.Education, limit: categoryLimits.Education, color: 'bg-purple-500' },
        { tag: 'Books', amount: lhdnBreakdown.Books, limit: categoryLimits.Books, color: 'bg-orange-500' },
        { tag: 'Sports', amount: lhdnBreakdown.Sports, limit: categoryLimits.Sports, color: 'bg-teal-500' },
        { tag: 'Childcare', amount: lhdnBreakdown.Childcare, limit: categoryLimits.Childcare, color: 'bg-pink-500' },
    ];
    const categoryData = allCategories.filter(cat => cat.amount > 0 || cat.limit !== null);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-[15px] px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shadow-md border-b border-white/10">
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h1 className="text-lg font-bold text-white">Tax Relief</h1>
                        <p className="text-xs text-white/80">LHDN tax-claimable expenses</p>
                    </div>
                    <button
                        onClick={() => navigate('/tax-vault')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
                    >
                        <Shield size={14} className="text-white" />
                        <span className="text-xs font-medium text-white">Tax Vault</span>
                    </button>
                </div>

                {/* Filter Controls - Matching Analytics Style */}
                <div className="flex gap-2 mt-2">
                    <div className="bg-white rounded-full px-3 py-1.5 text-xs font-medium text-blue-600 shadow-md">
                        Year
                    </div>
                </div>

                {/* Date Navigator */}
                <div className="flex items-center justify-between mt-2 bg-white/10 rounded-xl p-1.5">
                    <button
                        onClick={() => setYearOffset(yearOffset - 1)}
                        className="p-1.5 active:bg-white/20 rounded-full transition-colors"
                    >
                        <ChevronLeft size={18} className="text-white" />
                    </button>
                    <div className="text-center">
                        <p className="text-xs font-semibold text-white">Tax Year {selectedYear}</p>
                        <p className="text-[10px] text-white/70">
                            Assessment Year {selectedYear}
                        </p>
                    </div>
                    <button
                        onClick={() => setYearOffset(yearOffset + 1)}
                        disabled={yearOffset >= 0}
                        className={`p-2 rounded-full transition-colors ${yearOffset >= 0
                            ? 'text-white/30 cursor-not-allowed'
                            : 'hover:bg-white/20 text-white'
                            }`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>



            <div className="px-5 py-5 space-y-5">
                <ProLockOverlay title="Unlock Tax Relief Tracker" description="Track your LHDN tax reliefs, monitor limits, and optimize your filing with Pro.">
                    {/* Total Claimable Card */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                        <SectionHeader
                            title="Total Tax-Claimable"
                            subtitle={`YEAR-TO-DATE ${selectedYear}`}
                            icon={<FileText size={20} />}
                            className="relative z-10 mb-2"
                        />
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-blue-50 rounded-bl-[80px] -mr-4 -mt-4" />
                        <div className="relative z-10 mt-2">
                            <p className="text-3xl font-bold text-gray-900 ml-[52px]">{formatCurrency(totalClaimable)}</p>
                        </div>
                    </div>

                    {/* Lifestyle Cap Alert */}
                    {lifestyleExceeded && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Lifestyle Cap Exceeded</p>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    You've exceeded your annual Lifestyle relief cap of {formatCurrency(lifestyleCap)}.
                                    Consider routing future lifestyle expenses to your spouse.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Lifestyle Cap Progress */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-gray-900">Lifestyle Cap</h2>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${lifestyleExceeded ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {lifestylePercent.toFixed(0)}%
                            </div>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${lifestyleExceeded ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}
                                style={{ width: `${Math.min(lifestylePercent, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                                <strong className="text-gray-900">{formatCurrency(lifestyleTotal)}</strong> of {formatCurrency(lifestyleCap)}
                            </span>
                            <span className={`font-medium ${lifestyleExceeded ? 'text-red-500' : 'text-green-600'}`}>
                                {lifestyleExceeded ? 'Cap exceeded' : `${formatCurrency(lifestyleRemaining)} remaining`}
                            </span>
                        </div>
                    </div>

                    {/* LHDN Categories Breakdown */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <SectionHeader
                            title="Category Breakdown"
                            subtitle="LHDN LIMITS"
                            icon={<Tag size={20} />}
                            className="mb-5"
                        />
                        <div className="space-y-5">
                            {categoryData.map(cat => {
                                const percent = cat.limit ? (cat.amount / cat.limit) * 100 : 0;
                                const isExceeded = cat.limit && cat.amount > cat.limit;

                                // Simplistic gradient mapping fallback if replacement fails, or just manual override
                                let bgGradient = 'from-blue-500 to-blue-400';
                                if (cat.tag === 'Medical') bgGradient = 'from-green-500 to-emerald-400';
                                else if (cat.tag === 'Lifestyle') bgGradient = 'from-blue-500 to-indigo-400';
                                else if (cat.tag === 'Education') bgGradient = 'from-purple-500 to-fuchsia-400';
                                else if (cat.tag === 'Books') bgGradient = 'from-orange-500 to-amber-400';
                                else if (cat.tag === 'Sports') bgGradient = 'from-teal-500 to-cyan-400';
                                else if (cat.tag === 'Childcare') bgGradient = 'from-pink-500 to-rose-400';

                                if (isExceeded) bgGradient = 'from-red-500 to-orange-500';

                                return (
                                    <div
                                        key={cat.tag}
                                        onClick={() => {
                                            // Trigger haptic feedback
                                            if ('vibrate' in navigator) {
                                                navigator.vibrate(10);
                                            }
                                            // Navigate to full-screen detailed expenses page
                                            navigate(`/detailed-expenses?source=tax&category=${cat.tag}&year=${selectedYear}`);
                                        }}
                                        className="cursor-pointer active:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                                                <span className="text-sm font-medium text-gray-700">{cat.tag}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900">{formatCurrency(cat.amount)}</p>
                                                <ChevronRight size={14} className="text-gray-400" />
                                            </div>
                                        </div>
                                        {cat.limit && (
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${bgGradient}`}
                                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                        {cat.limit && (
                                            <div className="flex justify-end mt-1">
                                                <p className="text-[10px] text-gray-400">
                                                    Limit: {formatCurrency(cat.limit)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tax Filing Tips */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <h2 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-600" />
                            Tax Filing Tips
                        </h2>
                        <ul className="space-y-2.5">
                            <li className="flex items-start gap-2.5 text-xs text-blue-800 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                <span>Keep all receipts until your tax assessment is completed (typically 6 years)</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-xs text-blue-800 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                <span>Medical relief includes traditional treatments and vaccinations for yourself, spouse, and children</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-xs text-blue-800 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                <span>Lifestyle relief covers smartphones, computers, gym memberships, and internet subscriptions</span>
                            </li>
                        </ul>
                    </div>

                    {/* Spouse Overflow Info */}
                    {user.spouse && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-5 border border-purple-100">
                            <h2 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                                <Users size={16} className="text-purple-600" />
                                Spouse Relief Sharing
                            </h2>
                            <p className="text-xs text-purple-800 mb-3">
                                Linked to: <span className="font-bold">{user.spouse.name}</span>
                            </p>
                            <p className="text-xs text-purple-700 leading-relaxed">
                                When your Lifestyle relief cap is exceeded, you can route additional expenses to your spouse's account
                                to maximize your combined tax relief.
                            </p>
                        </div>
                    )}
                </ProLockOverlay>
            </div>
        </div >
    );
}
