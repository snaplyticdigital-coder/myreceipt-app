import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { Phone, X } from 'lucide-react';

interface TacVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: () => void;
    phone: string;
}

const TAC_LENGTH = 6;

export function TacVerificationModal({
    isOpen,
    onClose,
    onVerify,
    phone
}: TacVerificationModalProps) {
    const [tacDigits, setTacDigits] = useState<string[]>(Array(TAC_LENGTH).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setCountdown(60);
            setTacDigits(Array(TAC_LENGTH).fill(''));
            setActiveIndex(0);
            return;
        }
        // Focus first input when modal opens
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
    }, [isOpen]);

    // Countdown timer effect
    useEffect(() => {
        if (!isOpen || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, countdown]);

    const handleDigitChange = (index: number, value: string) => {
        // Only accept single digit
        const digit = value.replace(/\D/g, '').slice(-1);

        const newDigits = [...tacDigits];
        newDigits[index] = digit;
        setTacDigits(newDigits);

        // Auto-advance to next cell if digit entered
        if (digit && index < TAC_LENGTH - 1) {
            setActiveIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!tacDigits[index] && index > 0) {
                // Move to previous cell if current is empty
                setActiveIndex(index - 1);
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...tacDigits];
                newDigits[index - 1] = '';
                setTacDigits(newDigits);
            } else {
                // Clear current cell
                const newDigits = [...tacDigits];
                newDigits[index] = '';
                setTacDigits(newDigits);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            setActiveIndex(index - 1);
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < TAC_LENGTH - 1) {
            setActiveIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TAC_LENGTH);
        if (pastedData) {
            const newDigits = [...tacDigits];
            for (let i = 0; i < pastedData.length; i++) {
                newDigits[i] = pastedData[i];
            }
            setTacDigits(newDigits);
            // Focus last filled or next empty cell
            const focusIndex = Math.min(pastedData.length, TAC_LENGTH - 1);
            setActiveIndex(focusIndex);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleVerify = () => {
        const code = tacDigits.join('');
        if (code.length !== TAC_LENGTH) return;

        setIsVerifying(true);
        // Mock: any 6-digit code is accepted
        setTimeout(() => {
            onVerify();
            setIsVerifying(false);
            setTacDigits(Array(TAC_LENGTH).fill(''));
        }, 1500);
    };

    const handleResend = () => {
        setCountdown(60);
        setTacDigits(Array(TAC_LENGTH).fill(''));
        setActiveIndex(0);
        inputRefs.current[0]?.focus();
        // Mock resend - in real implementation, this would trigger SMS
    };

    const isComplete = tacDigits.every(d => d !== '');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop with 15px blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[15px]"
                onClick={onClose}
            />

            {/* Centered Modal - 28px radius, 16px padding */}
            <div className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>

                <div className="p-4">
                    {/* Header with gradient icon */}
                    <div className="text-center mb-6 pt-2">
                        {/* Blue-Purple gradient icon container */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                            <Phone size={28} className="text-white" strokeWidth={1.5} />
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

                    {/* Individual TAC Input Cells */}
                    <div className="flex justify-center gap-2 mb-6">
                        {tacDigits.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handleDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                onFocus={() => setActiveIndex(index)}
                                maxLength={1}
                                className={`w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl border-2 outline-none transition-all duration-200 ${
                                    activeIndex === index
                                        ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-500/20 shadow-lg shadow-purple-500/25'
                                        : digit
                                            ? 'border-gray-300 bg-gray-50'
                                            : 'border-gray-200 bg-gray-50'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Resend Timer/Button - Always visible */}
                    <div className="text-center mb-6">
                        {countdown > 0 ? (
                            <p className="text-sm text-gray-500">
                                Resend code in{' '}
                                <span className="font-mono font-semibold text-purple-600 tabular-nums">{countdown}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="text-sm text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-colors"
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
                            disabled={!isComplete || isVerifying}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 disabled:shadow-none"
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
            </div>
        </div>
    );
}
