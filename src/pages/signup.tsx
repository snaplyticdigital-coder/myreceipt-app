/**
 * Sign Up Page
 * Create new account with email/password
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export function SignUpPage() {
    const { user, loading, error, signUp, signIn, clearError } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

    // Redirect to home if already logged in
    useEffect(() => {
        if (user && !loading) {
            navigate('/', { replace: true });
        }
    }, [user, loading, navigate]);

    // Clear errors when inputs change
    useEffect(() => {
        if (error) clearError?.();
        setValidationError('');
    }, [name, email, password, confirmPassword]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            setValidationError('Please enter your name');
            return;
        }
        if (password.length < 6) {
            setValidationError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            await signUp(email, password, name.trim());
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsSubmitting(true);
        try {
            await signIn();
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayError = validationError || error;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center px-6 pt-10 pb-4">
                {/* Receipt Icon */}
                <div className="w-16 h-16 mb-3">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="15" y="8" width="50" height="64" rx="4" fill="#3B82F6" />
                        <path d="M15 64L20 60L25 64L30 60L35 64L40 60L45 64L50 60L55 64L60 60L65 64V72H15V64Z" fill="#3B82F6" />
                        <rect x="25" y="20" width="30" height="4" rx="2" fill="white" />
                        <rect x="25" y="30" width="20" height="4" rx="2" fill="white" />
                        <rect x="25" y="40" width="25" height="4" rx="2" fill="white" />
                        <rect x="25" y="50" width="15" height="4" rx="2" fill="white" />
                    </svg>
                </div>

                <h1 className="text-xl font-bold text-blue-500 mb-1">MyReceipt</h1>
                <p className="text-xs text-gray-500">Track your spending, effortlessly</p>
            </div>

            {/* Form Section */}
            <div className="px-6 pb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Create account</h2>
                <p className="text-xs text-gray-500 mb-4">Sign up to get started</p>

                {/* Error Message */}
                {displayError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <p className="text-xs text-red-600">{displayError}</p>
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3">
                    {/* Name Input */}
                    <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
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
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-12 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !name || !email || !password || !confirmPassword}
                        className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl active:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                {/* Google Sign-Up */}
                <button
                    onClick={handleGoogleSignUp}
                    disabled={isSubmitting}
                    className="w-full mt-3 bg-white border border-gray-200 rounded-xl py-3 flex items-center justify-center gap-3 active:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                </button>

                {/* OR Divider */}
                <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Sign In Link */}
                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
