
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar } from '../components/layout/app-bar';
import { useStore } from '../lib/store';
import { formatDistance } from 'date-fns';
import { Bell, CheckCheck, Settings, ChevronRight, Sparkles, AlertTriangle, TrendingUp, Flame, Target } from 'lucide-react';
import {
    generateWeeklySummary,
    generateMidweekReminder,
    type AINotification,
    type NotificationType
} from '../lib/notifications-ai';

export function NotificationsPage() {
    const { notifications, markNotificationAsRead, receipts, streak, goals, points, badges, weeklyBudget, dailyBudget } = useStore();
    const [showPreferences, setShowPreferences] = useState(false);
    const [aiNotifications, setAiNotifications] = useState<AINotification[]>([]);

    // Generate AI notifications
    useEffect(() => {
        const userState = { streak, goals, points, badges, weeklyBudget, dailyBudget };

        // Generate sample AI notifications for demo
        const weeklyNotif = generateWeeklySummary(receipts, userState);
        const midweekNotif = generateMidweekReminder(receipts, userState);

        const allAiNotifs: AINotification[] = [weeklyNotif];
        if (midweekNotif) allAiNotifs.push(midweekNotif);

        setAiNotifications(allAiNotifs);
    }, [receipts, streak, goals, points, badges, weeklyBudget, dailyBudget]);

    const handleMarkAsRead = (id: string) => {
        markNotificationAsRead(id);
    };

    const getNotificationIcon = (type: 'info' | 'warning' | 'success' | string) => {
        const iconMap: Record<string, React.ReactNode> = {
            info: <Bell size={20} className="text-blue-500" />,
            warning: <AlertTriangle size={20} className="text-orange-500" />,
            success: <CheckCheck size={20} className="text-green-500" />,
            weekly_summary: <Sparkles size={20} className="text-purple-500" />,
            midweek_reminder: <TrendingUp size={20} className="text-blue-500" />,
            anomaly_alert: <AlertTriangle size={20} className="text-red-500" />,
            streak_celebration: <Flame size={20} className="text-orange-500" />,
            goal_reached: <Target size={20} className="text-green-500" />,
        };
        return iconMap[type] || <Bell size={20} className="text-gray-500" />;
    };

    const getNotificationBgColor = (type: NotificationType | string, read: boolean) => {
        if (read) return 'bg-gray-50';

        const colorMap: Record<string, string> = {
            weekly_summary: 'bg-purple-50 border-purple-200',
            midweek_reminder: 'bg-blue-50 border-blue-200',
            anomaly_alert: 'bg-red-50 border-red-200',
            streak_celebration: 'bg-orange-50 border-orange-200',
            goal_reached: 'bg-green-50 border-green-200',
            budget_warning: 'bg-yellow-50 border-yellow-200',
        };
        return colorMap[type] || 'bg-blue-50 border-blue-200';
    };

    // Combine and sort all notifications
    const allNotifications = useMemo(() => {
        const combined = [
            ...notifications.map(n => ({
                id: n.id,
                type: n.type as NotificationType,
                title: n.type === 'info' ? 'Info' : n.type === 'warning' ? 'Warning' : 'Success',
                message: n.message,
                emoji: '',
                priority: 'medium' as const,
                read: n.read,
                createdAt: n.timestamp,
            })),
            ...aiNotifications,
        ];

        return combined.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [notifications, aiNotifications]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppBar title="Notifications" />

            <div className="p-4 space-y-4">
                {/* AI Insights Header */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-3 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold">AI-Powered Alerts</h2>
                                <p className="text-sm text-white/80">Smart notifications based on your spending</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPreferences(!showPreferences)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Preferences Panel */}
                {showPreferences && (
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3">Notification Preferences</h3>
                        <div className="space-y-3">
                            {[
                                { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Sunday recap of your spending' },
                                { key: 'midweekReminder', label: 'Midweek Reminder', desc: 'Budget check on Wednesdays' },
                                { key: 'anomalyAlerts', label: 'Unusual Transactions', desc: 'Alert for unexpected charges' },
                                { key: 'streakCelebrations', label: 'Streak Celebrations', desc: 'Celebrate budget streaks' },
                            ].map(pref => (
                                <div key={pref.key} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                                        <p className="text-xs text-gray-500">{pref.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notifications List */}
                {allNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl text-center py-12 shadow-sm">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-2">We'll notify you about important spending insights</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {allNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl p-3 shadow-sm border transition-all ${getNotificationBgColor(notification.type, notification.read)
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                                        }`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {'title' in notification && (
                                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                                {notification.title}
                                            </p>
                                        )}
                                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-xs text-gray-400">
                                                {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                                            </p>
                                            {'actionUrl' in notification && notification.actionUrl && (
                                                <Link
                                                    to={notification.actionUrl}
                                                    className="text-xs font-medium text-blue-600 flex items-center gap-1"
                                                >
                                                    View details <ChevronRight size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                            aria-label="Mark as read"
                                        >
                                            <CheckCheck size={18} className="text-blue-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
