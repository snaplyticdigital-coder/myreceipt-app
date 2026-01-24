import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/layout/app-bar';
import { useStore } from '../lib/store';
import { Plus, X, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { generateId } from '../lib/format';
import { wouldExceedLifestyleCap, getRemainingLifestyleCap } from '../lib/lhdn-logic';
import type { LhdnTag, LineItem } from '../types';
import { ReceiptUpload } from '../components/receipt-upload';
import { ReceiptConfirmationModal } from '../components/receipt-confirmation-modal';
import { parseReceiptWithDocumentAI, isLowConfidence, type DocumentAIResult, type FieldConfidence } from '../lib/document-ai';

const LHDN_TAGS: LhdnTag[] = ['Lifestyle', 'Education', 'Medical', 'Childcare', 'Books', 'Sports', 'Others'];

export function AddReceiptPage() {
    const navigate = useNavigate();
    const { addReceipt, user } = useStore();

    // Tab state
    const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'import'>('scan');

    // Manual Form State
    const [merchant, setMerchant] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [selectedTags, setSelectedTags] = useState<LhdnTag[]>([]);
    const [claimable, setClaimable] = useState(false);
    // Removed unused payment/notes states for now as they trigger errors
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: generateId(), name: '', qty: 1, unit: 0, claimable: false },
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showToast, setShowToast] = useState(false);

    // AI Parsing State
    // Removed unused isProcessing state
    const [scannedData, setScannedData] = useState<any>(null);
    const [scanPreview, setScanPreview] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Document AI Import State
    const [importProcessing, setImportProcessing] = useState(false);
    const [importResult, setImportResult] = useState<DocumentAIResult | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [fieldConfidence, setFieldConfidence] = useState<FieldConfidence | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);

    // Calculate if Lifestyle cap would be exceeded
    const lifestyleAmount = lineItems
        .filter(item => item.tag === 'Lifestyle' && item.claimable)
        .reduce((sum, item) => sum + (item.qty * item.unit), 0);
    const wouldExceedCap = wouldExceedLifestyleCap(user.lifestyleYtd, user.lifestyleCap, lifestyleAmount);
    const remainingCap = getRemainingLifestyleCap(user.lifestyleYtd, user.lifestyleCap);

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

    const toggleTag = (tag: LhdnTag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Handle Manual Submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveReceipt({
            merchant,
            date,
            amount: parseFloat(amount),
            spendingCategory: 'Others', // Default for manual if not selected (could improve this)
            items: lineItems,
            payment: 'Card',
            notes: '',
            tags: selectedTags,
            claimable
        });
    };

    // Handle AI Scanned Receipt Save
    const handleConfirmScan = (data: any) => {
        saveReceipt({
            merchant: data.merchant,
            date: data.date,
            amount: data.amount,
            spendingCategory: data.spendingCategory,
            items: data.items,
            payment: 'Card', // Default
            notes: data.notes,
            tags: [], // Could infer tags later
            claimable: false, // Default
            imageUrl: data.imageUrl
        });
    };

    // Unified Save Function
    const saveReceipt = (data: any) => {
        // Validation (Basic)
        if (!data.merchant || !data.amount) {
            setErrors({ merchant: 'Required', amount: 'Required' });
            return;
        }

        const receipt = {
            id: generateId(),
            userId: user.id,
            merchant: data.merchant,
            merchantCategory: 'Others' as const, // Legacy field
            spendingCategory: data.spendingCategory || 'Others',
            date: data.date,
            uploadTimestamp: new Date().toISOString(),
            amount: data.amount,
            currency: 'RM',
            claimable: data.claimable || false,
            tags: data.tags || [],
            items: data.items || [],
            payment: data.payment || 'Card',
            notes: data.notes,
            verificationStatus: 'pending' as const,
            imageUrl: data.imageUrl // Store the image URL/Base64
        };

        addReceipt(receipt);

        setShowToast(true);
        setTimeout(() => {
            navigate(`/receipt/${receipt.id}`);
        }, 1000);
    };

    return (
        <div>
            <AppBar title="Add Receipt" />

            <div className="p-4">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-100">
                    {[
                        { id: 'scan', label: 'Scan' },
                        { id: 'manual', label: 'Manual' },
                        { id: 'import', label: 'Import' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Scan Tab */}
                {activeTab === 'scan' && (
                    <div className="py-8">
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Smart Scan</h3>
                            <p className="text-sm text-gray-500">
                                Upload a receipt image and let AI extract the details.
                            </p>
                        </div>

                        <ReceiptUpload
                            onUploadStart={() => { }} // No-op
                            onUploadComplete={(data, imagePreview) => {
                                setScannedData(data);
                                setScanPreview(imagePreview);
                                setShowConfirmModal(true);
                            }}
                            onUploadError={(err) => {
                                alert(err); // Simple alert for now
                            }}
                        />

                        {/* Confirmation Modal */}
                        <ReceiptConfirmationModal
                            isOpen={showConfirmModal}
                            onClose={() => setShowConfirmModal(false)}
                            onSave={handleConfirmScan}
                            parsedData={scannedData || {}}
                            imagePreview={scanPreview}
                        />
                    </div>
                )}

                {/* Manual Tab */}
                {activeTab === 'manual' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Lifestyle Cap Warning */}
                        {wouldExceedCap && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                                <p className="font-medium text-yellow-800 mb-1">Lifestyle cap will be exceeded</p>
                                <p className="text-gray-600 text-xs">
                                    Remaining: RM {remainingCap.toFixed(2)} of RM {user.lifestyleCap}.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Merchant *</label>
                            <input
                                type="text"
                                value={merchant}
                                onChange={(e) => setMerchant(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g., Watsons"
                            />
                            {errors.merchant && <p className="text-xs text-red-500 mt-1">{errors.merchant}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date *</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount (RM) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        {/* LHDN Tags */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">LHDN Tags</label>
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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="claimable"
                                checked={claimable}
                                onChange={(e) => setClaimable(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="claimable" className="text-sm font-medium text-gray-700">Mark as claimable</label>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="block text-xs font-semibold text-gray-500">Line Items</label>
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
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 mt-6 active:scale-[0.98] transition-all">
                            Save Receipt
                        </button>
                    </form>
                )}

                {/* Import Tab - Document AI Integration */}
                {activeTab === 'import' && (
                    <div className="py-4">
                        {!importResult ? (
                            /* File Upload Section */
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Import Receipt</h3>
                                    <p className="text-sm text-gray-500">
                                        Upload a PDF or image and let Document AI extract the details.
                                    </p>
                                </div>

                                {/* File Input (Hidden) */}
                                <input
                                    ref={importFileRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setImportProcessing(true);
                                        setImportError(null);

                                        try {
                                            const result = await parseReceiptWithDocumentAI(file);
                                            setImportResult(result);
                                            setFieldConfidence(result.confidence);

                                            // Pre-fill form with result
                                            setMerchant(result.merchant);
                                            setDate(result.date);
                                            setAmount(result.totalAmount.toFixed(2));
                                            setLineItems(result.lineItems.length > 0 ? result.lineItems : [
                                                { id: generateId(), name: '', qty: 1, unit: 0, claimable: false }
                                            ]);
                                        } catch (err) {
                                            setImportError('Failed to process receipt. Please try again.');
                                        } finally {
                                            setImportProcessing(false);
                                        }
                                    }}
                                />

                                {/* Upload Button */}
                                <button
                                    onClick={() => importFileRef.current?.click()}
                                    disabled={importProcessing}
                                    className="w-full flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                                >
                                    {importProcessing ? (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Loader2 size={24} className="text-blue-600 animate-spin" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-800">Processing with AI...</p>
                                                <p className="text-xs text-gray-500 mt-1">Extracting receipt details</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Upload size={24} className="text-gray-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-800">Select File to Import</p>
                                                <p className="text-xs text-gray-500 mt-1">PDF, JPEG, or PNG</p>
                                            </div>
                                        </>
                                    )}
                                </button>

                                {/* Error Message */}
                                {importError && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                        <AlertCircle size={16} />
                                        {importError}
                                    </div>
                                )}

                                {/* Supported Formats */}
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <FileText size={14} />
                                        PDF
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FileText size={14} />
                                        JPEG/PNG
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Extracted Data Form */
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* AI Extraction Header */}
                                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                            <FileText size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800">AI Extracted</p>
                                            <p className="text-[10px] text-blue-600">Review and edit if needed</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImportResult(null);
                                            setFieldConfidence(null);
                                        }}
                                        className="text-xs text-blue-600 font-medium hover:underline"
                                    >
                                        Start Over
                                    </button>
                                </div>

                                {/* Merchant Field */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Merchant *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={merchant}
                                            onChange={(e) => setMerchant(e.target.value)}
                                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${fieldConfidence && isLowConfidence(fieldConfidence.merchant)
                                                    ? 'border-amber-300 bg-amber-50'
                                                    : 'border-gray-200'
                                                }`}
                                            placeholder="e.g., Watsons"
                                        />
                                        {fieldConfidence && isLowConfidence(fieldConfidence.merchant) && (
                                            <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />
                                        )}
                                    </div>
                                    {fieldConfidence && isLowConfidence(fieldConfidence.merchant) && (
                                        <p className="text-[10px] text-amber-600 mt-1 ml-1">Low confidence - please verify</p>
                                    )}
                                </div>

                                {/* Date Field */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date *</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${fieldConfidence && isLowConfidence(fieldConfidence.date)
                                                ? 'border-amber-300 bg-amber-50'
                                                : 'border-gray-200'
                                            }`}
                                    />
                                </div>

                                {/* Amount Field */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Total Amount (RM) *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${fieldConfidence && isLowConfidence(fieldConfidence.totalAmount)
                                                    ? 'border-amber-300 bg-amber-50'
                                                    : 'border-gray-200'
                                                }`}
                                            placeholder="0.00"
                                        />
                                        {fieldConfidence && isLowConfidence(fieldConfidence.totalAmount) && (
                                            <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />
                                        )}
                                    </div>
                                    {fieldConfidence && isLowConfidence(fieldConfidence.totalAmount) && (
                                        <p className="text-[10px] text-amber-600 mt-1 ml-1">Low confidence - please verify</p>
                                    )}
                                </div>

                                {/* Line Items */}
                                <div className="flex items-center justify-between pt-2">
                                    <label className="block text-xs font-semibold text-gray-500">Line Items</label>
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
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 mt-6 active:scale-[0.98] transition-all">
                                    Save Receipt
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom duration-300">
                    Receipt saved!
                </div>
            )}
        </div>
    );
}
