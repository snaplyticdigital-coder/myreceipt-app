import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

export function useBackButton(
    isModalOpen: boolean,
    closeModal: () => void
) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleBackButton = async () => {
            // Priority 1: Close Modal if open
            if (isModalOpen) {
                closeModal();
                return;
            }

            // Priority 2: Navigate back if not on root tabs
            // Root tabs: /, /search, /analytics, /tax-relief
            const rootPaths = ['/', '/search', '/analytics', '/tax-relief'];
            if (!rootPaths.includes(location.pathname)) {
                navigate(-1);
                return;
            }

            // Priority 3: Exit App (minimize)
            // If on a root path, let the default behavior happen or minimize
            await App.exitApp();
        };

        const listener = App.addListener('backButton', handleBackButton);

        return () => {
            listener.then(handler => handler.remove());
        };
    }, [isModalOpen, closeModal, navigate, location.pathname]);
}
