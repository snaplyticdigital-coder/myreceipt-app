import { useRef, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();
    const [currentChildren, setCurrentChildren] = useState(children);
    const [previousChildren, setPreviousChildren] = useState<ReactNode | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevKeyRef = useRef(location.key);

    useEffect(() => {
        if (location.key !== prevKeyRef.current) {
            // Route changed - start simultaneous transition
            setPreviousChildren(currentChildren);
            setCurrentChildren(children);
            setIsTransitioning(true);
            prevKeyRef.current = location.key;

            // Reset scroll position for new page
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) {
                scrollContainer.scrollTop = 0;
            }

            // Clear previous children after animation completes
            const timer = setTimeout(() => {
                setPreviousChildren(null);
                setIsTransitioning(false);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            // Same route, just update children
            setCurrentChildren(children);
        }
    }, [location.key, children]);

    return (
        <div className="page-transition-wrapper">
            {/* Outgoing page - animates to -30% with fade */}
            {previousChildren && isTransitioning && (
                <div className="page-exit">
                    {previousChildren}
                </div>
            )}

            {/* Incoming page - animates from 100% to 0% */}
            <div className={isTransitioning ? 'page-enter' : ''}>
                {currentChildren}
            </div>
        </div>
    );
}
