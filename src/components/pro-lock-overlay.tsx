import { Crown } from 'lucide-react';
import { useStore } from '../lib/store';


interface ProLockOverlayProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    blurAmount?: 'sm' | 'md' | 'lg' | 'xl';
    align?: 'center' | 'top';
    variant?: 'default' | 'analytics' | 'tax';
}

export function ProLockOverlay({
    children,
    title = "Stop Losing Money, Start Saving Like a Pro!",
    description,
    blurAmount = 'lg',
    align = 'center',
    variant = 'analytics'
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
            <div className={`absolute inset-0 z-10 flex flex-col items-center ${align === 'center' ? 'justify-center' : 'justify-start pt-32'} p-6 text-center bg-gradient-to-b from-white/30 to-white/90 backdrop-blur-sm`}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                    <Crown className="text-white" size={24} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{title}</h3>

                {variant === 'default' && description && (
                    <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">
                        {description}
                    </p>
                )}

                {variant === 'analytics' && (
                    <div className="space-y-3 mb-6 text-left max-w-xs mx-auto">
                        <div className="flex gap-2">
                            <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                <span className="text-xs text-green-600 font-bold">✓</span>
                            </div>
                            <p className="text-xs text-gray-700"><strong>Find Your Hidden Leaks:</strong> We catch weird spikes in your bills before they eat your wallet.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                <span className="text-xs text-green-600 font-bold">✓</span>
                            </div>
                            <p className="text-xs text-gray-700"><strong>Predict Your Future:</strong> Our AI forecasts your month-end balance. No more pokai last minute!</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                <span className="text-xs text-green-600 font-bold">✓</span>
                            </div>
                            <p className="text-xs text-gray-700"><strong>The RM 12.90 Hack:</strong> Pro users save over RM 100/mo via custom Savings Opportunities.</p>
                        </div>
                    </div>
                )}

                {variant === 'tax' && (
                    <div className="space-y-3 mb-6 text-left max-w-xs mx-auto">
                        <div className="flex gap-2">
                            <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                <span className="text-xs text-green-600 font-bold">✓</span>
                            </div>
                            <p className="text-xs text-gray-700"><strong>Claim Every Sen:</strong> We find the receipts you missed so you get the biggest refund possible.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                <span className="text-xs text-green-600 font-bold">✓</span>
                            </div>
                            <p className="text-xs text-gray-700"><strong>Limit Tracking (Real-Time):</strong> Know exactly how much Lifestyle or Medical relief you have left. Don't lose it because you forgot to spend it.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                <span className="text-xs text-green-600 font-bold">✓</span>
                            </div>
                            <p className="text-xs text-gray-700"><strong>The RM 12.90 Hack:</strong> Pro users typically get back an extra RM 300 - RM 800 in refunds just by filling their relief categories correctly.</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => useStore.getState().upgradeToPro()}
                    className="w-full max-w-[280px] bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-full font-bold text-sm shadow-lg shadow-purple-200 active:scale-95 transition-all"
                >
                    {variant === 'tax' ? 'Unlock My Tax Savings — RM 12.90' : 'Unlock My Financial Freedom — RM 12.90'}
                </button>
            </div>
        </div>
    );
}
