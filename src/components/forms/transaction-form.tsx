import { useState, useEffect, useRef } from 'react';
import {
    FileText, Calendar, Tag, CreditCard,
    Plus, Trash2, Save, AlertTriangle, AlertCircle, ChevronDown
} from 'lucide-react';
import type { SpendingCategory, PaymentMethod, LhdnTag, LineItem } from '../../types';
import { generateId } from '../../lib/format';
import { categorizeItem } from '../../lib/categorization';
import { InAppSelect } from '../ui/in-app-select';
import { CalendarPicker } from '../ui/calendar-picker';
import { SORTED_SPENDING_CATEGORIES } from '../../lib/constants';

export interface TransactionFormData {
    merchant: string;
    date: string;
    amount: string;
    taxRate?: number; // GST/SST %
    spendingCategory: SpendingCategory;
    payment: PaymentMethod;
    notes: string;
    tags: LhdnTag[];
    claimable: boolean;
    items: LineItem[];
    imageUrl?: string | null;
}

interface TransactionFormProps {
    initialData?: Partial<TransactionFormData>;
    onSave: (data: TransactionFormData) => void;
    onCancel: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
    isProcessing?: boolean;
}

export const LHDN_TAGS: LhdnTag[] = ['Lifestyle', 'Education', 'Medical', 'Childcare', 'Books', 'Sports', 'Others'];

const MAIN_CATEGORIES = SORTED_SPENDING_CATEGORIES;

