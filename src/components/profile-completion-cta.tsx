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
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100/80 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-bl-full -mr-6 -mt-6" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <UserCircle2 size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900">Complete Your Profile</h3>
                                <ChevronRight size={16} className="text-gray-400" />
                            </div>
                            <p className="text-[10px] text-gray-500">{completionHint}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${profileCompletion.percentage}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-gray-600">{profileCompletion.percentage}%</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
