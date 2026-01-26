import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { ArrowLeft, Search, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import { getExclusionReason, LHDN_ELIGIBLE_ITEMS } from '../lib/lhdn-logic';
import type { LhdnTag, Receipt, LineItem } from '../types';

export function DetailedExpensesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const receipts = useStore(state => state.receipts);
    const updateLineItem = useStore(state => state.updateLineItem);

    // Audit View state
    const [isAuditMode, setIsAuditMode] = useState(false);
    const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(new Set());

    // Override confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        receiptId: string;
        itemId: string;
        itemName: string;
    } | null>(null);

    // Parse query parameters
    const source = searchParams.get('source') as 'analytics' | 'tax' | null;
    const period = searchParams.get('period');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const category = searchParams.get('category') as LhdnTag | null;
    const year = searchParams.get('year');

    // Compute title and subtitle
    const { title, subtitle } = useMemo(() => {
        if (source === 'tax' && category) {
            return {
                title: `${category} Expenses`,
                subtitle: `Tax Year ${year || new Date().getFullYear()}`
            };
        }

        // Analytics source
        let periodLabel = '';
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (period === 'week') {
                periodLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            } else if (period === 'month') {
                periodLabel = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            } else if (period === 'year') {
                periodLabel = start.getFullYear().toString();
            } else if (period === 'custom') {
                periodLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }
        }

        return {
            title: 'Detailed Expenses',
            subtitle: periodLabel || 'All Transactions'
        };
    }, [source, category, year, startDate, endDate, period]);

    // Filter receipts based on source and params
    const filteredReceipts = useMemo(() => {
        let filtered: Receipt[] = [...receipts];

        if (source === 'tax' && category && year) {
            // Tax source: filter by year and LHDN category
            const targetYear = parseInt(year);
            filtered = receipts.filter(r => {
                const receiptDate = new Date(r.date);
                return receiptDate.getFullYear() === targetYear &&
                    r.claimable &&
                    r.tags.includes(category);
            });
        } else if (source === 'analytics' && startDate && endDate) {
            // Analytics source: filter by date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            filtered = receipts.filter(r => {
                const receiptDate = new Date(r.date);
                return receiptDate >= start && receiptDate <= end;
            });
        }

        // Sort by date descending
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [receipts, source, category, year, startDate, endDate]);

    // Calculate audit totals
    const auditTotals = useMemo(() => {
        let receiptTotal = 0;
        let claimableTotal = 0;
        let ineligibleTotal = 0;

        filteredReceipts.forEach(receipt => {
            receipt.items.forEach(item => {
                const itemTotal = item.qty * item.unit;
                receiptTotal += itemTotal;
                if (item.claimable) {
                    claimableTotal += itemTotal;
                } else {
                    ineligibleTotal += itemTotal;
                }
            });
        });

        return { receiptTotal, claimableTotal, ineligibleTotal };
    }, [filteredReceipts]);

    // Group receipts by date
    const groupedReceipts = useMemo(() => {
        return filteredReceipts.reduce((groups, receipt) => {
            const date = new Date(receipt.date).toLocaleDateString('en-MY', {
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(receipt);
            return groups;
        }, {} as Record<string, Receipt[]>);
    }, [filteredReceipts]);

    // Handle transaction click with haptic feedback
    const handleTransactionClick = (receiptId: string) => {
        if (isAuditMode) {
            // In audit mode, expand/collapse the receipt
            setExpandedReceipts(prev => {
                const next = new Set(prev);
                if (next.has(receiptId)) {
                    next.delete(receiptId);
                } else {
                    next.add(receiptId);
                }
                return next;
            });
            if ('vibrate' in navigator) navigator.vibrate(10);
        } else {
            // Normal mode: navigate to receipt detail
            if ('vibrate' in navigator) navigator.vibrate(10);
            navigate(`/receipt/${receiptId}`);
        }
    };

    // Handle toggling audit mode
    const handleToggleAuditMode = () => {
        setIsAuditMode(!isAuditMode);
        if (!isAuditMode) {
            // When entering audit mode, expand all receipts
            setExpandedReceipts(new Set(filteredReceipts.map(r => r.id)));
        } else {
            // When exiting, collapse all
            setExpandedReceipts(new Set());
        }
        if ('vibrate' in navigator) navigator.vibrate(10);
    };

    // Handle attempting to override an excluded item
    const handleAttemptOverride = (receipt: Receipt, item: LineItem) => {
        if (item.claimable) {
            // Already claimable - just toggle off
            updateLineItem(receipt.id, item.id, { claimable: false, tag: undefined });
            if ('vibrate' in navigator) navigator.vibrate(10);
        } else {
            // Not claimable - show confirmation dialog
            setConfirmDialog({
                isOpen: true,
                receiptId: receipt.id,
                itemId: item.id,
                itemName: item.name
            });
        }
    };

    // Confirm override
    const handleConfirmOverride = () => {
        if (confirmDialog) {
            updateLineItem(confirmDialog.receiptId, confirmDialog.itemId, {
                claimable: true,
                tag: category || 'Others'
            });
            setConfirmDialog(null);
            if ('vibrate' in navigator) navigator.vibrate(10);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Get category limit for display
    const categoryLimit = category && category in LHDN_ELIGIBLE_ITEMS
        ? LHDN_ELIGIBLE_ITEMS[category as keyof typeof LHDN_ELIGIBLE_ITEMS]?.limit
        : null;

    return (
        <div className="min-h-screen bg-gray-50 animate-slide-in-right">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center justify-between px-4 py-3 pt-[calc(1rem+env(safe-area-inset-top))]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                            <p className="text-xs text-gray-500">{subtitle}</p>
                        </div>
                    </div>

                    {/* Audit View Toggle - Only show for tax source */}
                    {source === 'tax' && (
                        <button
                            onClick={handleToggleAuditMode}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isAuditMode
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {isAuditMode ? <Eye size={14} /> : <EyeOff size={14} />}
                            Audit View
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={`p-4 ${isAuditMode ? 'pb-44' : ''}`}>
                {filteredReceipts.length > 0 ? (
                    <div className="space-y-4">
                        {/* Transaction count with category limit */}
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-gray-500">
                                {filteredReceipts.length} transaction{filteredReceipts.length !== 1 ? 's' : ''}
                            </p>
                            {categoryLimit && (
                                <p className="text-xs text-gray-500">
                                    Limit: {formatCurrency(categoryLimit)}
                                </p>
                            )}
                        </div>

                        {/* Grouped transactions */}
                        {Object.entries(groupedReceipts).map(([date, dayReceipts]) => (
                            <div key={date}>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                                    {date}
                                </h3>
                                <div className="space-y-2">
                                    {dayReceipts.map(receipt => (
                                        <div key={receipt.id}>
                                            {/* Receipt Card */}
                                            <div
                                                onClick={() => handleTransactionClick(receipt.id)}
                                                className={`flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer transition-colors ${isAuditMode && expandedReceipts.has(receipt.id)
                                                    ? 'rounded-b-none border-b-0'
                                                    : 'active:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg">
                                                        {receipt.merchantCategory === 'Restaurant' ? '🍔' :
                                                            receipt.merchantCategory === 'Grocery Store' ? '🛒' :
                                                                receipt.merchantCategory === 'Coffee Shop' ? '☕' :
                                                                    receipt.merchantCategory === 'Electronics' ? '💻' :
                                                                        receipt.merchantCategory === 'Pharmacy & Health' ? '💊' :
                                                                            receipt.spendingCategory === 'Transportation' ? '🚕' : '🛍️'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{receipt.merchant}</p>
                                                        <p className="text-xs text-gray-500">{receipt.merchantCategory}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 tabular-nums">{formatCurrency(receipt.amount)}</p>
                                                    {source === 'tax' && receipt.claimable && !isAuditMode && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                                                            Claimable
                                                        </span>
                                                    )}
                                                    {isAuditMode && (
                                                        <span className="text-xs text-gray-400">
                                                            {receipt.items.length} items
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded Audit View - Line Items */}
                                            {isAuditMode && expandedReceipts.has(receipt.id) && (
                                                <div className="bg-gray-50 border border-t-0 border-gray-100 rounded-b-2xl overflow-hidden">
                                                    {receipt.items.map((item, idx) => {
                                                        const exclusionReason = getExclusionReason(item.name, item.tag, item.claimable);
                                                        const isClaimable = item.claimable;

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`p-3 flex items-center justify-between ${idx < receipt.items.length - 1 ? 'border-b border-gray-100' : ''
                                                                    } ${isClaimable ? 'bg-emerald-50/50' : 'bg-gray-50'}`}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {item.name}
                                                                        </p>
                                                                        {item.autoAssigned && (
                                                                            <span className="text-purple-500 text-xs" title="Auto-assigned by AI">✨</span>
                                                                        )}
                                                                    </div>

                                                                    {/* Status Badge */}
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAttemptOverride(receipt, item);
                                                                            }}
                                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${isClaimable
                                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                                                }`}
                                                                        >
                                                                            {isClaimable ? (
                                                                                <>
                                                                                    <Check size={10} />
                                                                                    Claimable
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <X size={10} />
                                                                                    Excluded
                                                                                </>
                                                                            )}
                                                                        </button>

                                                                        {/* Category or Reason */}
                                                                        {isClaimable && item.tag ? (
                                                                            <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                                                                                {item.tag}
                                                                            </span>
                                                                        ) : exclusionReason && (
                                                                            <span className="text-xs text-gray-500 italic">
                                                                                {exclusionReason}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <p className={`text-sm font-bold flex-shrink-0 ml-3 ${isClaimable ? 'text-emerald-700' : 'text-gray-400'
                                                                    }`}>
                                                                    {formatCurrency(item.qty * item.unit)}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="h-px bg-gray-100 my-4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No transactions found</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {source === 'tax'
                                ? `No claimable ${category} expenses for Tax Year ${year}`
                                : 'No transactions match your selected filters'}
                        </p>
                        <button
                            onClick={handleBack}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>

            {/* Audit Reconciliation Summary Box */}
            {isAuditMode && filteredReceipts.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Audit Reconciliation
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Receipt Total</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(auditTotals.receiptTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Ineligible Amount</span>
                            <span className="font-semibold text-red-500">({formatCurrency(auditTotals.ineligibleTotal)})</span>
                        </div>
                        <div className="h-px bg-gray-200 my-1" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">Final Tax-Claimable</span>
                            <span className="text-lg font-bold text-emerald-600">{formatCurrency(auditTotals.claimableTotal)}</span>
                        </div>
                        {categoryLimit && auditTotals.claimableTotal > categoryLimit && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                                <span className="text-xs text-amber-700">
                                    Exceeds {category} limit of {formatCurrency(categoryLimit)}. Only {formatCurrency(categoryLimit)} claimable.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Override Confirmation Dialog */}
            {confirmDialog?.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-5">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 mx-auto">
                                <AlertTriangle size={24} className="text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                                Override Exclusion?
                            </h3>
                            <p className="text-sm text-gray-600 text-center mb-2">
                                <strong>"{confirmDialog.itemName}"</strong>
                            </p>
                            <p className="text-sm text-gray-500 text-center">
                                LHDN guidelines suggest this item is typically non-claimable. Claiming ineligible items may lead to penalties during audits.
                            </p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <div className="w-px bg-gray-100" />
                            <button
                                onClick={handleConfirmOverride}
                                className="flex-1 py-3.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                Override
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
