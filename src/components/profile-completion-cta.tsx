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
            <div className="glass-surface rounded-3xl p-4 premium-card-shadow relative overflow-hidden group transition-all active:scale-[0.98]">
                {/* Decorative gradient glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                <div className="relative z-10">
                    {/* Icon + Content Row - Standardized 40x40dp icon with 16dp gap */}
                    <div className="flex items-center gap-4 mb-3.5">
                        {/* Icon Container: 40x40dp, 12px radius, matching Co-Pilot standard */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform flex-shrink-0">
                            <UserCircle2 size={20} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-800 tracking-tight">Complete Your Profile</h3>
                                <div className="p-1 rounded-full bg-gray-50 text-gray-400 group-hover:text-purple-500 group-hover:bg-purple-50 transition-colors">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{completionHint}</p>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100/50">
                        <div className="flex-1 h-2 bg-gray-200/50 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-700 ease-out"
                                style={{ width: `${profileCompletion.percentage}%` }}
                            />
                        </div>
                        <span className="text-xs font-black text-gray-800 bg-white px-2 py-0.5 rounded-lg shadow-sm">{profileCompletion.percentage}%</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
