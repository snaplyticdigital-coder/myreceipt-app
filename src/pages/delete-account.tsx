import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { useStore } from '../lib/store';
import { deleteUser } from 'firebase/auth';

const EXIT_REASONS = [
    { id: 'expensive', label: 'Too expensive' },
    { id: 'privacy', label: 'Privacy or Data Concerns' },
    { id: 'hard-to-use', label: 'Hard to use' },
    { id: 'switched', label: 'Switched to another app' },
    { id: 'not-needed', label: 'No longer need the service' },
    { id: 'missing-features', label: 'Missing features I need' },
    { id: 'other', label: 'Other' },
];

export function DeleteAccountPage() {
    const navigate = useNavigate();
    const { firebaseUser } = useAuth();
    const { user } = useStore();

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [otherReason, setOtherReason] = useState('');
    const [showEmailConfirm, setShowEmailConfirm] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userEmail = firebaseUser?.email || user.email;

    // Continue button is enabled when:
    // - Any of the 6 predefined reasons is selected, OR
    // - "Other" is selected AND the text field has content
    const canContinue = selectedReason !== null && (
        selectedReason !== 'other' || otherReason.trim().length > 0
    );

    const handleReasonSelect = (reasonId: string) => {
        setSelectedReason(reasonId);
        setError(null);
        // Clear "other" text if switching away from "other"
        if (reasonId !== 'other') {
            setOtherReason('');
        }
    };

    const handleContinue = () => {
        if (!canContinue) {
            if (selectedReason === 'other' && !otherReason.trim()) {
                setError('Please specify your reason.');
            } else {
                setError('Please select a reason.');
            }
            return;
        }
        setError(null);
        setShowEmailConfirm(true);
    };

    const handleDeleteAccount = async () => {
        if (emailInput.toLowerCase() !== userEmail.toLowerCase()) {
            setError('Email address does not match.');
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            if (firebaseUser) {
                await deleteUser(firebaseUser);
            }
            navigate('/login');
        } catch (err: any) {
            console.error('Delete account failed:', err);
            setError('Failed to delete account. Please try again.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Delete Account</h1>
                </div>
            </div>

            <div className="px-5 py-6 space-y-6">
                {/* Farewell Message Card */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-100">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200/50 shrink-0">
                            <MessageSquare size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 mb-2">
                                We're sorry to see you go
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Any feedback is greatly appreciated and helps us improve the app for everyone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Exit Interview */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">
                        What made you decide to leave?
                    </h3>

                    <div className="space-y-3">
                        {EXIT_REASONS.map((reason) => (
                            <button
                                key={reason.id}
                                type="button"
                                onClick={() => handleReasonSelect(reason.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-left ${
                                    selectedReason === reason.id
                                        ? 'border-purple-400 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                        selectedReason === reason.id
                                            ? 'border-purple-600 bg-purple-600'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {selectedReason === reason.id && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{reason.label}</span>
                            </button>
                        ))}

                        {/* Conditional "Other" Text Field - Only shown when "Other" is selected */}
                        {selectedReason === 'other' && (
                            <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Please specify
                                </label>
                                <textarea
                                    value={otherReason}
                                    onChange={(e) => {
                                        setOtherReason(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Tell us more about your experience..."
                                    rows={3}
                                    autoFocus
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none resize-none transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {error && !showEmailConfirm && (
                        <p className="text-sm text-red-600 mt-3">{error}</p>
                    )}
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] ${
                        canContinue
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200 hover:from-red-600 hover:to-rose-700'
                            : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                    }`}
                >
                    Continue
                </button>

                <p className="text-center text-xs text-gray-400">
                    This action is permanent and cannot be undone.
                </p>
            </div>

            {/* Email Confirmation Modal */}
            {showEmailConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Warning Icon */}
                        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 bg-red-100 rounded-2xl">
                            <AlertTriangle className="text-red-600" size={28} />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                            Confirm Account Deletion
                        </h2>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            To confirm, please enter your email address below. This action cannot be undone.
                        </p>

                        {/* Email Input */}
                        <div className="mb-6">
                            <label className="text-xs text-gray-500 block mb-2 text-center uppercase tracking-wide">
                                Enter <span className="font-mono font-bold text-gray-700">{userEmail}</span>
                            </label>
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => {
                                    setEmailInput(e.target.value);
                                    setError(null);
                                }}
                                placeholder="your@email.com"
                                className="w-full text-center font-medium text-base bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                            />
                            {error && showEmailConfirm && (
                                <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowEmailConfirm(false);
                                    setEmailInput('');
                                    setError(null);
                                }}
                                disabled={isDeleting}
                                className="flex-1 py-3.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || emailInput.toLowerCase() !== userEmail.toLowerCase()}
                                className="flex-1 py-3.5 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
