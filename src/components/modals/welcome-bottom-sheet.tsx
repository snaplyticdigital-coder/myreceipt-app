import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';

interface WelcomeBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    completionPercentage?: number;
}

export function WelcomeBottomSheet({ isOpen, onClose, userName, completionPercentage = 20 }: WelcomeBottomSheetProps) {
    if (!isOpen) return null;

    const benefits = [
        'Track all your receipts in one place',
        'Auto-categorize for LHDN tax relief',
        'Get personalized financial insights',
        'Set budgets and reach your goals',
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Dismiss Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                >
                    <X size={18} className="text-white" />
                </button>

                {/* Hero Section with Gradient */}
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-6 pt-8 pb-10 text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                    <div className="relative z-10">
                        {/* Wave Emoji */}
                        <div className="text-5xl mb-4 animate-bounce">
                            👋
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {userName ? `Welcome, ${userName.split(' ')[0]}!` : 'Welcome!'}
                        </h2>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Let's complete your profile to unlock the<br />
                            full power of your financial co-pilot
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {/* Progress Preview */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">Profile Progress</span>
                            <span className="text-xs font-bold text-gray-700">{completionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-3 mb-6">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} className="text-green-600" strokeWidth={3} />
                                </div>
                                <p className="text-sm text-gray-700">{benefit}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <Link
                            to="/profile"
                            onClick={onClose}
                            className="w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
                        >
                            Complete Profile
                        </Link>

                        <button
                            onClick={onClose}
                            className="w-full py-3 text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>

                {/* Safe area padding for bottom */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    );
}
