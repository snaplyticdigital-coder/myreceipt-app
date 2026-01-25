import { Crown } from 'lucide-react';
import { useStore } from '../lib/store';


interface ProLockOverlayProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    blurAmount?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ProLockOverlay({
    children,
    title = "Stop Losing Money, Start Saving Like a Pro!",
    blurAmount = 'lg'
}: ProLockOverlayProps) {
    const { user } = useStore();

    if (user.tier === 'PRO') {
        return <>{children}</>;
    }

    return (
        <div className="relative overflow-hidden rounded-2xl" id="pro-paywall-snap">
            {/* Blurred Content */}
            <div className={`filter blur-${blurAmount} select-none pointer-events-none opacity-50`}>
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white/30 to-white/90 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                    <Crown className="text-white" size={24} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{title}</h3>

                <div className="space-y-3 mb-6 text-left max-w-xs mx-auto">
                    <div className="flex gap-2">
                        <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-[10px] text-green-600 font-bold">✓</span>
                        </div>
                        <p className="text-xs text-gray-700"><strong>Find Your Hidden Leaks:</strong> We catch weird spikes in your bills before they eat your wallet.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-[10px] text-green-600 font-bold">✓</span>
                        </div>
                        <p className="text-xs text-gray-700"><strong>Predict Your Future:</strong> Our AI forecasts your month-end balance. No more pokai last minute!</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-[10px] text-green-600 font-bold">✓</span>
                        </div>
                        <p className="text-xs text-gray-700"><strong>The RM 12.90 Hack:</strong> Pro users save over RM 100/mo via custom Savings Opportunities.</p>
                    </div>
                </div>

                <button
                    onClick={() => useStore.getState().upgradeToPro()}
                    className="w-full max-w-[280px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-full font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                    Unlock My Financial Freedom — RM 12.90
                </button>
            </div>
        </div>
    );
}
