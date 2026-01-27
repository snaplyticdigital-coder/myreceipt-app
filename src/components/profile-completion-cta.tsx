import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useMemo } from 'react';
import { calculateProfileCompletion, getCompletionHint } from '../lib/profile-completion';
import { ChevronRight, UserCircle2 } from 'lucide-react';

export function ProfileCompletionCTA() {
    const user = useStore(state => state.user);

    const profileCompletion = useMemo(() => calculateProfileCompletion(user), [user]);
    const completionHint = useMemo(() => getCompletionHint(user), [user]);

    // Don't render if profile is complete
    if (profileCompletion.percentage >= 100) {
        return null;
    }

    return (
        <Link to="/profile" className="block">
            {/* Compact card: p-3 (12dp) padding for reduced vertical footprint */}
            <div className="glass-surface rounded-2xl p-3 premium-card-shadow relative overflow-hidden group transition-all active:scale-[0.98]">
                {/* Decorative gradient glow - smaller */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110 pointer-events-none" />

                <div className="relative z-10">
                    {/* Icon + Content Row - 40x40dp icon, 16dp gap, 8dp bottom margin */}
                    <div className="flex items-center gap-4 mb-2">
                        {/* Icon Container: 40x40dp, 12px radius - Co-Pilot standard */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform flex-shrink-0">
                            <UserCircle2 size={20} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                {/* 14pt Semi-Bold header */}
                                <h3 className="text-[14px] font-semibold text-gray-800 tracking-tight leading-tight">Complete Your Profile</h3>
                                <div className="p-0.5 rounded-full text-gray-400 group-hover:text-purple-500 transition-colors">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                            {/* 11pt Regular subtext */}
                            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">{completionHint}</p>
                        </div>
                    </div>

                    {/* Progress Bar Container - 6dp bar height, compact padding */}
                    <div className="flex items-center gap-2.5 bg-gray-50/60 px-2.5 py-1.5 rounded-xl border border-gray-100/50">
                        <div className="flex-1 h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_0_6px_rgba(59,130,246,0.3)] transition-all duration-700 ease-out"
                                style={{ width: `${profileCompletion.percentage}%` }}
                            />
                        </div>
                        {/* Percentage pill - vertically centered */}
                        <span className="text-[11px] font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded-md shadow-sm leading-none">{profileCompletion.percentage}%</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
