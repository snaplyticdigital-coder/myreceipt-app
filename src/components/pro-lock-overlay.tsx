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
    title,
    description,
    blurAmount = 'lg'
}: ProLockOverlayProps) {
    const { user } = useStore();

    if (user.tier === 'PRO') {
        return <>{children}</>;
    }

    return (
        <div className="relative overflow-hidden rounded-2xl">
            {/* Blurred Content */}
            <div className={`filter blur-${blurAmount} select-none pointer-events-none opacity-50`}>
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white/30 to-white/90 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                    <Crown className="text-white" size={24} />
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight px-4">
                    {title || "Stop Losing Money, Start Saving Like a Pro!"}
                </h3>

                {description && (
                    <p className="text-xs text-gray-500 mb-4 px-6 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Prescriptive Benefits */}
                <div className="space-y-3 mb-8 text-left max-w-[280px]">
                    <div className="flex gap-2.5">
                        <div className="shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-[10px]">🔍</span>
                        </div>
                        <p className="text-[12px] font-medium text-gray-700 leading-snug">
                            <span className="font-extrabold text-gray-900 block">Find Your Hidden Leaks</span>
                            We catch weird spikes in your bills before they eat your wallet.
                        </p>
                    </div>
                    <div className="flex gap-2.5">
                        <div className="shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-[10px]">🔮</span>
                        </div>
                        <p className="text-[12px] font-medium text-gray-700 leading-snug">
                            <span className="font-extrabold text-gray-900 block">Predict Your Future</span>
                            Our AI forecasts your month-end balance. No more pokai last minute!
                        </p>
                    </div>
                    <div className="flex gap-2.5">
                        <div className="shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-[10px]">💡</span>
                        </div>
                        <p className="text-[12px] font-medium text-gray-700 leading-snug">
                            <span className="font-extrabold text-gray-900 block">The RM 12.90 Hack</span>
                            Most Pro users save over RM 100/mo by following our custom "Savings Opportunities".
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => useStore.getState().upgradeToPro()}
                    className="w-full max-w-[260px] bg-gradient-to-r from-gray-900 to-slate-800 text-white py-4 rounded-2xl font-black text-[14px] uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                    Unlock My Financial Freedom — RM 12.90
                </button>
            </div>
        </div>
    );
}
