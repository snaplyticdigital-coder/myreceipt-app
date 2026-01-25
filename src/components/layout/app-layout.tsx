import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

    useBackButton(isAddModalOpen, () => setIsAddModalOpen(false));

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
                <div className="absolute inset-0 w-full h-full overflow-y-auto scroll-smooth pb-[calc(60px+env(safe-area-inset-bottom)+20px)] bg-gray-50">
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
