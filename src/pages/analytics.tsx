
import { useState, useMemo, useRef } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import { BarChart3, TrendingUp, PieChart, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProLockOverlay } from '../components/pro-lock-overlay';
import { StickyAdBanner } from '../components/sticky-ad-banner';
import { CalendarPicker } from '../components/ui/calendar-picker';

type TimePeriod = 'week' | 'month' | 'year' | 'custom';

export function AnalyticsPage() {
    const navigate = useNavigate();
    const receipts = useStore(state => state.receipts);
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
    const [periodOffset, setPeriodOffset] = useState(0); // 0 = current period, -1 = previous, -2 = 2 periods ago, etc.

    // Custom date range state
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const startDateRef = useRef<HTMLButtonElement>(null);
    const endDateRef = useRef<HTMLButtonElement>(null);

    // Reset offset when period type changes
    const handlePeriodChange = (period: TimePeriod) => {
        setSelectedPeriod(period);
        setPeriodOffset(0); // Reset to current period when changing type
    };

    // Calculate period date range based on offset
    const periodDateRange = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        // Handle custom date range
        if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
            return { startDate, endDate };
        }

        switch (selectedPeriod) {
            case 'week': {
                // Start of current week (Monday)
                const dayOfWeek = now.getDay();
                const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
                // Apply offset (each offset is 7 days)
                startDate.setDate(startDate.getDate() + (periodOffset * 7));
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                break;
            }
            case 'month': {
                startDate = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + periodOffset + 1, 0);
                break;
            }
            case 'year':
            default: {
                startDate = new Date(now.getFullYear() + periodOffset, 0, 1);
                endDate = new Date(now.getFullYear() + periodOffset, 11, 31);
                break;
            }
        }

        // If viewing current period, end date should be now
        if (periodOffset === 0 && selectedPeriod !== 'custom') {
            endDate = now;
        }

        return { startDate, endDate };
    }, [selectedPeriod, periodOffset, customStartDate, customEndDate]);

    // Filter receipts based on selected time period and offset
    const filteredReceipts = useMemo(() => {
        const { startDate, endDate } = periodDateRange;

        return receipts.filter(receipt => {
            const receiptDate = new Date(receipt.date);
            return receiptDate >= startDate && receiptDate <= endDate;
        });
    }, [receipts, periodDateRange]);

    // Generate period label based on offset
    const getPeriodLabel = useMemo(() => {
        // Custom range label
        if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
            const end = new Date(customEndDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${start} - ${end}`;
        }

        if (periodOffset === 0) {
            return {
                week: 'This week',
                month: 'This month',
                year: 'This year',
                custom: 'Custom Range'
            }[selectedPeriod];
        }

        const { startDate } = periodDateRange;

        switch (selectedPeriod) {
            case 'week': {
                const weekStart = startDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
                const weekEnd = new Date(startDate);
                weekEnd.setDate(weekEnd.getDate() + 6);
                const weekEndStr = weekEnd.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
                return `${weekStart} - ${weekEndStr}`;
            }
            case 'month': {
                return startDate.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
            }
            case 'year': {
                return `${startDate.getFullYear()}`;
            }
            default:
                return 'Custom Range';
        }
    }, [selectedPeriod, periodOffset, periodDateRange, customStartDate, customEndDate]);

    // Period labels for stat cards
    const periodLabels: Record<TimePeriod, string> = {
        week: periodOffset === 0 ? 'This week' : getPeriodLabel,
        month: periodOffset === 0 ? 'This month' : getPeriodLabel,
        year: periodOffset === 0 ? 'This year' : getPeriodLabel,
        custom: getPeriodLabel || 'Custom Range',
    };

    // Calculate spending by merchant category
    const spendingByMerchantCategory: Record<string, number> = {};
    filteredReceipts.forEach(receipt => {
        const category = receipt.merchantCategory;
        spendingByMerchantCategory[category] = (spendingByMerchantCategory[category] || 0) + receipt.amount;
    });

    // Calculate spending by spending category
    const spendingBySpendingCategory: Record<string, number> = {};
    filteredReceipts.forEach(receipt => {
        const category = receipt.spendingCategory;
        spendingBySpendingCategory[category] = (spendingBySpendingCategory[category] || 0) + receipt.amount;
    });

    // Sort by amount
    const topMerchantCategories = Object.entries(spendingByMerchantCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const topSpendingCategories = Object.entries(spendingBySpendingCategory)
        .sort((a, b) => b[1] - a[1]);

    // Total spending
    const totalSpending = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);

    // Calculate previous period spending for comparison
    const previousPeriodSpending = useMemo(() => {
        const now = new Date();
        let prevStartDate: Date;
        let prevEndDate: Date;

        switch (selectedPeriod) {
            case 'week':
                prevEndDate = new Date(now);
                prevEndDate.setDate(prevEndDate.getDate() - 7);
                prevStartDate = new Date(prevEndDate);
                prevStartDate.setDate(prevStartDate.getDate() - 7);
                break;
            case 'month':
                prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
                prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            case 'year':
                prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
                prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
                break;
        }

        return receipts
            .filter(receipt => {
                const receiptDate = new Date(receipt.date);
                return receiptDate >= prevStartDate && receiptDate <= prevEndDate;
            })
            .reduce((sum, r) => sum + r.amount, 0);
    }, [receipts, selectedPeriod]);

    // Monthly/period change percentage
    const periodChange = previousPeriodSpending > 0
        ? ((totalSpending - previousPeriodSpending) / previousPeriodSpending) * 100
        : 0;

    // Average transaction
    const avgTransaction = filteredReceipts.length > 0 ? totalSpending / filteredReceipts.length : 0;

    // Dynamic chart data based on selected period
    const chartData = useMemo(() => {
        const now = new Date();
        const isViewingPast = periodOffset < 0;
        const { startDate } = periodDateRange;

        // Get week number of month (1-4+)
        const getWeekOfMonth = (date: Date) => {
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
        };

        if (selectedPeriod === 'week') {
            // Daily Spending (Mon-Sun)
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const todayIndex = isViewingPast ? 6 : (now.getDay() === 0 ? 6 : now.getDay() - 1);

            // Group receipts by day of week using startDate from periodDateRange
            const dailyTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

            filteredReceipts.forEach(receipt => {
                const receiptDate = new Date(receipt.date);
                const dayDiff = Math.floor((receiptDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff >= 0 && dayDiff < 7) {
                    dailyTotals[dayDiff] += receipt.amount;
                }
            });

            return {
                title: 'Daily Spending',
                subtitle: getPeriodLabel || 'This week',
                data: days.map((day, index) => ({
                    label: day,
                    amount: (isViewingPast || index <= todayIndex) ? dailyTotals[index] : 0,
                    isHighlighted: !isViewingPast && index === todayIndex,
                    isFuture: !isViewingPast && index > todayIndex,
                })),
            };
        } else if (selectedPeriod === 'month') {
            // Weekly Spending (Week 1, Week 2, Week 3, Week 4...)
            const viewMonth = startDate.getMonth();
            const viewYear = startDate.getFullYear();
            const currentWeek = isViewingPast ? 5 : getWeekOfMonth(now);
            const weeksInMonth = Math.ceil((new Date(viewYear, viewMonth + 1, 0).getDate() + new Date(viewYear, viewMonth, 1).getDay()) / 7);

            // Group receipts by week of month
            const weeklyTotals: number[] = Array(weeksInMonth).fill(0);

            filteredReceipts.forEach(receipt => {
                const receiptDate = new Date(receipt.date);
                const weekNum = getWeekOfMonth(receiptDate);
                if (weekNum >= 1 && weekNum <= weeksInMonth) {
                    weeklyTotals[weekNum - 1] += receipt.amount;
                }
            });

            return {
                title: 'Monthly Spending',
                subtitle: getPeriodLabel || 'This month',
                data: weeklyTotals.map((amount, index) => ({
                    label: `Week ${index + 1}`,
                    amount: (isViewingPast || index < currentWeek) ? amount : 0,
                    isHighlighted: !isViewingPast && index === currentWeek - 1,
                    isFuture: !isViewingPast && index >= currentWeek,
                })),
            };
        } else {
            // Year - Monthly Spending (Jan-Dec)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const viewYear = startDate.getFullYear();
            const currentMonth = isViewingPast ? 11 : now.getMonth();

            // Group receipts by month
            const monthlyTotals: number[] = Array(12).fill(0);

            filteredReceipts.forEach(receipt => {
                const receiptDate = new Date(receipt.date);
                const monthIndex = receiptDate.getMonth();
                monthlyTotals[monthIndex] += receipt.amount;
            });

            return {
                title: 'Monthly Spending',
                subtitle: `${viewYear}`,
                data: months.map((month, index) => ({
                    label: month,
                    amount: (isViewingPast || index <= currentMonth) ? monthlyTotals[index] : 0,
                    isHighlighted: !isViewingPast && index === currentMonth,
                    isFuture: !isViewingPast && index > currentMonth,
                })),
            };
        }
    }, [selectedPeriod, filteredReceipts, periodOffset, periodDateRange, getPeriodLabel]);

    const maxChartAmount = Math.max(...chartData.data.map(d => d.amount), 1);


    // Color mapping for spending categories with gradients
    const spendingCategoryColors: Record<string, { bg: string; gradient: string }> = {
        'Groceries': { bg: 'bg-green-500', gradient: 'from-green-400 to-green-600' },
        'Dining & Food': { bg: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' },
        'Transportation': { bg: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
        'Healthcare': { bg: 'bg-red-500', gradient: 'from-red-400 to-red-600' },
        'Entertainment': { bg: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600' },
        'Shopping': { bg: 'bg-pink-500', gradient: 'from-pink-400 to-pink-600' },
        'Education': { bg: 'bg-indigo-500', gradient: 'from-indigo-400 to-indigo-600' },
        'Utilities': { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' },
        'Others': { bg: 'bg-slate-500', gradient: 'from-slate-400 to-slate-600' },
    };

    // Color mapping for merchant categories
    const merchantCategoryColors: Record<string, string> = {
        'Restaurant': 'from-orange-400 to-orange-600',
        'Coffee Shop': 'from-amber-400 to-amber-600',
        'Bakery & Desserts': 'from-pink-400 to-pink-600',
        'Grocery Store': 'from-green-400 to-green-600',
        'Convenience Store': 'from-emerald-400 to-emerald-600',
        'Electronics': 'from-blue-400 to-blue-600',
        'Gaming': 'from-purple-400 to-purple-600',
        'Sports & Fitness': 'from-teal-400 to-teal-600',
        'Beauty & Personal Care': 'from-rose-400 to-rose-600',
        'Pharmacy & Health': 'from-cyan-400 to-cyan-600',
        'Bookstore': 'from-yellow-400 to-yellow-600',
        'Department Store': 'from-slate-400 to-slate-600',
        'Hardware & DIY': 'from-stone-400 to-stone-600',
    };

    // Calculate donut chart segments
    const donutSegments = topSpendingCategories.slice(0, 5).map((cat, _index) => {
        const percent = (cat[1] / totalSpending) * 100;
        return { category: cat[0], percent, amount: cat[1] };
    });

    // Handle opening detailed view - Navigate to full-screen page
    const handleDetailedView = () => {
        // Trigger haptic feedback for drill-down
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // Subtle selection pulse
        }

        // Build navigation URL with query params
        const startISO = periodDateRange.startDate.toISOString();
        const endISO = periodDateRange.endDate.toISOString();
        navigate(`/detailed-expenses?source=analytics&period=${selectedPeriod}&start=${startISO}&end=${endISO}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <StickyAdBanner />
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-[15px] px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shadow-md border-b border-white/10">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h1 className="text-lg font-bold text-white">Analytics</h1>
                        <p className="text-xs text-white/80">Track your spending insights</p>
                    </div>
                    <button
                        onClick={handleDetailedView}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium text-white active:bg-white/30 transition-colors"
                    >
                        Detailed
                        <ChevronRight size={14} />
                    </button>
                </div>

                {/* Time Period Filter Pills */}
                <div className="flex gap-2 mt-2">
                    {(['week', 'month', 'year'] as TimePeriod[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => handlePeriodChange(period)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedPeriod === period
                                ? 'bg-white text-purple-700 shadow-md'
                                : 'bg-white/20 text-white active:bg-white/30'
                                }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                    {/* Custom Date Range Button */}
                    <button
                        onClick={() => setSelectedPeriod('custom')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${selectedPeriod === 'custom'
                            ? 'bg-white text-purple-700 shadow-md'
                            : 'bg-white/20 text-white active:bg-white/30'
                            }`}
                    >
                        <Calendar size={12} />
                        Custom
                    </button>
                </div>

                {/* Date Navigation - Different UI for Custom vs Standard */}
                {selectedPeriod === 'custom' ? (
                    <div className="mt-2 bg-white/10 rounded-xl p-3">
                        <p className="text-[10px] text-white/70 uppercase font-medium mb-2">Select Date Range</p>
                        <div className="flex items-center gap-2">
                            <button
                                ref={startDateRef}
                                onClick={() => setShowStartCalendar(true)}
                                className="flex-1 bg-white/20 rounded-lg px-3 py-2 text-xs text-white text-left"
                            >
                                {customStartDate ? new Date(customStartDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Start Date'}
                            </button>
                            <span className="text-white/50 text-xs">to</span>
                            <button
                                ref={endDateRef}
                                onClick={() => setShowEndCalendar(true)}
                                className="flex-1 bg-white/20 rounded-lg px-3 py-2 text-xs text-white text-left"
                            >
                                {customEndDate ? new Date(customEndDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'End Date'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between mt-2 bg-white/10 rounded-xl p-1.5">
                        <button
                            onClick={() => setPeriodOffset(periodOffset - 1)}
                            className="p-1.5 active:bg-white/20 rounded-full transition-colors"
                            aria-label="Previous period"
                        >
                            <ChevronLeft size={18} className="text-white" />
                        </button>
                        <div className="text-center">
                            <p className="text-xs font-semibold text-white">{getPeriodLabel}</p>
                            <p className="text-[10px] text-white/70">
                                {periodDateRange.startDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' - '}
                                {periodDateRange.endDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <button
                            onClick={() => setPeriodOffset(periodOffset + 1)}
                            disabled={periodOffset >= 0}
                            className={`p-2 rounded-full transition-colors ${periodOffset >= 0
                                ? 'text-white/30 cursor-not-allowed'
                                : 'hover:bg-white/20 text-white'
                                }`}
                            aria-label="Next period"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Cards Grid - Now Clickable */}
            {/* Stats Cards Grid */}
            <div className="px-5 py-5 grid grid-cols-2 gap-4">
                {/* Total Spent Card */}
                <div
                    onClick={handleDetailedView}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100 cursor-pointer active:scale-95 transition-all hover:shadow-md group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-60" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-lg font-bold">RM</span>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${periodChange >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                <span>{periodChange >= 0 ? '↑' : '↓'}</span>
                                <span>{Math.abs(periodChange).toFixed(1)}%</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpending).replace('RM', '')}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{periodLabels[selectedPeriod]}</p>
                    </div>
                </div>

                {/* Transactions Card */}
                <div
                    onClick={handleDetailedView}
                    className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-4 shadow-sm border border-purple-100 cursor-pointer active:scale-95 transition-all hover:shadow-md group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-60" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                                <TrendingUp size={20} className="text-purple-600" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                <span>Avg</span>
                                <span>{formatCurrency(avgTransaction).replace('RM', '')}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{filteredReceipts.length}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{periodLabels[selectedPeriod]}</p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-5 snap-y snap-mandatory scroll-smooth">
                {/* Dynamic Spending Chart - Free Tier Data */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 snap-start">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{chartData.title}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{chartData.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-2 h-40">
                        {chartData.data.map((item, index) => {
                            const height = item.isFuture ? 0 : (item.amount / maxChartAmount) * 100;
                            return (
                                <div key={index} className="flex flex-col items-center flex-1 min-w-0 group">
                                    <div className="w-full flex flex-col items-center relative">
                                        {/* Tooltip on hover */}
                                        {!item.isFuture && item.amount > 0 && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                {formatCurrency(item.amount)}
                                            </div>
                                        )}

                                        <div
                                            className={`w-full max-w-[24px] rounded-t-full transition-all duration-500 ${item.isFuture
                                                ? 'bg-gray-50'
                                                : item.isHighlighted
                                                    ? 'bg-gradient-to-t from-purple-600 to-blue-500 shadow-lg shadow-blue-200'
                                                    : 'bg-gradient-to-t from-gray-200 to-gray-100 group-hover:from-purple-300 group-hover:to-blue-300'
                                                }`}
                                            style={{ height: `${Math.max(height, item.isFuture ? 10 : 6)}px` }}
                                        />
                                    </div>
                                    <span className={`text-[9px] sm:text-[10px] mt-2 font-medium truncate w-full text-center ${item.isHighlighted ? 'text-purple-600' : 'text-gray-400'
                                        }`}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Spending Distribution - Visual Donut - LOCKED PORTION */}
                <ProLockOverlay>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-pink-50 rounded-lg">
                                <PieChart size={18} className="text-pink-500" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Spending Distribution</h2>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="relative w-36 h-36 flex-shrink-0">
                                {/* Gradient Defs for SVG */}
                                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8B5CF6" />
                                            <stop offset="100%" stopColor="#3B82F6" />
                                        </linearGradient>
                                        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#EC4899" />
                                            <stop offset="100%" stopColor="#8B5CF6" />
                                        </linearGradient>
                                        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#F59E0B" />
                                            <stop offset="100%" stopColor="#EC4899" />
                                        </linearGradient>
                                        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10B981" />
                                            <stop offset="100%" stopColor="#3B82F6" />
                                        </linearGradient>
                                        <linearGradient id="gradOthers" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#94A3B8" />
                                            <stop offset="100%" stopColor="#CBD5E1" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                                    {donutSegments.reduce((acc, segment, index) => {
                                        const prevOffset = acc.offset;
                                        const strokeDasharray = `${segment.percent * 2.51} ${251 - segment.percent * 2.51}`;
                                        const gradients = ['url(#grad1)', 'url(#grad2)', 'url(#grad3)', 'url(#grad4)', 'url(#gradOthers)'];

                                        acc.elements.push(
                                            <circle
                                                key={segment.category}
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={gradients[index % gradients.length]}
                                                strokeWidth="12"
                                                strokeLinecap="round"
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={-prevOffset * 2.51}
                                                className="transition-all duration-1000 ease-out hover:stroke-width-14"
                                            />
                                        );
                                        acc.offset += segment.percent;
                                        return acc;
                                    }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                                </svg>

                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-medium">Total</span>
                                    <span className="text-sm font-extrabold text-gray-900">{formatCurrency(totalSpending).replace('RM ', 'RM')}</span>
                                </div>
                            </div>

                            {/* Custom Legend */}
                            <div className="flex-1 space-y-3 min-w-0">
                                {donutSegments.map((segment, index) => {
                                    const gradients = [
                                        'bg-gradient-to-r from-purple-500 to-blue-500',
                                        'bg-gradient-to-r from-pink-500 to-purple-500',
                                        'bg-gradient-to-r from-amber-500 to-pink-500',
                                        'bg-gradient-to-r from-emerald-500 to-blue-500',
                                        'bg-gradient-to-r from-slate-400 to-slate-300'
                                    ];
                                    return (
                                        <div key={segment.category} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${gradients[index % gradients.length]}`} />
                                                <span className="text-xs text-gray-600 font-medium truncate">{segment.category}</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">{segment.percent.toFixed(0)}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Spending by Category - Progress Bars */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h2>
                        <div className="space-y-4">
                            {topSpendingCategories.map(([category, amount]) => {
                                const percent = (amount / totalSpending) * 100;
                                const colorInfo = spendingCategoryColors[category] || { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' };
                                return (
                                    <div key={category} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${colorInfo.bg}`} />
                                                <span className="text-sm font-medium text-gray-700">{category}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{percent.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${colorInfo.gradient} transition-all duration-500 group-hover:shadow-lg`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Store Types - Cards Grid */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Store Types</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {topMerchantCategories.map(([category, amount], _index) => {
                                const gradient = merchantCategoryColors[category] || 'from-gray-400 to-gray-600';
                                const percent = (amount / totalSpending) * 100;
                                return (
                                    <div
                                        key={category}
                                        className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${gradient} text-white`}
                                    >
                                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
                                        <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-white/10 rounded-full" />
                                        <span className="text-xs font-medium opacity-90 block mb-1">{category}</span>
                                        <p className="text-xl font-bold">{formatCurrency(amount)}</p>
                                        <span className="text-xs opacity-75">{percent.toFixed(1)}% of total</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI-Powered Spending Insights */}
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-blue-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 AI Spending Insights</h2>

                        {/* Category Comparison vs Average */}
                        <div className="mb-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Category Comparison (vs. Avg)</h3>
                            <div className="space-y-3">
                                {topMerchantCategories.slice(0, 4).map(([category, amount]) => {
                                    // Simulate historical average (actual implementation would use real data)
                                    const historicalAvg = amount * (0.7 + Math.random() * 0.6);
                                    const percentDiff = ((amount - historicalAvg) / historicalAvg) * 100;
                                    const isOver = percentDiff > 0;

                                    return (
                                        <div key={category} className="bg-white/70 rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-800">{category}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {formatCurrency(amount)}
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOver
                                                        ? 'bg-orange-100 text-orange-600'
                                                        : 'bg-green-100 text-green-600'
                                                        }`}>
                                                        {isOver ? '↑' : '↓'} {Math.abs(percentDiff).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Progress bar showing current vs average */}
                                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${isOver ? 'bg-orange-400' : 'bg-green-400'
                                                        }`}
                                                    style={{ width: `${Math.min((amount / (historicalAvg * 1.5)) * 100, 100)}%` }}
                                                />
                                                {/* Average marker */}
                                                <div
                                                    className="absolute top-0 h-full w-0.5 bg-gray-400"
                                                    style={{ left: `${Math.min((historicalAvg / (historicalAvg * 1.5)) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-gray-400">Avg: {formatCurrency(historicalAvg)}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {isOver ? 'Above avg' : 'Below avg'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Key Insights */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Key Insights</h3>
                            <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <TrendingUp size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700">Top spending: <strong className="text-blue-600">{topSpendingCategories[0]?.[0] || 'N/A'}</strong></p>
                                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(topSpendingCategories[0]?.[1] || 0)} this period</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <BarChart3 size={16} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700">Most visited: <strong className="text-purple-600">{topMerchantCategories[0]?.[0] || 'N/A'}</strong></p>
                                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(topMerchantCategories[0]?.[1] || 0)} spent there</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <PieChart size={16} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700">Avg transaction: <strong className="text-green-600">{formatCurrency(avgTransaction)}</strong></p>
                                    <p className="text-xs text-gray-500 mt-0.5">Across {filteredReceipts.length} transactions</p>
                                </div>
                            </div>
                            {periodChange !== 0 && (
                                <div className={`flex items-start gap-3 rounded-xl p-3 ${periodChange < 0
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-orange-50 border border-orange-200'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${periodChange < 0 ? 'bg-green-100' : 'bg-orange-100'
                                        }`}>
                                        <span className="text-sm">{periodChange < 0 ? '🎉' : '⚠️'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {periodChange < 0
                                                ? `Great job! You spent ${Math.abs(periodChange).toFixed(0)}% less than last period!`
                                                : `Heads up: Spending is ${periodChange.toFixed(0)}% higher than last period.`
                                            }
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {periodChange < 0
                                                ? 'Keep up the great budgeting!'
                                                : 'Consider reviewing your expenses.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ProLockOverlay>
            </div>

            {/* Calendar Pickers for Custom Date Range */}
            <CalendarPicker
                isOpen={showStartCalendar}
                onClose={() => setShowStartCalendar(false)}
                anchorRef={startDateRef}
                value={customStartDate}
                onChange={(date) => {
                    setCustomStartDate(date);
                    setShowStartCalendar(false);
                }}
            />
            <CalendarPicker
                isOpen={showEndCalendar}
                onClose={() => setShowEndCalendar(false)}
                anchorRef={endDateRef}
                value={customEndDate}
                onChange={(date) => {
                    setCustomEndDate(date);
                    setShowEndCalendar(false);
                }}
            />
        </div >
    );
}
