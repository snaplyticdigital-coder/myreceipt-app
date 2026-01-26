import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { TrendingUp, Wallet, Star, ChevronRight, Zap, Upload, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

// Specialized Co-Pilot Card Component with Unified Glassmorphism
interface CoPilotCardProps {
    type: 'progress' | 'habit' | 'budget';
    title: string;
    message: string;
    icon: React.ReactNode;
    glowClass: string;
    iconBgClass: string;
    href: string;
}

function CoPilotCard({ title, message, icon, glowClass, iconBgClass, href }: CoPilotCardProps) {
    return (
        <Link to={href} className={`block p-4 rounded-3xl glass-surface ${glowClass} transition-all active:scale-[0.97] group relative overflow-hidden premium-card-shadow`}>
            {/* Subtle Gradient Glow */}
            <div className={`absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${iconBgClass.replace('bg-', 'from-').replace('/90', '')} to-transparent blur-2xl`} />

            <div className="flex items-start gap-3.5 relative z-10">
                <div className={`shrink-0 p-2.5 ${iconBgClass} backdrop-blur-md rounded-2xl shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 leading-none">{title}</h3>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                        {message}
                    </p>
                </div>
                <div className="shrink-0 self-center opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight size={18} className="text-gray-400" />
                </div>
            </div>
        </Link>
    );
}

// Empty State Component for new users without transaction history
function CoPilotEmptyState() {
    return (
        <Link
            to="/add-receipt"
            className="block p-5 rounded-3xl glass-surface glass-glow-purple transition-all active:scale-[0.98] group relative overflow-hidden"
        >
            {/* Ghost Placeholder Illustration */}
            <div className="absolute top-4 right-4 opacity-10">
                <Sparkles size={64} className="text-purple-500" />
            </div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 p-3 bg-gradient-to-br from-purple-500 to-indigo-600 backdrop-blur-md rounded-2xl shadow-lg shadow-purple-200">
                    <Upload size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">
                        Hey boss, upload your transaction now! 📱
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        I need to <span className="font-semibold text-purple-600">kenal</span> your habit better before I can give solid advice lah.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                        <span>Upload First Receipt</span>
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function CoPilotSection() {
    const { budget, getMonthTotal, receipts } = useStore();
    const budgetUsed = getMonthTotal();

    // Check if user has any transactions
    const hasTransactions = receipts.length > 0;

    // 2. Calculate Habit Shift (Comparison)
    const savedAmount = useMemo(() => {
        return 45.50; // Mocked
    }, []);
    const topCategory = "Dining";

    // 3. Calculate Budget Guide (Runway)
    const daysLeftInMonth = useMemo(() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return lastDay.getDate() - now.getDate();
    }, []);

    const remainingBudget = Math.max(0, budget.total - budgetUsed);
    const dailyAllowable = daysLeftInMonth > 0 ? remainingBudget / daysLeftInMonth : 0;

    return (
        <div className="space-y-4 px-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200">
                        <Zap size={16} className="text-white" fill="currentColor" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800 tracking-tight">Financial Co-Pilot</h2>
                </div>
                <div className="px-2 py-0.5 bg-purple-100 rounded-md">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-tighter">AI Analysis</span>
                </div>
            </div>

            {/* Show Empty State or Insight Cards based on transaction history */}
            {!hasTransactions ? (
                <CoPilotEmptyState />
            ) : (
                <div className="grid grid-cols-1 gap-3.5">
                    {/* Card 1: Progress Nudge */}
                    <CoPilotCard
                        type="progress"
                        title="Unlock Perk"
                        message="Sikit lagi boss! 🏅 2 more receipts to reach 'Super Saver' status."
                        icon={<Star size={18} className="text-amber-500" fill="currentColor" />}
                        glowClass="glass-glow-amber"
                        iconBgClass="bg-amber-50/90"
                        href="/achievements"
                    />

                    {/* Card 2: Habit Shift */}
                    <CoPilotCard
                        type="habit"
                        title="Spending Shift"
                        message={`Jimat ${formatCurrency(savedAmount)} on ${topCategory} vs last month. Mantap! 🌟`}
                        icon={<TrendingUp size={18} className="text-emerald-500" />}
                        glowClass="glass-glow-emerald"
                        iconBgClass="bg-emerald-50/90"
                        href="/analytics"
                    />

                    {/* Card 3: Budget Guide */}
                    <CoPilotCard
                        type="budget"
                        title="Daily Runway"
                        message={`Dining limit: ${formatCurrency(dailyAllowable)}/day for the next ${daysLeftInMonth} days. Boleh? 👍`}
                        icon={<Wallet size={18} className="text-blue-500" />}
                        glowClass="glass-glow-blue"
                        iconBgClass="bg-blue-50/90"
                        href="/budget"
                    />
                </div>
            )}
        </div>
    );
}
