import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { useState } from 'react';

interface AppBarProps {
    title?: string;
    showMonthSelector?: boolean;
    children?: React.ReactNode;
}

export function AppBar({ title, showMonthSelector, children }: AppBarProps) {
    const notifications = useStore((state) => state.notifications);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const { triggerDemoLevelUp } = useStore();
    const [, setTapCount] = useState(0);

    const handleTitleTap = () => {
        setTapCount(prev => {
            if (prev + 1 === 3) {
                triggerDemoLevelUp();
                return 0;
            }
            return prev + 1;
        });
        setTimeout(() => setTapCount(0), 1000);
    };

    return (
        <header className="sticky top-0 bg-surface border-b border-color z-50">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex-1">
                    {title && (
                        <h1
                            className="text-lg font-semibold active:opacity-50 transition-opacity select-none"
                            onClick={handleTitleTap}
                        >
                            {title}
                        </h1>
                    )}
                    {showMonthSelector && children}
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/search"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Search"
                    >
                        <Search size={20} />
                    </Link>
                    <Link
                        to="/notifications"
                        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
