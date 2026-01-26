import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

export function UsageBar() {
    const { user } = useStore();
    const limit = 10; // Base limit, but user can have more
    const remaining = user.scansRemaining !== undefined ? user.scansRemaining : 10;

    // Calculate percentage based on a dynamic "max" if they have > 10?
    // Visual bar should probably just show 10 as baseline.
    // If remaining > 10, show full bar or >100%?
    // Let's Cap visual at 100% and show text.

    // Note: If remaining is 13, (10-13)/10 = -0.3 -> 0% used? 
    // Wait, UsageBar typically shows "Usage". 
    // If I have 13 keys, I have 0 usage relative to my "Boosted" limit?
    // Let's simplisticly show "Remaining / 10" inversed.
    // If remaining = 10, used = 0.
    // If remaining = 3, used = 7.
    // If remaining = 13, used = 0 (visual).

    const visualUsed = Math.max(0, limit - remaining);
    const visualPercent = Math.min(100, (visualUsed / limit) * 100);

    return (
        <div className="px-5 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Background decorative gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent opacity-50 rounded-bl-full -mr-4 -mt-4" />

                <div className="flex justify-between items-end mb-2 relative z-10">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Monthly Scans</h3>
                        <p className="text-xs text-gray-500">
                            {remaining <= 0
                                ? "Limit reached. Watch ad to extend."
                                : `${remaining} scan${remaining !== 1 ? 's' : ''} remaining`
                            }
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`text-lg font-bold ${remaining <= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                            {remaining}
                        </span>
                        <span className="text-gray-400 text-sm font-medium"> left</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${remaining <= 0 ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                        style={{ width: `${visualPercent}%` }}
                    />
                </div>

                {/* Upgrade Nudge */}
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Resets {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    <Link to="/profile" className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full hover:bg-purple-100 transition-colors">
                        <Crown size={10} />
                        GO PRO
                    </Link>
                </div>
            </div>
        </div>
    );
}
