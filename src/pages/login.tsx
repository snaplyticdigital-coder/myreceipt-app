/**
 * Login Page
 * Email/Password and Google Sign-In authentication
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';

export function LoginPage() {
    const { user, loading, error, signIn, signInEmail, loginAsGuest, clearError } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect to home immediately when user is available
    useEffect(() => {
        if (user && !loading) {
            navigate('/', { replace: true });
        }
    }, [user, loading, navigate]);

    // Clear errors when inputs change
    useEffect(() => {
        if (error) clearError?.();
    }, [email, password]);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsSubmitting(true);
        try {
            await signInEmail(email, password);
            // Navigation handled by useEffect
        } catch {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        try {
            await signIn();
            // If native, signIn returns null and redirects. 
            // If web, it awaits popup and we redirect in useEffect.
        } catch (err: any) {
            console.error('Google Sign In Error:', err);
            // Alert the user so they can report the specific error code
            alert(`Login Failed: ${err.message || JSON.stringify(err)}`);
            setIsSubmitting(false);
        }
    };

    const handleGuestLogin = async () => {
        setIsSubmitting(true);
        try {
            await loginAsGuest();
        } catch (err) {
            console.error('Guest Login Error:', err);
            setIsSubmitting(false);
        }
    };

    // Check for Redirect Result (for Native Google Login)
    useEffect(() => {
        const checkRedirect = async () => {
            // Import dynamically to avoid circular dep if needed, or just use the hook context if we exposed it
            // Ideally, AuthContext handles this, but for now we patch it here or assume AuthContext's onAuthStateChanged catches it.
            // Actually, getRedirectResult MUST be called to complete the flow on some platforms.
            // But standard Firebase Auth observer *usually* picks it up. 
            // Let's rely on AuthContext's authState listener first.
            // If that fails, we might need to explicitly call getRedirectResult in AuthContext.
        };
        checkRedirect();
    }, []);

    // Show loading screen while auth is initializing
    if (loading && !isSubmitting) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Loading Overlay during sign-in */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Signing you in...</p>
                </div>
            )}

            {/* Logo Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
                {/* Receipt Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl shadow-purple-200 mb-6 transform rotate-3">
                    <div className="text-white opacity-90">
                        {/* Use a filled-ish look or just the icon */}
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <rect width="10" height="8" x="7" y="8" rx="1" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Duitrack</h1>
                <p className="text-lg text-gray-500 max-w-[260px] mx-auto leading-relaxed text-center">
                    Smart receipt tracking for Malaysian lifestyles.
                </p>
            </div>

            {/* Form Section */}
            <div className="px-6 pb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome back</h2>
                <p className="text-xs text-gray-500 mb-6">Sign in to continue</p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                    {/* Email Input */}
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-12 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Forgot Password */}
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs text-blue-500 font-medium">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !email || !password}
                        className="w-full bg-blue-500 text-white font-semibold py-3.5 rounded-xl active:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                {/* Google Sign-In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-white border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-3 active:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                </button>

                {/* Guest Login */}
                <button
                    onClick={handleGuestLogin}
                    disabled={isSubmitting}
                    className="w-full mt-3 bg-gray-50 border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-3 active:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                    <User size={20} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Continue as Guest</span>
                </button>

                {/* OR Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 font-medium">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

