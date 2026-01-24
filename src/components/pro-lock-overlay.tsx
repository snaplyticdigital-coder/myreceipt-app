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
    title = "Unlock Advanced Insights",
    description = "Upgrade to Pro to view detailed analytics and unlimited history.",
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

                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-xs">{description}</p>

                <button
                    onClick={() => useStore.getState().upgradeToPro()}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                >
                    Upgrade to Pro
                </button>
                <div className="mt-4 text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                    RM12.90 / Month
                </div>
            </div>
        </div>
    );
}
