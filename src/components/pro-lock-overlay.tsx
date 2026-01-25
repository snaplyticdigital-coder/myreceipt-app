import { Crown, Check, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';


interface ProLockOverlayProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    blurAmount?: 'sm' | 'md' | 'lg' | 'xl';
    benefits?: string[];
}

export function ProLockOverlay({
    children,
    title = "Stop Losing Money, Start Saving Like a Pro!",
    description = "Join the top 10% of Malaysians reaching their financial goals faster.",
    blurAmount = 'lg'
}: ProLockOverlayProps) {
    const { user } = useStore();

    if (user.tier === 'PRO') {
        return <>{children}</>;
    }

    const prescriptions = [
        { title: "Find Your Hidden Leaks", detail: "We catch weird spikes in your bills before they eat your wallet." },
        { title: "Predict Your Future", detail: "Our AI forecasts your month-end balance. No more pokai last minute!" },
        { title: "The RM 12.90 Hack", detail: "Most Pro users save over RM 100/mo by following our custom 'Savings Opportunities'." }
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl group shadow-inner bg-white/50 scroll-mt-24" style={{ scrollSnapAlign: 'center' }}>
            {/* Blurred Content */}
            <div className={`filter blur-${blurAmount} select-none pointer-events-none opacity-40 scale-[1.02] transition-transform duration-700`}>
                {children}
            </div>

            {/* Lock Overlay - Raised Elevation & Visual Polish */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white/10 via-white/80 to-white backdrop-blur-[2.5px]">
                <div className="flex flex-col items-center transform -translate-y-24 scale-110">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-200" style={{ transform: 'rotate(3deg)' }}>
                        <Crown className="text-white drop-shadow-md" size={32} strokeWidth={2.5} />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight max-w-[300px] tracking-tight">{title}</h3>
                    <p className="text-sm font-semibold text-indigo-600 mb-8 uppercase tracking-widest">{description}</p>
                </div>

                {/* Prescriptive Benefits - Positioned relative to the raised head */}
                <div className="w-full max-w-sm space-y-4 mb-8 text-left transform -translate-y-16">
                    {prescriptions.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                            <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                                <Check size={12} className="text-blue-600" strokeWidth={3} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 leading-tight">{item.title}</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{item.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => useStore.getState().upgradeToPro()}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3"
                >
                    Unlock My Financial Freedom — RM 12.90
                    <ChevronRight size={18} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}
