import { X, Crown, Check, Shield, Zap, Upload, Sparkles, BarChart3, FileText } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useState } from 'react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ============ PRO FEATURE LIST (5 Core Pillars) ============
const PRO_FEATURES = [
    {
        icon: Upload,
        title: "Unlimited Uploads",
        desc: "No more worrying about the 10-scan limit.",
    },
    {
        icon: Zap,
        title: "Ad-Free Experience",
        desc: "100% focus on your finances.",
    },
    {
        icon: Sparkles,
        title: "AI Financial Co-Pilot",
        desc: "Automated analysis and habit tracking.",
    },
    {
        icon: BarChart3,
        title: "Unlimited Reports",
        desc: "Deep spending insights at your fingertips.",
    },
    {
        icon: FileText,
        title: "LHDN Tax Expert",
        desc: "Utilize your RM 2,500 Lifestyle and RM 10,000 Medical reliefs with ease.",
    },
];

// ============ PRICING CONSTANTS ============
const PRICING = {
    monthly: 12.90,
    annual: 129.00,
    // Annual savings: 12.90 * 12 = 154.80 - 129.00 = 25.80 (2 months free)
    annualSavings: 25.80,
    monthsFree: 2,
};

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
    const { upgradeToPro } = useStore();
    const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

    if (!isOpen) return null;

    const handleUpgrade = () => {
        upgradeToPro(selectedPlan);
        onClose();
    };

    // Dynamic CTA text based on selection
    const ctaText = selectedPlan === 'annual'
        ? 'Go Pro Annual'
        : 'Start Monthly Pro';

    const ctaPrice = selectedPlan === 'annual'
        ? `RM ${PRICING.annual.toFixed(2)}/year`
        : `RM ${PRICING.monthly.toFixed(2)}/month`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
            {/* Backdrop with 20px blur */}
            <div
                className="absolute inset-0 bg-black/60"
                style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                onClick={onClose}
            />

            <div className="relative w-full max-w-md max-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] bg-white rounded-3xl shadow-2xl overflow-hidden overflow-y-auto animate-in zoom-in-95 duration-300">

                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-center overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Crown Icon & Title */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3 transform rotate-3">
                            <Crown className="text-white drop-shadow-md" size={28} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-white mb-1 tracking-tight">
                            Upgrade to Duitrack Pro
                        </h2>
                        <p className="text-blue-100 text-sm">
                            Unlock your full financial potential
                        </p>
                    </div>
                </div>

                <div className="p-5">
                    {/* Monthly/Annual Toggle Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {/* Annual Card - Brand Gradient (Dominant) */}
                        <button
                            onClick={() => setSelectedPlan('annual')}
                            className={`relative p-4 rounded-2xl text-left transition-all overflow-hidden ${
                                selectedPlan === 'annual'
                                    ? 'ring-2 ring-purple-500 ring-offset-2'
                                    : 'hover:scale-[1.02]'
                            }`}
                            style={{
                                background: selectedPlan === 'annual'
                                    ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                                    : 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                            }}
                        >
                            {/* Savings Badge */}
                            <div className="absolute -top-0 -right-0 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wide">
                                Best Value
                            </div>

                            <p className="text-xs text-white/80 font-semibold mb-1 uppercase tracking-wider">Annual</p>
                            <p className="text-2xl font-black text-white tracking-tight">
                                RM {PRICING.annual.toFixed(0)}
                            </p>
                            <p className="text-xs text-white/70 font-medium">/year</p>

                            {/* Savings Pill */}
                            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                <Sparkles size={10} />
                                SAVE RM {PRICING.annualSavings.toFixed(2)} ({PRICING.monthsFree} MONTHS FREE)
                            </div>

                            {/* Selection Indicator */}
                            {selectedPlan === 'annual' && (
                                <div className="absolute bottom-3 right-3">
                                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                        <Check size={12} className="text-purple-600" strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </button>

                        {/* Monthly Card - Glassmorphism Style */}
                        <button
                            onClick={() => setSelectedPlan('monthly')}
                            className={`relative p-4 rounded-2xl text-left transition-all border-2 ${
                                selectedPlan === 'monthly'
                                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500 ring-offset-2'
                                    : 'border-gray-200 bg-white hover:border-purple-200 hover:scale-[1.02]'
                            }`}
                        >
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Monthly</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">
                                RM {PRICING.monthly.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">/month</p>

                            {/* Flexibility Label */}
                            <div className="mt-2 inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full">
                                Cancel anytime
                            </div>

                            {/* Selection Indicator */}
                            {selectedPlan === 'monthly' && (
                                <div className="absolute bottom-3 right-3">
                                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                                        <Check size={12} className="text-white" strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* 5 Core Pillars Feature List */}
                    <div className="space-y-3 mb-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">What's Included</p>
                        {PRO_FEATURES.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check size={10} className="text-white" strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{feature.title}</p>
                                    <p className="text-xs text-gray-500 leading-tight mt-0.5">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-purple-200 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5"
                    >
                        <span className="flex items-center gap-2 text-base">
                            <Crown size={18} />
                            {ctaText}
                        </span>
                        <span className="text-xs text-white/80 font-medium">{ctaPrice}</span>
                    </button>

                    {/* Trust Signals */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                        <Shield size={10} />
                        <span>Secure payment via FPX & Card</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>Cancel anytime</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
