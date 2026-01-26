
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { ArrowLeft, Download, Share2, X, Plus, Store, MapPin, Calendar, AlertTriangle, Check, Edit2, AlertCircle } from 'lucide-react';
import { isTypicallyIneligible } from '../lib/lhdn-logic';
import type { LhdnTag } from '../types';

const LHDN_CATEGORIES: LhdnTag[] = ['Medical', 'Lifestyle', 'Books', 'Sports', 'Education', 'Childcare'];

export function ReceiptDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getReceipt, updateLineItem } = useStore();

    const receipt = id ? getReceipt(id) : undefined;

    // Track which item has category selector open
    const [openCategorySelector, setOpenCategorySelector] = useState<string | null>(null);

    if (!receipt) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Receipt not found</p>
                    <button onClick={() => navigate('/')} className="text-blue-600 font-medium">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Format date with day of week
    const formatReceiptDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-MY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get all tags (LHDN + custom)
    const allTags = [
        ...receipt.tags.map(tag => ({ label: tag, type: 'lhdn' })),
        ...(receipt.customTags || []).map(tag => ({ label: tag, type: 'custom' }))
    ];

    // Handle toggling item claimable status
    const handleToggleClaimable = (itemId: string, currentClaimable: boolean) => {
        if (currentClaimable) {
            // Turning off claimable - also clear tag
            updateLineItem(receipt.id, itemId, { claimable: false, tag: undefined });
            setOpenCategorySelector(null);
        } else {
            // Turning on claimable - open category selector
            setOpenCategorySelector(itemId);
        }
    };

    // Handle selecting LHDN category
    const handleSelectCategory = (itemId: string, category: LhdnTag) => {
        updateLineItem(receipt.id, itemId, { claimable: true, tag: category });
        setOpenCategorySelector(null);
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Receipt Details</h1>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Download size={20} className="text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Share2 size={20} className="text-blue-600" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5 space-y-4">
                {/* Merchant Info Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Store size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">{receipt.merchant}</h2>
                            {receipt.location && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                    <MapPin size={12} />
                                    <span>{receipt.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {receipt.receiptNumber && (
                        <p className="text-right text-xs text-gray-400 mb-2 font-mono">{receipt.receiptNumber}</p>
                    )}

                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 py-3 border-t border-b border-gray-100 mb-5 bg-gray-50/50 rounded-lg mx-[-8px]">
                        <Calendar size={14} />
                        <span>{formatReceiptDate(receipt.date)}</span>
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(receipt.amount)}</p>
                    </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-900">Tags</h3>
                            <button className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <Plus size={14} />
                                Add Tag
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tag.type === 'lhdn' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                                        }`}
                                >
                                    {tag.label}
                                    <button className="hover:bg-black/5 rounded-full p-0.5 transition-colors">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Items List with LHDN Toggle */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">
                        Items ({receipt.items.length})
                    </h3>
                    <div className="space-y-4">
                        {receipt.items.map((item, idx) => {
                            const eligibilityCheck = isTypicallyIneligible(item.name, item.tag);
                            const showWarning = item.claimable && eligibilityCheck.ineligible;

                            return (
                                <div key={item.id} className={idx < receipt.items.length - 1 ? 'pb-4 border-b border-gray-100' : ''}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 pr-4">
                                            <p className="text-sm font-medium text-gray-900 leading-snug">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {item.category || receipt.spendingCategory}
                                                {item.productTags && item.productTags.length > 0 && (
                                                    <span className="ml-2 flex flex-wrap gap-1 inline-flex align-middle">
                                                        {item.productTags.map(tag => (
                                                            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-medium border border-blue-100">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-gray-400 mb-1">Qty: {item.qty}</p>
                                            <p className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(item.qty * item.unit)}</p>
                                        </div>
                                    </div>

                                    {/* LHDN Claimable Toggle */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => handleToggleClaimable(item.id, item.claimable)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${item.claimable
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {item.claimable ? (
                                                <>
                                                    <Check size={12} />
                                                    Claimable
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-3 h-3 rounded-sm border border-gray-300" />
                                                    LHDN
                                                </>
                                            )}
                                        </button>

                                        {/* Category Tag when claimable */}
                                        {item.claimable && item.tag && (
                                            <button
                                                onClick={() => setOpenCategorySelector(openCategorySelector === item.id ? null : item.id)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                            >
                                                {item.autoAssigned && (
                                                    <span className="text-purple-500" title="Auto-assigned by AI">✨</span>
                                                )}
                                                {item.tag}
                                            </button>
                                        )}

                                        {/* Warning for ineligible items */}
                                        {showWarning && (
                                            <div className="relative group">
                                                <AlertTriangle size={16} className="text-amber-500" />
                                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-[200px] shadow-lg">
                                                        {eligibilityCheck.reason}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category Selector Dropdown */}
                                    {openCategorySelector === item.id && (
                                        <div className="flex flex-wrap gap-1.5 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                            {LHDN_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleSelectCategory(item.id, cat)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${item.tag === cat
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Summary - Unified Schema */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Payment Summary</h3>
                        <button
                            onClick={() => navigate(`/add?edit=${receipt.id}`)}
                            className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                        >
                            <Edit2 size={12} />
                            Edit
                        </button>
                    </div>

                    {/* Data Integrity Warning */}
                    {(() => {
                        const itemsTotal = receipt.items.reduce((sum, i) => sum + i.qty * i.unit, 0);
                        const taxAmount = receipt.tax ?? (itemsTotal * (receipt.taxRate || 0) / 100);
                        const serviceAmount = receipt.serviceChargeAmount ?? (itemsTotal * (receipt.serviceChargeRate || 0) / 100);
                        const roundingAmount = receipt.rounding ?? 0;
                        const calculatedTotal = itemsTotal + taxAmount + serviceAmount + roundingAmount;
                        const hasMismatch = Math.abs(receipt.amount - calculatedTotal) > 0.05;

                        return hasMismatch ? (
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-xs font-semibold text-amber-800">Total Mismatch Detected</p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        Calculated: {formatCurrency(calculatedTotal)} vs Stored: {formatCurrency(receipt.amount)}. Please verify line items.
                                    </p>
                                </div>
                            </div>
                        ) : null;
                    })()}

                    <div className="space-y-2">
                        {/* Row 1: Total Price (Items Sum) */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Total Price</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(receipt.items.reduce((sum, i) => sum + i.qty * i.unit, 0))}
                            </span>
                        </div>

                        {/* Row 2: Tax Amount */}
                        {(receipt.tax !== undefined || receipt.taxRate !== undefined) && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                    Tax Amount ({receipt.taxRate ? `${(receipt.taxRate * 100).toFixed(0)}%` : '0%'} SST)
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(receipt.tax ?? (receipt.items.reduce((sum, i) => sum + i.qty * i.unit, 0) * (receipt.taxRate || 0) / 100))}
                                </span>
                            </div>
                        )}

                        {/* Row 3: Service Charge (if applicable) */}
                        {(receipt.serviceChargeRate !== undefined && receipt.serviceChargeRate > 0) && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                    Service Charge ({receipt.serviceChargeRate}%)
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(receipt.serviceChargeAmount ?? (receipt.items.reduce((sum, i) => sum + i.qty * i.unit, 0) * receipt.serviceChargeRate / 100))}
                                </span>
                            </div>
                        )}

                        {/* Row 4: Rounding */}
                        {receipt.rounding !== undefined && receipt.rounding !== 0 && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Rounding</span>
                                <span className={`font-medium ${receipt.rounding < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                    {formatCurrency(receipt.rounding)}
                                </span>
                            </div>
                        )}

                        {/* Row 5: Total Price After Tax */}
                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-dashed border-gray-200">
                            <span className="text-sm font-bold text-gray-900">Total Price After Tax</span>
                            <span className="text-lg font-bold text-blue-600">{formatCurrency(receipt.amount)}</span>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-center justify-between text-xs pt-2">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-medium text-gray-900">{receipt.payment}</span>
                        </div>

                        {/* Claimable Summary */}
                        {receipt.items.some(i => i.claimable) && (
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 mt-2">
                                <span className="text-green-600 font-medium">Tax Claimable</span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(receipt.items.filter(i => i.claimable).reduce((sum, i) => sum + i.qty * i.unit, 0))}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <button className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                        <Download size={20} />
                        Download PDF
                    </button>
                    <button className="w-full bg-white text-blue-600 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                        <Share2 size={20} />
                        Share Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}

