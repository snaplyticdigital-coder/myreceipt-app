import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft } from 'lucide-react';
import { useStore } from '../../lib/store';
import { generateId } from '../../lib/format';
import { ReceiptUpload } from '../receipt-upload';
import { TransactionForm, type TransactionFormData } from '../forms/transaction-form';
import { categorizeItem } from '../../lib/categorization';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView: 'scan' | 'import' | 'manual'; // No longer optional or 'menu'
}

type ViewState = 'scan' | 'manual' | 'import' | 'form'; // Removed 'menu'

export function AddTransactionModal({ isOpen, onClose, initialView }: AddTransactionModalProps) {
    const navigate = useNavigate();
    const { addReceipt, user } = useStore();
    const [view, setView] = useState<ViewState>(initialView);

    // Data State
    const [formData, setFormData] = useState<Partial<TransactionFormData>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [_isFormDirty, setIsFormDirty] = useState(false);

    // Upload Ref
    const uploadRef = useRef<import('../receipt-upload').ReceiptUploadHandle>(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setView(initialView); // Direct to specified view
            setFormData({});
            setIsProcessing(false);
            setIsFormDirty(false);
        }
    }, [isOpen, initialView]);

    // Auto-trigger upload/scan when entering those views
    useEffect(() => {
        if (view === 'scan' || view === 'import') {
            const timer = setTimeout(() => {
                uploadRef.current?.open();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [view]);

    if (!isOpen) return null;

    // --- Handlers ---

    const handleCloseAttempt = () => {
        onClose();
    };

    const handleBackAttempt = () => {
        onClose(); // Close modal instead of going to menu
    };

    const handleSave = (data: TransactionFormData) => {
        const itemsTotal = data.items.reduce((sum, item) => sum + (item.qty * item.unit), 0);
        const taxRate = data.taxRate || 0;
        const taxAmount = (itemsTotal * taxRate) / 100;

        const receipt = {
            id: generateId(),
            userId: user.id,
            merchant: data.merchant,
            merchantCategory: 'Others' as const,
            spendingCategory: data.spendingCategory,
            date: data.date,
            uploadTimestamp: new Date().toISOString(),
            amount: parseFloat(data.amount),
            currency: 'RM',
            tax: taxAmount,
            taxRate: taxRate / 100, // Store as decimal in DB (e.g. 0.06)
            claimable: data.claimable,
            tags: data.tags,
            items: data.items,
            payment: data.payment,
            notes: data.notes,
            verificationStatus: 'pending' as const,
            imageUrl: data.imageUrl
        };

        addReceipt(receipt);
        onClose();
        navigate(`/receipt/${receipt.id}`);
    };

    const handleScanComplete = (data: any, imagePreview: string) => {
        setIsProcessing(false);

        // Infer tax rate if possible, else 0
        const total = parseFloat(data.amount?.toString() || data.total_amount?.toString() || '0');
        const taxAmt = parseFloat(data.tax_amount || data.sst_amount || '0');
        const inferredRate = (total > 0 && taxAmt > 0) ? ((taxAmt / (total - taxAmt)) * 100) : 0;

        // Map scanned data to Form Data
        setFormData({
            merchant: data.merchant || data.supplier_name,
            date: data.date || data.receipt_date,
            amount: total.toString(),
            taxRate: Math.round(inferredRate), // Round to nearest integer (e.g. 6)
            spendingCategory: data.spendingCategory || 'Others',
            items: data.items || data.line_items?.map((item: any) => ({
                id: generateId(),
                name: item.description || 'Item',
                qty: item.quantity || 1,
                unit: item.unit_price || item.amount || 0,
                claimable: false,
                productTags: item.description ? categorizeItem(item.description) : []
            })),
            imageUrl: imagePreview
        });

        setView('form');
    };

    const handleScanError = (err: string) => {
        setIsProcessing(false);
        alert(err);
        onClose(); // Close modal on error
    };

    // --- Render ---

    // Calculate height/style based on view
    const isForm = view === 'form' || view === 'manual';

    // Bottom Sheet Classes - Always full height for direct actions
    const containerClasses = "h-[95vh] rounded-t-2xl";

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
                onClick={handleCloseAttempt}
            />

            {/* Modal Content */}
            <div className={`
                relative w-full max-w-lg bg-white shadow-2xl 
                pointer-events-auto overflow-hidden flex flex-col
                transition-all duration-300 ease-out
                ${containerClasses}
            `}>

                {/* Header (Only for Form view usually, or unified) */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        {isForm && (
                            <button
                                onClick={handleBackAttempt}
                                className="p-1.5 -ml-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-gray-900">
                            {isForm ? 'Details' : view === 'scan' ? 'Scan Receipt' : 'Import Receipt'}
                        </h2>
                    </div>
                    <button
                        onClick={handleCloseAttempt}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-gray-50/50">


                    {/* VIEW: FORM (Manual or Scanned) */}
                    {isForm && (
                        <TransactionForm
                            initialData={formData}
                            onSave={handleSave}
                            onCancel={handleBackAttempt}
                            onDirtyChange={setIsFormDirty}
                            isProcessing={false}
                        />
                    )}

                    {/* HIDDEN: Processing/Upload Logic */}
                    {(view === 'scan' || view === 'import') && (
                        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
                            {isProcessing ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-blue-600 font-bold">Analyzing Receipt...</p>
                                    <p className="text-gray-400 text-xs mt-1">Extracting merchant & line items</p>
                                </div>
                            ) : (
                                <ReceiptUpload
                                    ref={uploadRef}
                                    capture={view === 'scan' ? 'environment' : undefined}
                                    onUploadStart={() => setIsProcessing(true)}
                                    onUploadComplete={handleScanComplete}
                                    onUploadError={handleScanError}
                                />
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
