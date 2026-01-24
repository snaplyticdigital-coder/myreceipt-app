
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';
import { AuthProvider } from './contexts/auth-context';
import { ToastProvider } from './components/error-toast';
import { ProtectedRoute } from './components/protected-route';
import { AppLayout } from './components/layout/app-layout';
import { LoginPage } from './pages/login';
import { SignUpPage } from './pages/signup';
import { HomePage } from './pages/home';
import { ReceiptDetailPage } from './pages/receipt-detail';
import { AnalyticsPage } from './pages/analytics';
import { BudgetPage } from './pages/budget';
import { ProfilePage } from './pages/profile';
import { SearchPage } from './pages/search';
import { NotificationsPage } from './pages/notifications';
import { TaxReliefPage } from './pages/tax-relief';
import { AchievementsPage } from './pages/achievements';
import { DetailedExpensesPage } from './pages/detailed-expenses';
import { TaxVaultPage } from './pages/tax-vault';

// Wrapper to use hooks outside Router
function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            // Handle Hardware Back Button
            CapacitorApp.addListener('backButton', () => {
                if (location.pathname === '/' || location.pathname === '/login') {
                    CapacitorApp.exitApp();
                } else {
                    navigate(-1);
                }
            });

            // Status Bar & Navigation Bar Configuration
            const configureSystemBars = async () => {
                try {
                    // Status Bar: Transparent Overlay, Dark Text (Light Style)
                    await StatusBar.setOverlaysWebView({ overlay: true });
                    await StatusBar.setStyle({ style: Style.Light });

                    // Navigation Bar: OPAQUE White, Dark Buttons
                    // This forces the webview to sit ABOVE the system navigation buttons
                    await NavigationBar.setTransparency({ isTransparent: false });
                    await NavigationBar.setColor({ color: '#ffffff', darkButtons: true });
                } catch (e) {
                    console.error('SystemBar config error', e);
                }
            };
            configureSystemBars();
        }
    }, [navigate, location]);

    return (
        <Routes>
            {/* Public routes - Login & Signup */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<HomePage />} />
                <Route path="receipt/:id" element={<ReceiptDetailPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="budget" element={<BudgetPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="tax-relief" element={<TaxReliefPage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="detailed-expenses" element={<DetailedExpensesPage />} />
                <Route path="tax-vault" element={<TaxVaultPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;

