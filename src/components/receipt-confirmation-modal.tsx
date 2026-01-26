import { useState, useEffect } from 'react';
import { X, Check, FileText, Calendar, Banknote, Tag, Save, CreditCard, Plus, Trash2 } from 'lucide-react';
import type { SpendingCategory, PaymentMethod, LhdnTag, LineItem } from '../types';
import { generateId } from '../lib/format';
import { SORTED_SPENDING_CATEGORIES } from '../lib/constants';

const LHDN_TAGS: LhdnTag[] = ['Lifestyle', 'Education', 'Medical', 'Childcare', 'Books', 'Sports', 'Others'];

interface ParsedData {
    supplier_name?: string;
    total_amount?: number;
    receipt_date?: string;
    currency?: string;
    line_items?: any[];
    payment_method?: string; // Optional AI extraction for future
}

interface ReceiptConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (receiptData: any) => void;
    parsedData: ParsedData;
    imagePreview: string | null;
}

export function ReceiptConfirmationModal({ isOpen, onClose, onSave, parsedData, imagePreview }: ReceiptConfirmationModalProps) {
    const [merchant, setMerchant] = useState(parsedData.supplier_name || '');
    const [date, setDate] = useState(parsedData.receipt_date || new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(parsedData.total_amount?.toString() || '');
    const [category, setCategory] = useState<SpendingCategory>('Others');
    const [payment, setPayment] = useState<PaymentMethod>('Card');
    const [notes, setNotes] = useState('');
    const [selectedTags, setSelectedTags] = useState<LhdnTag[]>([]);
    const [claimable, setClaimable] = useState(false);

    // Initialize line items from parsed data or default
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: generateId(), name: 'Item 1', qty: 1, unit: 0, claimable: false }
    ]);

    useEffect(() => {
        if (isOpen) {
            setMerchant(parsedData.supplier_name || '');
            setDate(parsedData.receipt_date || new Date().toISOString().split('T')[0]);
            setAmount(parsedData.total_amount?.toString() || '');

            // Map parsed line items if available
            if (parsedData.line_items && parsedData.line_items.length > 0) {
                const total = parsedData.total_amount || 0;
                setLineItems(parsedData.line_items.map((item: any) => ({
                    id: generateId(),
                    name: item.description || 'Item',
                    qty: item.quantity || 1,
                    unit: item.unit_price || (item.amount || (total / (parsedData.line_items?.length || 1))), // Fallback estimate
                    claimable: false
                })));
            } else {
                setLineItems([{ id: generateId(), name: 'Item 1', qty: 1, unit: parsedData.total_amount || 0, claimable: false }]);
            }
        }
    }, [isOpen, parsedData]);

    const toggleTag = (tag: LhdnTag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { id: generateId(), name: '', qty: 1, unit: 0, claimable: false }]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id));
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(lineItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    if (!isOpen) return null;

    const handleSave = () => {
        const finalAmount = parseFloat(amount) || 0;

        onSave({
            merchant,
            date,
            amount: finalAmount,
            spendingCategory: category,
            items: lineItems,
            payment,
            notes,
            tags: selectedTags,
            claimable,
            imageUrl: imagePreview
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Review Receipt</h2>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <Check size={12} /> AI Extracted Data
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 h-48 flex items-center justify-center border border-gray-200">
                            <img src={imagePreview} alt="Receipt" className="h-full w-full object-contain" />
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Merchant</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
                                    placeholder="e.g. Starbucks"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Total (RM)</label>
                                <div className="relative">
                                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as SpendingCategory)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800 appearance-none"
                                    >
                                        {SORTED_SPENDING_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Payment</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select
                                        value={payment}
                                        onChange={(e) => setPayment(e.target.value as PaymentMethod)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800 appearance-none"
                                    >
                                        <option value="Card">Card</option>
                                        <option value="Cash">Cash</option>
                                        <option value="E-Wallet">E-Wallet</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* LHDN Tags */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">LHDN Tags</label>
                            <div className="flex gap-2 flex-wrap">
                                {LHDN_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTags.includes(tag)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                            <input
                                type="checkbox"
                                id="claimable-confirm"
                                checked={claimable}
                                onChange={(e) => setClaimable(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="claimable-confirm" className="text-sm font-medium text-gray-700">Mark as claimable</label>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                rows={2}
                                placeholder="Add specific details..."
                            />
                        </div>

                        {/* Line Items */}
                        <div className="flex items-center justify-between pt-2">
                            <label className="text-xs font-semibold text-gray-500">Line Items</label>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="text-xs text-blue-600 font-bold flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-2">
                            {lineItems.map((item) => (
                                <div key={item.id} className="bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                                        placeholder="Item name"
                                        className="flex-1 bg-white px-2 py-1.5 rounded border border-gray-200 text-xs"
                                    />
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                        placeholder="Qty"
                                        className="w-12 bg-white px-2 py-1.5 rounded border border-gray-200 text-xs"
                                    />
                                    <input
                                        type="number"
                                        value={item.unit}
                                        onChange={(e) => updateLineItem(item.id, 'unit', parseFloat(e.target.value) || 0)}
                                        placeholder="Price"
                                        className="w-20 bg-white px-2 py-1.5 rounded border border-gray-200 text-xs"
                                    />
                                    {lineItems.length > 1 && (
                                        <button onClick={() => removeLineItem(item.id)} className="p-1.5 text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        Confirm & Save Receipt
                    </button>
                    <button onClick={onClose} className="w-full mt-3 text-sm text-gray-500 font-medium py-2">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
