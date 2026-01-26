import { LogOut } from 'lucide-react';

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm, isLoading }: LogoutConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                    <LogOut className="text-purple-600" size={28} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                    Confirm Log Out?
                </h2>
                <p className="text-gray-500 text-center text-sm mb-6">
                    You'll need to sign in again to access your receipts and data.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-200"
                    >
                        {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </div>
        </div>
    );
}
