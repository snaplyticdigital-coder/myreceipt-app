
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { ChevronLeft, Copy, Users, Crown, Zap, Gift } from 'lucide-react';
import { SectionHeader } from '../components/ui/section-header';

export function ReferralPage() {
    const navigate = useNavigate();
    const { user, simulateReferralSuccess } = useStore();
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(user.referralCode || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const referrals = user.referralsCount || 0;
    const daysEarned = (Math.min(referrals, 3) * 7) + (Math.max(0, referrals - 3) * 2);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header - Non-sticky with SafeArea padding */}
            <div className="bg-white p-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Refer & Earn</h1>
            </div>

            <div className="p-5 space-y-6">

                {/* Hero Illustration Placeholder */}
                <div className="flex justify-center py-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 rounded-full"></div>
                        <Gift size={80} className="text-indigo-500 relative z-10 animate-bounce-slow" strokeWidth={1} />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Refer to get Pro</h2>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                        Share your referral code. You both get <span className="text-indigo-600 font-bold">7 Days Pro</span> once your friend signs up!
                    </p>
                </div>

                {/* Referral Code Box */}
                <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-2 pl-4 flex items-center justify-between shadow-sm">
                    <span className="font-mono text-xl font-bold text-indigo-700 tracking-widest">
                        {user.referralCode || 'DTX8827'}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={copyCode}
                            className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                            {copied ? <span className="text-xs font-bold">Copied!</span> : <Copy size={20} />}
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">
                            Share
                        </button>
                    </div>
                </div>

                {/* Tracking UI */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <SectionHeader title="Your Referrals" icon={<Users />} className="mb-4" />

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <Users size={20} className="mx-auto text-gray-400 mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{referrals}</div>
                            <div className="text-xs text-gray-500 font-medium">Friends Joined</div>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <Crown size={20} className="mx-auto text-indigo-400 mb-2" />
                            <div className="text-2xl font-bold text-indigo-700">+{daysEarned}</div>
                            <div className="text-xs text-indigo-600 font-medium">Days Earned</div>
                        </div>
                    </div>

                    {/* Sim Button (Hidden feature styled as debug/dev tool or primary action for this demo) */}
                    <button
                        onClick={() => simulateReferralSuccess()}
                        className="w-full py-3 border border-indigo-200 text-indigo-600 font-semibold rounded-xl text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap size={16} />
                        Simulate New Signup
                    </button>
                </div>

                {/* Tier Explanation */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 ml-1">Rewards Logic</h3>

                    <div className={`p-4 rounded-xl border transition-colors ${referrals < 4 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Tier 1 (1-3 Friends)</p>
                                <p className="text-xs text-gray-500">You both get <span className="font-bold text-blue-600">7 Days Pro</span></p>
                            </div>
                            {referrals < 4 && <span className="ml-auto text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm">ACTIVE</span>}
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border transition-colors ${referrals >= 4 ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">2</div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Tier 2 (4+ Friends)</p>
                                <p className="text-xs text-gray-500">You get <span className="font-bold text-purple-600">2 Days</span>, They get 7 Days</p>
                            </div>
                            {referrals >= 4 && <span className="ml-auto text-xs font-bold text-purple-600 bg-white px-2 py-1 rounded-full shadow-sm">ACTIVE</span>}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6 pb-4">
                    Referrals terms and conditions apply. Max rewards capped at management discretion.
                </p>
            </div>
        </div>
    );
}
