import { X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../lib/store';


export function StickyAdBanner() {
    const { user } = useStore();
    const [isVisible, setIsVisible] = useState(true);

    if (user.tier === 'PRO' || !isVisible) return null;

    return (
        <div className="fixed bottom-[96px] left-5 right-5 z-40 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10 flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs font-bold text-white mb-1">Remove Ads & Unlock Pro</p>
                    <p className="text-xs text-gray-300">Get unlimited scans & analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => useStore.getState().upgradeToPro()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg active:scale-95 transition-transform"
                    >
                        Upgrade
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
