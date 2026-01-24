import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { TrendingUp, Wallet, Star, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

// Specialized Co-Pilot Card Component
interface CoPilotCardProps {
    type: 'progress' | 'habit' | 'budget';
    title: string;
    message: string;
    icon: React.ReactNode;
    color: string;
    href: string;
}

function CoPilotCard({ title, message, icon, color, href }: CoPilotCardProps) {
    return (
        <Link to={href} className={`block p-4 rounded-2xl border transition-all active:scale-[0.98] ${color} relative overflow-hidden group`}>
            {/* Soft decorative background orb */}
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-colors" />

            <div className="flex items-start gap-3 relative z-10">
                <div className="shrink-0 mt-0.5 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide opacity-80 mb-0.5">{title}</h3>
                    <p className="text-sm font-medium leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
            <div className="absolute bottom-3 right-3 text-current opacity-60">
                <ChevronRight size={16} />
            </div>
        </Link>
    );
}

export function CoPilotSection() {
    const { budget, getMonthTotal } = useStore();
    const budgetUsed = getMonthTotal();
    // In future, connect to user.goals or achievements state

    // 2. Calculate Habit Shift (Comparison)
    const savedAmount = useMemo(() => {
        // Compare current week to "same week last month" approx
        // Mocking a positive result "Syoknya! You jimat RM..."
        return 45.50;
    }, []);
    const topCategory = "Dining";

    // 3. Calculate Budget Guide (Runway)
    const daysLeftInMonth = useMemo(() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return lastDay.getDate() - now.getDate();
    }, []);

    // Remaining daily budget calculation
    const remainingBudget = Math.max(0, budget.total - budgetUsed);
    const dailyAllowable = daysLeftInMonth > 0 ? remainingBudget / daysLeftInMonth : 0;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-lg">🤖</span>
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Financial Co-Pilot</h2>
            </div>

            <div className="space-y-3">
                {/* Card 1: Progress Nudge */}
                <CoPilotCard
                    type="progress"
                    title="Achievement Unlock"
                    message="Sikit lagi boss! 🏅 You're 94% to 'Super Saver'. Upload 2 more receipts to unlock!"
                    icon={<Star size={16} className="text-amber-500" fill="currentColor" />}
                    color="bg-amber-50 border-amber-100 text-amber-900"
                    href="/achievements"
                />

                {/* Card 2: Habit Shift */}
                <CoPilotCard
                    type="habit"
                    title="Habit Shift"
                    message={`Syoknya! 🌟 You jimat ${formatCurrency(savedAmount)} on ${topCategory} compared to last month!`}
                    icon={<TrendingUp size={16} className="text-emerald-500" />}
                    color="bg-emerald-50 border-emerald-100 text-emerald-900"
                    href="/analytics"
                />

                {/* Card 3: Budget Guide */}
                <CoPilotCard
                    type="budget"
                    title="Budget Guide"
                    message={`Boleh Tahan! 👍 Your Dining budget can last another ${daysLeftInMonth} days. Keep it below ${formatCurrency(dailyAllowable)}/day k?`}
                    icon={<Wallet size={16} className="text-blue-500" />}
                    color="bg-blue-50 border-blue-100 text-blue-900"
                    href="/budget" // Assuming budget route exists or similar
                />
            </div>
        </div>
    );
}
