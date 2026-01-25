import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import type { LhdnTag } from '../types';
import { FileText, TrendingUp, AlertCircle, Users, ChevronLeft, ChevronRight, Shield, List, Sparkles } from 'lucide-react';
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
    const lifestyleExceeded = lifestyleTotal > lifestyleCap;

    // LHDN category limits (2026 assessment year)
    const categoryLimits: Record<LhdnTag, number | null> = {
        Medical: 10000,
        Lifestyle: 2500,
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

    // Predictive Tax Optimization Logic: Find top underutilized category
    const underutilized = allCategories
        .filter(cat => cat.limit !== null && cat.amount < cat.limit)
        .map(cat => ({
            ...cat,
            remaining: (cat.limit || 0) - cat.amount
        }))
        .sort((a, b) => b.remaining - a.remaining)[0];

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
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-blue-50 rounded-bl-[80px] -mr-4 -mt-4" />
                        <div className="relative z-10">
                            <SectionHeader
                                title="Total Tax-Claimable"
                                subtitle={`Year-to-Date ${selectedYear}`}
                                icon={<FileText />}
                                className="mb-4"
                            />
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalClaimable)}</p>
                        </div>
                    </div>

                    {/* Lifestyle Cap Alert */}
                    {lifestyleExceeded && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Annual Lifestyle Cap Exceeded</p>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    You've fully utilized your annual Lifestyle relief of {formatCurrency(lifestyleCap)}.
                                    Additional lifestyle expenses for this year won't provide further tax deduction.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Optimization Card: Dynamic Underutilized Insight */}
                    {underutilized && (
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                            <div className="relative bg-white rounded-2xl p-5 border border-purple-100 shadow-sm overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full -mr-16 -mt-16" />
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 shrink-0">
                                        <Sparkles size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">Tax Saving Opportunity</h3>
                                        <p className="text-sm text-gray-700 leading-relaxed italic font-medium">
                                            "Boss, you still have <span className="text-purple-600 font-bold">{formatCurrency(underutilized.remaining)}</span> left for <span className="text-blue-600 font-bold">{underutilized.tag}</span> relief. If you don't use it by 31 Dec, it's gone k?"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tax Category Breakdown */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <SectionHeader title="Tax Category Breakdown" icon={<List />} className="mb-6" />
                        <div className="space-y-6">
                            {categoryData.map(cat => {
                                const percent = cat.limit ? (cat.amount / cat.limit) * 100 : 0;
                                const isExceeded = cat.limit && cat.amount > cat.limit;

                                // Duitrack Blue-to-Purple brand gradient
                                let bgGradient = 'from-purple-600 to-blue-600';

                                if (isExceeded) bgGradient = 'from-red-600 to-orange-500';

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

                    {/* Tax Knowledge Center */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Shield size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Tax Relief Knowledge</h3>
                                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Education</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50">
                                <p className="text-xs font-bold text-gray-800 mb-1">What is the Lifestyle Cap?</p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    The "Lifestyle" relief is an annual tax deduction of up to **RM 2,500**.
                                    It covers your personal spending on reading materials, computers, smartphones,
                                    tablets, sports equipment, and gym memberships.
                                </p>
                            </div>

                            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50">
                                <p className="text-xs font-bold text-gray-800 mb-1">Pro Tip: Exceeded the Limit?</p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    If you've spent more than RM 2,500 on lifestyle items, consider asking your spouse
                                    to buy the next item under their name so they can claim it instead!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tax Filing Tips */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <SectionHeader
                            title="Tax Filing Tips"
                            icon={<TrendingUp />}
                            className="mb-3 text-blue-900"
                        />
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
                            <SectionHeader
                                title="Spouse Relief Sharing"
                                icon={<Users />}
                                className="mb-2 text-purple-900"
                            />
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
