import { useState, useEffect } from 'react';
import { Phone, X } from 'lucide-react';

interface TacVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: () => void;
    phone: string;
}

export function TacVerificationModal({
    isOpen,
    onClose,
    onVerify,
    phone
}: TacVerificationModalProps) {
    const [tacCode, setTacCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // Countdown timer effect
    useEffect(() => {
        if (!isOpen) {
            setCountdown(60);
            setTacCode('');
            return;
        }

        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, countdown]);

    const handleVerify = () => {
        if (tacCode.length !== 6) return;
        setIsVerifying(true);
        // Mock: any 6-digit code is accepted
        setTimeout(() => {
            onVerify();
            setIsVerifying(false);
            setTacCode('');
        }, 1500);
    };

    const handleResend = () => {
        setCountdown(60);
        // Mock resend - in real implementation, this would trigger SMS
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>

                <div className="p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone size={24} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Verify Phone Number
                        </h2>
                        <p className="text-sm text-gray-500">
                            Enter the 6-digit code sent to
                            <br />
                            <span className="font-semibold text-gray-700">
                                {phone || 'your phone'}
                            </span>
                        </p>
                    </div>

                    {/* TAC Input */}
                    <div className="mb-6">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={tacCode}
                            onChange={(e) =>
                                setTacCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                            }
                            placeholder="000000"
                            maxLength={6}
                            className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-xl py-4 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Resend Timer/Button */}
                    <div className="text-center mb-6">
                        {countdown > 0 ? (
                            <p className="text-sm text-gray-400">
                                Resend code in{' '}
                                <span className="font-mono font-semibold">{countdown}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="text-sm text-blue-600 font-semibold hover:underline"
                            >
                                Resend Code
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={tacCode.length !== 6 || isVerifying}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </span>
                            ) : (
                                'Verify'
                            )}
                        </button>
                    </div>

                    {/* Help Text */}
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Didn't receive the code? Check your phone number or try again.
                    </p>
                </div>

                {/* Safe area padding */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    );
}