export function TransactionForm({ initialData, onSave, onDirtyChange, isProcessing = false }: TransactionFormProps) {

    // Form State
    const [merchant, setMerchant] = useState(initialData?.merchant || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(initialData?.amount || '');
    const [taxRate, setTaxRate] = useState<string>(initialData?.taxRate?.toString() || '');
    const [category, setCategory] = useState<SpendingCategory>(initialData?.spendingCategory || 'Others');
    const [payment, setPayment] = useState<PaymentMethod>(initialData?.payment || 'Card');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [selectedTags, setSelectedTags] = useState<LhdnTag[]>(initialData?.tags || []);
    const [claimable, setClaimable] = useState(initialData?.claimable || false);

    // Enhanced Logic State
    const [showTax2, setShowTax2] = useState(false);
    const [taxRate2, setTaxRate2] = useState<string>('0');
    const [rounding, setRounding] = useState<string>('');

    // In-App Select Modal State
    const [openSelect, setOpenSelect] = useState<'category' | 'payment' | 'tax1' | 'tax2' | null>(null);

    // Anchor Refs for Popover positioning
    const categoryRef = useRef<HTMLButtonElement>(null);
    const paymentRef = useRef<HTMLButtonElement>(null);
    const tax1Ref = useRef<HTMLButtonElement>(null);
    const tax2Ref = useRef<HTMLButtonElement>(null);
    const dateRef = useRef<HTMLButtonElement>(null);

    // Calendar State
    const [showCalendar, setShowCalendar] = useState(false);

    // Line Items State
    const [lineItems, setLineItems] = useState<LineItem[]>(initialData?.items && initialData.items.length > 0
        ? initialData.items
        : [{ id: generateId(), name: 'Item 1', qty: 1, unit: 0, claimable: false }]
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dirty Checking State
    const [initialState, setInitialState] = useState<string>('');
    useEffect(() => {
        const snap = JSON.stringify({
            merchant: initialData?.merchant || '',
            date: initialData?.date || new Date().toISOString().split('T')[0],
            amount: initialData?.amount || '',
            taxRate: initialData?.taxRate || '',
            category: initialData?.spendingCategory || 'Others',
            payment: initialData?.payment || 'Card',
            notes: initialData?.notes || '',
            tags: initialData?.tags || [],
            claimable: initialData?.claimable || false,
            items: initialData?.items || [{ name: 'Item 1', qty: 1, unit: 0, claimable: false }]
        });
        setInitialState(snap);
    }, [initialData]);

    useEffect(() => {
        if (!initialState) return;
        const current = JSON.stringify({
            merchant, date, amount, taxRate, category, payment, notes, tags: selectedTags, claimable,
            items: lineItems.map(i => ({ name: i.name, qty: i.qty, unit: i.unit, claimable: i.claimable, productTags: i.productTags }))
        });
        if (onDirtyChange) onDirtyChange(current !== initialState);
    }, [merchant, date, amount, taxRate, category, payment, notes, selectedTags, claimable, lineItems, initialState, onDirtyChange]);

    // Update form if initialData changes (e.g., after scan)
    useEffect(() => {
        if (initialData) {
            if (initialData.merchant) setMerchant(initialData.merchant);
            if (initialData.date) setDate(initialData.date);
            if (initialData.amount) {
                setAmount(initialData.amount);
            }
            if (initialData.taxRate !== undefined) setTaxRate(initialData.taxRate.toString());
            if (initialData.spendingCategory) setCategory(initialData.spendingCategory);
            if (initialData.payment) setPayment(initialData.payment);
            if (initialData.notes) setNotes(initialData.notes);
            if (initialData.tags) setSelectedTags(initialData.tags);
            if (initialData.claimable !== undefined) setClaimable(initialData.claimable);
            if (initialData.items && initialData.items.length > 0) setLineItems(initialData.items);
        }
    }, [initialData]);

    // --- Math Logic ---
    // --- Math Logic ---
    const itemsTotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unit), 0);
    const tax1Value = (itemsTotal * (parseFloat(taxRate) || 0)) / 100;
    const tax2Value = showTax2 ? (itemsTotal * (parseFloat(taxRate2) || 0)) / 100 : 0;
    const roundingValue = parseFloat(rounding) || 0;

    const calculatedTotal = itemsTotal + tax1Value + tax2Value + roundingValue;

    // Locked Total: Always sync amount with calculatedTotal
    useEffect(() => {
        setAmount(calculatedTotal.toFixed(2));
    }, [calculatedTotal]);

    // Validation Logic
    const isMathValid = () => {
        const totalInput = parseFloat(amount);
        if (isNaN(totalInput)) return true; // Handled by required check
        // Allow small float diff (0.05)
        return Math.abs(totalInput - calculatedTotal) < 0.05;
    };

    const mathValid = isMathValid();

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!merchant.trim()) newErrors.merchant = 'Merchant name is required';

        const numAmount = parseFloat(amount);
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            newErrors.amount = 'Amount must be > 0.00';
        }

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (new Date(date) > today) {
            newErrors.date = 'Future dates are not allowed';
        }

        if (!mathValid) {
            newErrors.math = 'Total mismatch';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValid = merchant.trim().length > 0 &&
        !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 &&
        !errors.date && mathValid;

    // Real-time error updates
    useEffect(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        setErrors(prev => {
            const next = { ...prev };
            if (new Date(date) > today) next.date = 'Future dates are not allowed';
            else delete next.date;

            if (amount && !mathValid) next.math = 'Total mismatch';
            else delete next.math;

            return next;
        });
    }, [date, amount, calculatedTotal, mathValid]); // Re-run when inputs change


    const addLineItem = () => {
        setLineItems([...lineItems, { id: generateId(), name: '', qty: 1, unit: 0, claimable: false, productTags: [] }]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) setLineItems(lineItems.filter(item => item.id !== id));
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(lineItems.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: value };
            if (field === 'name') updated.productTags = categorizeItem(value);
            return updated;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({
                merchant, date, amount,
                taxRate: taxRate ? parseFloat(taxRate) : 0,
                spendingCategory: category, payment, notes,
                tags: selectedTags, claimable, items: lineItems,
                imageUrl: initialData?.imageUrl
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-5 pb-24">

                {/* 0. Image Preview */}
                {initialData?.imageUrl && (
                    <div className="bg-gray-100 rounded-xl overflow-hidden h-40 flex items-center justify-center border border-gray-200 mb-2">
                        <img src={initialData.imageUrl} alt="Receipt" className="h-full w-full object-contain" />
                    </div>
                )}

                {/* 1. Primary Info */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Merchant *</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={merchant}
                                onChange={(e) => {
                                    setMerchant(e.target.value);
                                    if (errors.merchant) setErrors({ ...errors, merchant: '' });
                                }}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.merchant ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800`}
                                placeholder="e.g. Starbucks"
                            />
                        </div>
                        {errors.merchant && <p className="text-[10px] text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.merchant}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Date *</label>
                            <button
                                ref={dateRef}
                                type="button"
                                onClick={() => setShowCalendar(true)}
                                className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border ${errors.date ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'} rounded-xl transition-all font-medium text-gray-800`}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-gray-400" size={16} />
                                    <span>{date ? new Date(date).toLocaleDateString('en-GB') : 'Select date'}</span>
                                </div>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>
                            {errors.date && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Total Amount (RM) *</label>
                            <div className="relative">
                                {/* Removed DollarSign Prefix */}
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    readOnly={true}
                                    className={`w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-0 focus:border-gray-200 outline-none transition-all font-bold text-gray-600 cursor-not-allowed`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.amount && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.amount}</p>}
                            {!mathValid && amount && (
                                <p className="text-[10px] text-amber-600 mt-1 ml-1 flex items-center gap-1 font-medium">
                                    <AlertTriangle size={10} /> Total doesn't match items + tax (Calc: {calculatedTotal.toFixed(2)})
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* 2. Metadata */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category</label>
                            <button
                                ref={categoryRef}
                                type="button"
                                onClick={() => setOpenSelect('category')}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl transition-all font-medium text-gray-800"
                            >
                                <div className="flex items-center gap-2">
                                    <Tag className="text-gray-400" size={16} />
                                    <span>{category}</span>
                                </div>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Payment</label>
                            <button
                                ref={paymentRef}
                                type="button"
                                onClick={() => setOpenSelect('payment')}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl transition-all font-medium text-gray-800"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="text-gray-400" size={16} />
                                    <span>{payment}</span>
                                </div>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Tax Percentage Dropdown */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-gray-500">Tax Rate (SST %)</label>
                            {tax1Value > 0 && (
                                <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    RM {tax1Value.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <button
                            ref={tax1Ref}
                            type="button"
                            onClick={() => setOpenSelect('tax1')}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl transition-all font-medium text-gray-800 mb-3"
                        >
                            <span>{taxRate || '0'}%</span>
                            <ChevronDown size={16} className="text-gray-400" />
                        </button>

                        {/* Secondary Tax Field */}
                        {showTax2 ? (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-gray-500">Service Charge / Other</label>
                                    <div className="flex items-center gap-2">
                                        {tax2Value > 0 && (
                                            <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                RM {tax2Value.toFixed(2)}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setShowTax2(false); setTaxRate2('0'); }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    ref={tax2Ref}
                                    type="button"
                                    onClick={() => setOpenSelect('tax2')}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl transition-all font-medium text-gray-800 mb-3"
                                >
                                    <span>{taxRate2}%</span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowTax2(true)}
                                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 mb-3"
                            >
                                <Plus size={12} /> Add Service Charge/Other Tax
                            </button>
                        )}

                        {/* Bill Rounding */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-gray-500">Bill Rounding</label>
                                <span className="text-[10px] font-normal text-gray-400">Optional</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rounding}
                                    onChange={(e) => setRounding(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* 3. Line Items */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-500">Line Items</label>
                        <button
                            type="button"
                            onClick={addLineItem}
                            className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                        >
                            <Plus size={14} /> Add Item
                        </button>
                    </div>

                    {/* Headers - STRICT ALIGNMENT */}
                    <div className="flex gap-2 px-3 pb-1 items-end">
                        <div className="flex-[2] text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left pl-3">Item Name</div>
                        <div className="w-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Qty</div>
                        <div className="w-20 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right pr-2">Price (RM)</div>
                        <div className="w-8"></div>
                    </div>

                    <div className="space-y-2">
                        {lineItems.map((item) => (
                            <div key={item.id} className="bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 relative group">
                                <div className="flex items-start gap-2">
                                    <div className="flex-[2] space-y-2">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                                            placeholder="Item name"
                                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                        {item.productTags && item.productTags.length > 0 && (
                                            <div className="flex gap-1 flex-wrap">
                                                {item.productTags.map(tag => (
                                                    <span key={tag} className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                        className="w-12 bg-white px-0 py-2 rounded-lg border border-gray-200 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none h-[34px]"
                                    />
                                    <input
                                        type="number"
                                        value={item.unit}
                                        onChange={(e) => updateLineItem(item.id, 'unit', parseFloat(e.target.value) || 0)}
                                        className="w-20 bg-white px-2 py-2 rounded-lg border border-gray-200 text-xs text-right focus:ring-1 focus:ring-blue-500 outline-none h-[34px]"
                                    />
                                    {lineItems.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => removeLineItem(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors h-[34px] flex items-center justify-center w-8"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <div className="w-8"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Section Refactor */}
                    <div className="space-y-1 pt-4 border-t border-gray-100 mt-2 px-3">
                        {/* Row 1: Total Price */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Total Price</span>
                            <span>RM {itemsTotal.toFixed(2)}</span>
                        </div>
                        {/* Row 2: Tax 1 Amount */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Tax Amount ({taxRate}%)</span>
                            <span>RM {tax1Value.toFixed(2)}</span>
                        </div>
                        {/* Row 3: Tax 2 Amount (Conditional) */}
                        {showTax2 && (
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Service/Other ({taxRate2}%)</span>
                                <span>RM {tax2Value.toFixed(2)}</span>
                            </div>
                        )}
                        {/* Row 4: Rounding */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Rounding</span>
                            <span className={roundingValue < 0 ? "text-red-500" : ""}>RM {roundingValue.toFixed(2)}</span>
                        </div>
                        {/* Row 5: Total Price After Tax */}
                        <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1">
                            <span>Total Price After Tax</span>
                            <span>RM {calculatedTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Action Button */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
                <button
                    type="submit"
                    disabled={!isValid || isProcessing}
                    className={`
                        w-full py-3.5 rounded-2xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                        ${!isValid || isProcessing
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-blue-600 text-white shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
                        }
                    `}
                >
                    {isProcessing ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Receipt
                        </>
                    )}
                </button>
            </div>

            {/* Popover Select Menus */}
            <InAppSelect
                isOpen={openSelect === 'category'}
                onClose={() => setOpenSelect(null)}
                anchorRef={categoryRef}
                showIcons={true}
                options={MAIN_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                value={category}
                onSelect={(val) => setCategory(val as SpendingCategory)}
            />
            <InAppSelect
                isOpen={openSelect === 'payment'}
                onClose={() => setOpenSelect(null)}
                anchorRef={paymentRef}
                showIcons={true}
                options={[
                    { value: 'Card', label: 'Card' },
                    { value: 'Cash', label: 'Cash' },
                    { value: 'E-Wallet', label: 'E-Wallet' }
                ]}
                value={payment}
                onSelect={(val) => setPayment(val as PaymentMethod)}
            />
            <InAppSelect
                isOpen={openSelect === 'tax1'}
                onClose={() => setOpenSelect(null)}
                anchorRef={tax1Ref}
                showIcons={false}
                options={[
                    { value: '0', label: '0%' },
                    { value: '6', label: '6%' },
                    { value: '8', label: '8%' },
                    { value: '10', label: '10%' }
                ]}
                value={taxRate || '0'}
                onSelect={(val) => setTaxRate(val)}
            />
            <InAppSelect
                isOpen={openSelect === 'tax2'}
                onClose={() => setOpenSelect(null)}
                anchorRef={tax2Ref}
                showIcons={false}
                options={[
                    { value: '0', label: '0%' },
                    { value: '6', label: '6%' },
                    { value: '8', label: '8%' },
                    { value: '10', label: '10%' }
                ]}
                value={taxRate2}
                onSelect={(val) => setTaxRate2(val)}
            />

            {/* Calendar Picker */}
            <CalendarPicker
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                anchorRef={dateRef}
                value={date}
                onChange={(newDate) => setDate(newDate)}
            />
        </form >
    );
}
