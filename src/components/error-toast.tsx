/**
 * Error Toast Component
 * Global notification system for errors, warnings, and success messages
 */

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type ToastType = 'error' | 'warning' | 'success' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number; // ms, 0 = no auto-dismiss
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => string;
    showError: (title: string, message?: string) => string;
    showWarning: (title: string, message?: string) => string;
    showSuccess: (title: string, message?: string) => string;
    showInfo: (title: string, message?: string) => string;
    dismissToast: (id: string) => void;
    clearAll: () => void;
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// ============================================
// PROVIDER
// ============================================

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (toast: Omit<Toast, 'id'>): string => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? (toast.type === 'error' ? 0 : 5000),
        };

        setToasts(prev => [...prev, newToast]);
        return id;
    };

    const showError = (title: string, message?: string) =>
        showToast({ type: 'error', title, message, duration: 0 });

    const showWarning = (title: string, message?: string) =>
        showToast({ type: 'warning', title, message, duration: 8000 });

    const showSuccess = (title: string, message?: string) =>
        showToast({ type: 'success', title, message, duration: 4000 });

    const showInfo = (title: string, message?: string) =>
        showToast({ type: 'info', title, message, duration: 5000 });

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const clearAll = () => {
        setToasts([]);
    };

    return (
        <ToastContext.Provider value={{
            toasts,
            showToast,
            showError,
            showWarning,
            showSuccess,
            showInfo,
            dismissToast,
            clearAll,
        }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}

// ============================================
// TOAST CONTAINER
// ============================================

function ToastContainer({
    toasts,
    onDismiss
}: {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onDismiss={() => onDismiss(toast.id)}
                />
            ))}
        </div>
    );
}

// ============================================
// TOAST ITEM
// ============================================

function ToastItem({
    toast,
    onDismiss
}: {
    toast: Toast;
    onDismiss: () => void;
}) {
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onDismiss, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onDismiss]);

    const config = getToastConfig(toast.type);

    return (
        <div
            className={`
                pointer-events-auto
                flex items-start gap-3 p-4 rounded-xl shadow-lg border
                animate-in slide-in-from-right-full duration-300
                ${config.bg} ${config.border}
            `}
        >
            <div className={`flex-shrink-0 ${config.iconColor}`}>
                {config.icon}
            </div>

            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${config.titleColor}`}>
                    {toast.title}
                </p>
                {toast.message && (
                    <p className={`text-xs mt-1 ${config.messageColor}`}>
                        {toast.message}
                    </p>
                )}
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className={`text-xs font-medium mt-2 ${config.actionColor} hover:underline`}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={onDismiss}
                className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 ${config.dismissColor}`}
            >
                <X size={14} />
            </button>
        </div>
    );
}

// ============================================
// CONFIG
// ============================================

function getToastConfig(type: ToastType) {
    switch (type) {
        case 'error':
            return {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: <AlertCircle size={18} />,
                iconColor: 'text-red-500',
                titleColor: 'text-red-800',
                messageColor: 'text-red-600',
                actionColor: 'text-red-700',
                dismissColor: 'text-red-400',
            };
        case 'warning':
            return {
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                icon: <AlertTriangle size={18} />,
                iconColor: 'text-amber-500',
                titleColor: 'text-amber-800',
                messageColor: 'text-amber-600',
                actionColor: 'text-amber-700',
                dismissColor: 'text-amber-400',
            };
        case 'success':
            return {
                bg: 'bg-green-50',
                border: 'border-green-200',
                icon: <CheckCircle size={18} />,
                iconColor: 'text-green-500',
                titleColor: 'text-green-800',
                messageColor: 'text-green-600',
                actionColor: 'text-green-700',
                dismissColor: 'text-green-400',
            };
        case 'info':
        default:
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                icon: <Info size={18} />,
                iconColor: 'text-blue-500',
                titleColor: 'text-blue-800',
                messageColor: 'text-blue-600',
                actionColor: 'text-blue-700',
                dismissColor: 'text-blue-400',
            };
    }
}
