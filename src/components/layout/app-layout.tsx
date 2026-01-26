import { useState, useRef, useEffect } from 'react';
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

export function AppLayout() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalInitialView, setModalInitialView] = useState<'scan' | 'import' | 'manual'>('manual');
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);

    const { user } = useStore();
    const { showWelcomeSheet, dismissWelcomeSheet, firebaseUser } = useAuth();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevPathRef = useRef(location.pathname);

    useBackButton(isAddModalOpen, () => setIsAddModalOpen(false));

    // Navigation stability fix: Reset scroll AFTER page transition animation completes
    // This prevents mid-transition vertical "jumps" when sliding between pages
    useEffect(() => {
        if (location.pathname !== prevPathRef.current) {
            prevPathRef.current = location.pathname;

            // Wait for page transition animation to complete (300ms) before resetting scroll
            // This ensures the outgoing page slides out smoothly without scroll interference
            const timer = setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0;
                }
            }, 310); // Slightly longer than 300ms animation to ensure completion

            return () => clearTimeout(timer);
        }
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

            {/* Main Content Area - NO scroll-smooth to prevent transition glitches */}
            <main className="w-full h-full relative">
                <div
                    ref={scrollRef}
                    className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden pb-[calc(60px+env(safe-area-inset-bottom)+20px)] bg-gray-50"
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
