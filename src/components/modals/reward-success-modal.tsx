import { useEffect } from 'react';
import { useStore } from '../../lib/store';
import { ScanLine, Smartphone } from 'lucide-react';
import { Player } from '@lottiefiles/react-lottie-player';

import { useNavigate } from 'react-router-dom';

const TITLES = [
    "Mantap! Reward Secured",
    "Steady! Scans Added",
    "Power lah! +3 Scans for you."
];

export function RewardSuccessModal() {
    const { rewardModal, closeRewardModal, user } = useStore();
    const { isOpen } = rewardModal;
    const navigate = useNavigate();

    const handleClose = () => {
        closeRewardModal();
        navigate('/'); // Navigate back to scanning/home
    };

    useEffect(() => {
        if (isOpen) {
            // Auto-dismiss after 5s
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, closeRewardModal, navigate]);

    if (!isOpen) return null;

    const randomTitle = TITLES[Math.floor(Math.random() * TITLES.length)];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop with Glassmorphism */}
            <div
                className="absolute inset-0 bg-white/10 backdrop-blur-[10px]"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-md rounded-[32px] shadow-2xl p-6 overflow-visible animate-in zoom-in-95 duration-300 border border-white/20">

                {/* Lottie Confetti Layer - Centered Behind Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[120%] h-[120%] pointer-events-none z-0">
                    <Player
                        autoplay
                        keepLastFrame
                        src="https://lottie.host/80788647-759b-443b-871d-87614e590059/7yA7q0n9W7.json"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center pt-8">
                    {/* Hero Icon: 3D-styled Scan + Floating +3 */}
                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[28px] flex items-center justify-center shadow-lg shadow-indigo-500/30 transform rotate-3 border-t border-white/30">
                            <Smartphone className="text-white drop-shadow-md" size={48} strokeWidth={2} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ScanLine className="text-white/50 animate-pulse" size={60} strokeWidth={1} />
                            </div>
                        </div>
                        {/* Floating +3 Badge */}
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-md border-4 border-white transform hover:scale-110 transition-transform">
                            +3
                        </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                        {randomTitle}
                    </h3>

                    {/* Sub-headline */}
                    <p className="text-gray-600 mb-8 max-w-[260px] text-sm leading-relaxed">
                        You now have <span className="font-bold text-blue-600 text-base">{user.scansRemaining}</span> scans remaining for this month. Jom, let’s track those expenses!
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all text-lg"
                    >
                        Jom Scan
                    </button>

                    {/* Dismiss text for accessibility/clarity */}
                    <button
                        onClick={handleClose}
                        className="mt-4 text-xs text-gray-400 hover:text-gray-600 font-medium"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
