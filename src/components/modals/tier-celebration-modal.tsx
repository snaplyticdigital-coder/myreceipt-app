import { useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { Share } from '@capacitor/share';
import { useStore } from '../../lib/store';
import { TIERS } from '../../lib/tier-constants';

export function TierCelebrationModal() {
    const { celebrationTier, clearCelebration } = useStore();

    useEffect(() => {
        if (celebrationTier !== null) {
            // Haptic Feedback for Android "Physical Feel"
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            const timer = setTimeout(() => {
                clearCelebration();
            }, 8000); // 8s auto-dismiss to keep demo moving
            return () => clearTimeout(timer);
        }
    }, [celebrationTier, clearCelebration]);

    const generateShareImage = async (tierName: string, tierIcon: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 1. Background (Purple to Blue Gradient)
        const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
        gradient.addColorStop(0, '#4F46E5'); // Indigo-600
        gradient.addColorStop(1, '#9333EA'); // Purple-600
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);

        // 2. Content Layer
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';

        // Logo
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.globalAlpha = 0.8;
        ctx.fillText('MyReceipt App', 540, 100);
        ctx.globalAlpha = 1.0;

        // Hero Emoji
        ctx.font = '300px serif';
        ctx.fillText(tierIcon, 540, 480);

        // Tier Name
        ctx.font = 'bold 80px Inter, sans-serif';
        ctx.fillText(`I AM NOW A`, 540, 700);
        ctx.fillText(`${tierName.toUpperCase()}!`, 540, 800);

        // Celebratory Phrase
        ctx.font = 'medium 40px Inter, sans-serif';
        ctx.fillText('Tracking finances like a boss.', 540, 950);

        // Convert to File
        return new Promise<File | null>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], 'myreceipt-levelup.png', { type: 'image/png' }));
                } else {
                    resolve(null);
                }
            }, 'image/png');
        });
    };

    const handleShare = async () => {
        if (!celebrationTier) return;
        const tier = TIERS[celebrationTier];

        try {
            const file = await generateShareImage(tier.name, tier.icon);
            // Use Caption Share plugin
            const shareOptions: any = {
                title: 'MyReceipt Level Up!',
                text: `Fuyoh! I just became a ${tier.name} on MyReceipt! #FinanceMalaysia`,
                dialogTitle: 'Share your achievement'
            };

            if (file) {
                shareOptions.files = [file];
            }

            await Share.share(shareOptions);

            await Share.share(shareOptions);

        } catch (error) {
            console.log('Error sharing:', error);
            // Fallback for Desktop/Web Demo
            alert(`[DEMO MODE] Shared to Social Media!\n${tier.name} Status Unlocked.`);
        }
    };

    if (celebrationTier === null) return null;

    const tier = TIERS[celebrationTier];
    if (!tier) return null;

    // Dynamic Manglish Headline
    let headline = "Steady Lah! You Silver dah!";
    if (tier.name.includes("Gold")) headline = "Mantap Boss! Welcome to Gold.";
    if (tier.name.includes("Diamond")) headline = "POWER GILA! Diamond Status Unlocked! 💎";
    if (tier.name.includes("Bronze")) headline = "Welcome aboard Boss!";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center isolate">
            {/* Glassmorphism Background with Heavy Blur */}
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xl transition-all duration-500" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center p-8 w-full max-w-sm animate-in zoom-in-95 duration-300">

                {/* Lottie Confetti Burst */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[400px] pointer-events-none">
                    <Player
                        autoplay
                        loop={false}
                        src="https://lottie.host/80788647-759b-443b-871d-87614e590059/7yA7q0n9W7.json"
                        style={{ height: '100%', width: '100%' }}
                    />
                </div>

                {/* Big Tier Icon - High Res */}
                <div className="text-9xl mb-6 filter drop-shadow-2xl animate-bounce duration-[2000ms]">
                    {tier.icon}
                </div>

                <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
                    {headline}
                </h2>

                <p className="text-white/90 font-medium mb-8 leading-relaxed text-lg max-w-[90%] shadow-black/10">
                    Your profile just got a major upgrade!<br />You’re one step closer to Diamond status. Jom, let’s keep your savings on track!
                </p>

                {/* Action Buttons */}
                <div className="w-full space-y-4">
                    <button
                        onClick={handleShare}
                        className={`w-full py-4 rounded-2xl bg-gradient-to-r ${tier.color} text-white font-bold text-xl shadow-2xl shadow-purple-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20`}
                    >
                        Jom Share Progress
                    </button>

                    <button
                        onClick={clearCelebration}
                        className="w-full py-2 text-white/70 font-medium text-sm hover:text-white active:scale-95 transition-all"
                    >
                        Later lah
                    </button>
                </div>
            </div>
        </div>
    );
}
