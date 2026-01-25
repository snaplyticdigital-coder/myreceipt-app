import { X, Crown, PlayCircle, Check, Shield, Zap } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useState, useEffect } from 'react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
    const { user, watchAd, upgradeToPro } = useStore();
    const [isWatching, setIsWatching] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
    const [timeLeft, setTimeLeft] = useState('');
    const [canWatchAd, setCanWatchAd] = useState(true);

    // Check cooldown logic
    useEffect(() => {
        const checkCooldown = () => {
            if (!user.lastAdWatch) {
                setCanWatchAd(true);
                return;
            }

            const lastWatch = new Date(user.lastAdWatch).getTime();
            const now = new Date().getTime();
            const hoursPassed = (now - lastWatch) / (1000 * 60 * 60);

            if (hoursPassed < 48) {
                setCanWatchAd(false);
                const msLeft = (48 * 60 * 60 * 1000) - (now - lastWatch);

                const h = Math.floor(msLeft / (1000 * 60 * 60));
                const m = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

                setTimeLeft(`${h}h ${m}m`);
            } else {
                setCanWatchAd(true);
            }
        };

        checkCooldown();
        const interval = setInterval(checkCooldown, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [user.lastAdWatch, isOpen]);

    if (!isOpen) return null;

    const handleWatchAd = () => {
        setIsWatching(true);
        // Simulate 3s Ad
        setTimeout(() => {
            watchAd();
            // Show Success Modal instead of Toast for "Wow" factor
            // useStore.getState().showToast("Mantap! +3 Scans added to your account.", 'success');
            useStore.getState().openRewardModal(3);
            setIsWatching(false);
            onClose();
        }, 3000);
    };

    const handleUpgrade = () => {
        upgradeToPro();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">

                {/* 1. Hero Section */}
                <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 p-8 text-center overflow-hidden">
                    {/* Sparkle/Shimmer Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    {/* Dismiss Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/70 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* 3D Icon & Title */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 transform rotate-3">
                            <Crown className="text-white drop-shadow-md" size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Stop Losing Money, Start Saving Like a Pro!</h2>
                        <p className="text-blue-100 text-sm max-w-xs mx-auto leading-relaxed">
                            Join the top 10% of Malaysians reaching their financial goals faster.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {/* 2. Value List (Comparison) */}
                    <div className="space-y-4 mb-6">
                        {[
                            { title: "Find Your Hidden Leaks", desc: "We catch weird spikes in your bills before they eat your wallet." },
                            { title: "Predict Your Future", desc: "Our AI forecasts your month-end balance. No more pokai last minute!" },
                            { title: "The RM 12.90 Hack", desc: "Most Pro users save over RM 100/mo by following custom Savings Opportunities." },
                            { title: "Tax Relief Automation", desc: "Claim every RM back with zero effort." }
                        ].map((benefit, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check size={12} className="text-green-600" strokeWidth={3} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900">{benefit.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. Pricing Tiers */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => setSelectedPlan('annual')}
                            className={`relative p-3 rounded-xl border-2 text-left transition-all ${selectedPlan === 'annual'
                                ? 'border-indigo-600 bg-indigo-50/50'
                                : 'border-gray-200 hover:border-indigo-200'
                                }`}
                        >
                            {/* Badge */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                SAVE 16%
                            </div>
                            <p className="text-xs text-gray-500 font-medium mb-0.5">Annual</p>
                            <p className="text-lg font-bold text-gray-900">RM129.90</p>
                            <p className="text-[10px] text-gray-400">/year</p>

                            {selectedPlan === 'annual' && (
                                <div className="absolute top-3 right-3 text-indigo-600">
                                    <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <Check size={10} className="text-white" strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => setSelectedPlan('monthly')}
                            className={`relative p-3 rounded-xl border-2 text-left transition-all ${selectedPlan === 'monthly'
                                ? 'border-indigo-600 bg-indigo-50/50'
                                : 'border-gray-200 hover:border-indigo-200'
                                }`}
                        >
                            <p className="text-xs text-gray-500 font-medium mb-0.5">Monthly</p>
                            <p className="text-lg font-bold text-gray-900">RM12.90</p>
                            <p className="text-[10px] text-gray-400">/month</p>

                            {selectedPlan === 'monthly' && (
                                <div className="absolute top-3 right-3 text-indigo-600">
                                    <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <Check size={10} className="text-white" strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* 4. Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold font-black shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-pulse hover:animate-none"
                        >
                            <Zap size={18} className="fill-white" />
                            Unlock My Financial Freedom — RM 12.90
                        </button>

                        <button
                            onClick={handleWatchAd}
                            disabled={!canWatchAd || isWatching}
                            className={`w-full py-3 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${!canWatchAd
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {isWatching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                    Playing Ad...
                                </>
                            ) : !canWatchAd ? (
                                <span className="font-mono text-xs">
                                    Next ad in {timeLeft}
                                </span>
                            ) : (
                                <>
                                    <PlayCircle size={16} />
                                    Watch Ad for +3 Scans
                                </>
                            )}
                        </button>
                    </div>

                    {/* 5. Trust Signals */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                        <Shield size={12} />
                        <span>Secure payment via FPX & Card</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>Join 1,000+ Malaysians</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
