import { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { CameraScanner } from './camera-scanner';

export interface ReceiptUploadHandle {
    open: () => void;
}

interface ReceiptUploadProps {
    onUploadStart: () => void;
    onUploadComplete: (data: any, imagePreview: string) => void;
    onUploadError: (error: string) => void;
    capture?: 'user' | 'environment' | undefined;
}

export const ReceiptUpload = forwardRef<ReceiptUploadHandle, ReceiptUploadProps>(({ onUploadStart, onUploadComplete, onUploadError, capture }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    useImperativeHandle(ref, () => ({
        open: () => {
            if (capture === 'environment') {
                setShowCamera(true);
            } else {
                fileInputRef.current?.click();
            }
        }
    }));

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            onUploadError('Please upload an image or PDF file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            onUploadError('File size is too large (max 10MB)');
            return;
        }

        processFile(file);
    };

    const handleCameraCapture = (imageSrc: string) => {
        setShowCamera(false);
        // Convert base64 to File object
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                processFile(file);
            });
    };

    const processFile = async (file: File) => {
        setIsThinking(true);
        onUploadStart();

        try {
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);

            // Read file as base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];

                try {
                    // Call backend API (proxied to Cloud Function or local)
                    const response = await fetch('/api/parse-receipt', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            image: base64String,
                            mimeType: file.type,
                        }),
                    });

                    const result = await response.json();

                    if (!result.success) {
                        throw new Error(result.error || 'Failed to parse receipt');
                    }

                    onUploadComplete(result.data, previewUrl);
                } catch (err: any) {
                    console.error('API Error:', err);
                    // Fallback for demo/dev if backend is not running
                    if (import.meta.env.DEV) {
                        console.warn('Backend unavailable, falling back to mock data for dev');
                        // Simulate delay
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        onUploadComplete(mockParseResult, previewUrl);
                    } else {
                        throw err;
                    }
                } finally {
                    setIsThinking(false);
                }
            };
            reader.readAsDataURL(file);

        } catch (error: any) {
            console.error('Upload error:', error);
            onUploadError(error.message || 'Failed to process receipt');
            setIsThinking(false);
        }
    };

    if (showCamera) {
        return (
            <CameraScanner
                onCapture={handleCameraCapture}
                onClose={() => setShowCamera(false)}
                onGalleryClick={() => {
                    setShowCamera(false);
                    setTimeout(() => fileInputRef.current?.click(), 100);
                }}
            />
        );
    }

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf"
                // capture property removed here as we handle 'environment' via custom UI
                onChange={handleFileSelect}
            />

            {isThinking ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
                        <div className="relative bg-white p-4 rounded-full shadow-lg border border-blue-100">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Analyzing Receipt</h3>
                    <p className="text-gray-500 text-sm">Extracting details...</p>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-400">
                    <p className="text-sm">Waiting for input...</p>
                    {/* Fallback button */}
                    <button
                        onClick={() => {
                            if (capture === 'environment') setShowCamera(true);
                            else fileInputRef.current?.click();
                        }}
                        className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-200"
                    >
                        {capture === 'environment' ? 'Open Camera' : 'Retry Scan'}
                    </button>
                </div>
            )}
        </div>
    );
});
ReceiptUpload.displayName = 'ReceiptUpload';

// Mock fallback for development if backend isn't reachable
const mockParseResult = {
    supplier_name: "Mock Merchant (Dev)",
    total_amount: 125.50,
    receipt_date: new Date().toISOString().split('T')[0],
    currency: "MYR",
    line_items: [
        { description: "Item 1", amount: 50.00, quantity: 1 },
        { description: "Item 2", amount: 75.50, quantity: 1 }
    ]
};
