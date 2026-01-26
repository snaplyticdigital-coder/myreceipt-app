import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X, Gift } from 'lucide-react';

interface ReferralBannerProps {
    className?: string;
}

export function ReferralBanner({ className = '' }: ReferralBannerProps) {
    const navigate = useNavigate();
    const [isDismissed, setIsDismissed] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Check localStorage for dismissed state on mount
    useEffect(() => {
        const dismissed = localStorage.getItem('referral_banner_dismissed');
        const dismissedAt = localStorage.getItem('referral_banner_dismissed_at');

        // Show again after 7 days
        if (dismissed && dismissedAt) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                setIsDismissed(true);
                return;
            }
        }

        // Animate in after mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);

        // Wait for animation then hide
        setTimeout(() => {
            setIsDismissed(true);
            localStorage.setItem('referral_banner_dismissed', 'true');
            localStorage.setItem('referral_banner_dismissed_at', Date.now().toString());
        }, 300);
    };

    const handleClick = () => {
        navigate('/referral');
    };

    if (isDismissed) return null;

    return (
        <div
            onClick={handleClick}
            className={`
                cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-4 shadow-lg
                relative overflow-hidden group transition-all duration-300 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                ${className}
            `}
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8 group-hover:bg-white/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl -ml-6 -mb-6" />

            {/* Dismiss Button */}
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-20"
                aria-label="Dismiss banner"
            >
                <X size={14} className="text-white" strokeWidth={2.5} />
            </button>

            <div className="relative z-10 flex items-center gap-4">
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                    <Gift size={20} className="text-white" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                            Limited Offer
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                        Get 7 Days of Pro Free!
                    </h3>
                    <p className="text-xs text-blue-100 font-medium mt-0.5">
                        Share with friends & unlock premium features
                    </p>
                </div>

                {/* Arrow */}
                <div className="shrink-0 bg-white rounded-full p-2 shadow-sm group-hover:scale-110 transition-transform">
                    <ChevronRight className="text-purple-600" size={18} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}
