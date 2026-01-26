import { useState, useRef, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './bottom-nav';
import { PageTransition } from './page-transition';
import { AddTransactionModal } from '../modals/add-transaction-modal';
import { useBackButton } from '../../hooks/use-back-button';

import { PaywallModal } from '../modals/paywall-modal';
import { RewardSuccessModal } from '../modals/reward-success-modal';
import { TierCelebrationModal } from '../modals/tier-celebration-modal';
import { WelcomeBottomSheet } from '../modals/welcome-bottom-sheet';
import { useStore } from '../../lib/store';
import { useAuth } from '../../contexts/auth-context';
import { Toast } from '../ui/toast';

// Scroll position storage for tab persistence
const scrollPositions = new Map<string, number>();

export function AppLayout() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalInitialView, setModalInitialView] = useState<'scan' | 'import' | 'manual'>('manual');
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);

    const { user } = useStore();
    const { showWelcomeSheet, dismissWelcomeSheet, firebaseUser } = useAuth();
    const location = useLocation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevPathRef = useRef(location.pathname);

    useBackButton(isAddModalOpen, () => setIsAddModalOpen(false));

    // Scroll state preservation - runs BEFORE paint to prevent visual jump
    useLayoutEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const currentPath = location.pathname;
        const prevPath = prevPathRef.current;

        // Save scroll position of previous page
        if (prevPath !== currentPath) {
            scrollPositions.set(prevPath, scrollContainer.scrollTop);
        }

        // Restore scroll position for current page or reset to top
        const savedPosition = scrollPositions.get(currentPath);

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            if (savedPosition !== undefined) {
                scrollContainer.scrollTop = savedPosition;
            } else {
                // New page - instant scroll to top (no animation)
                scrollContainer.scrollTop = 0;
            }
        });

        prevPathRef.current = currentPath;
    }, [location.pathname]);

    const handleAddClick = (mode?: 'scan' | 'import' | 'manual') => {
        // Free Tier Limit Check
        const remaining = user.scansRemaining !== undefined ? user.scansRemaining : 10;

        if (user.tier === 'FREE' && remaining <= 0) {
            setIsPaywallOpen(true);
            return;
        }

        setModalInitialView(mode || 'manual');
        setIsAddModalOpen(true);
    };

    return (
        <div className="h-screen w-full bg-gray-50 overflow-hidden relative">
            <Toast />
            {/* Global Modals */}
            <RewardSuccessModal />
            <TierCelebrationModal />

            {/* Main Content Area */}
            <main className="w-full h-full relative">
                <div
                    ref={scrollContainerRef}
                    className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden pb-[calc(60px+env(safe-area-inset-bottom)+20px)] bg-gray-50"
                    style={{ scrollBehavior: 'auto' }} /* Disable smooth scroll for instant position changes */
                >
                    <div className="max-w-lg mx-auto min-h-full">
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation (Fixed on top) */}
            <BottomNav onAddClick={handleAddClick} />

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                initialView={modalInitialView}
            />
            <PaywallModal
                isOpen={isPaywallOpen}
                onClose={() => setIsPaywallOpen(false)}
            />

            {/* Welcome Bottom Sheet for New Users */}
            <WelcomeBottomSheet
                isOpen={showWelcomeSheet}
                onClose={dismissWelcomeSheet}
                userName={firebaseUser?.displayName || user.name}
                completionPercentage={20}
            />
        </div>
    );
}
