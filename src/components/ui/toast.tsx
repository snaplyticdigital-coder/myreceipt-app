import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../../lib/store';

export function Toast() {
    const { toast, hideToast } = useStore();

    if (!toast) return null;

    const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? AlertCircle : Info;
    const bgColor = toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-full shadow-lg ${bgColor} text-white`}>
                <Icon size={18} className="fill-white/20" />
                <p className="text-sm font-semibold whitespace-nowrap">{toast.message}</p>
                <button
                    onClick={hideToast}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
