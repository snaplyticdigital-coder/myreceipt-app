import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { generateTaxReliefPDF, hasYearData, getYearSummary } from '../lib/pdf-generator';
import { ChevronLeft, Lock, Download, FileText, Shield, Calendar } from 'lucide-react';

export function TaxVaultPage() {
    const navigate = useNavigate();
    const receipts = useStore(state => state.receipts);
    const user = useStore(state => state.user);

    const currentYear = new Date().getFullYear();

    // Generate list of 6 years (current + 5 prior)
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const handleDownloadPDF = (year: number) => {
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(15);
        }

        generateTaxReliefPDF(year, receipts, user.name);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-[15px] px-5 pb-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] shadow-lg border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ChevronLeft size={22} className="text-white" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <Shield size={20} />
                            Tax Vault
                        </h1>
                        <p className="text-xs text-white/80">6-Year Audit Archive</p>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5 space-y-5">
                {/* Info Banner */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Lock size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-purple-900 mb-1">
                                LHDN 7-Year Rule
                            </h2>
                            <p className="text-xs text-purple-700 leading-relaxed">
                                Under Malaysian tax law, you must retain records for 7 years.
                                Duitrack securely stores your past 6 years of tax-claimable receipts
                                for instant audit readiness.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Year Archive List */}
                <div className="space-y-3">
                    {years.map((year) => {
                        const hasData = hasYearData(year, receipts);
                        const summary = getYearSummary(year, receipts);
                        const isCurrentYear = year === currentYear;

                        return (
                            <div
                                key={year}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between">
                                    {/* Year Info */}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${hasData
                                            ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                                            : 'bg-gray-100'
                                            }`}>
                                            {hasData ? (
                                                <FileText size={18} className="text-white" />
                                            ) : (
                                                <Calendar size={18} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-gray-900">
                                                    {year}
                                                </h3>
                                                {isCurrentYear && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                                                        CURRENT
                                                    </span>
                                                )}
                                                <Lock size={12} className="text-gray-300" />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Assessment Year {year}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        {hasData ? (
                                            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs font-medium rounded-full border border-gray-100">
                                                No Data
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Summary Stats (if data exists) */}
                                {hasData && (
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <div className="text-xs text-gray-500">
                                            <span className="font-semibold text-gray-700">{summary.receiptCount}</span> receipts
                                            <span className="mx-2">•</span>
                                            <span className="font-semibold text-purple-600">{formatCurrency(summary.totalClaimable)}</span> claimable
                                        </div>
                                        <button
                                            onClick={() => handleDownloadPDF(year)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all"
                                        >
                                            <Download size={14} />
                                            Download PDF
                                        </button>
                                    </div>
                                )}

                                {/* Empty State Action */}
                                {!hasData && (
                                    <div className="mt-3 pt-3 border-t border-gray-50">
                                        <p className="text-xs text-gray-400 text-center">
                                            No tax-claimable receipts for this year
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pro Tip */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        💡 Pro Tip
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Download your PDF report before tax filing season. The document includes
                        all categorized expenses with merchant details, dates, and amounts —
                        ready to present if LHDN requests documentation.
                    </p>
                </div>
            </div>
        </div>
    );
}
