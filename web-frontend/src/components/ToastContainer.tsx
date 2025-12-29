import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <XCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            default:
                return null;
        }
    };

    const getColorClasses = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500';
            case 'error':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500';
            case 'warning':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-500';
            case 'info':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-500';
            default:
                return 'bg-neu-light-surface dark:bg-neu-dark-surface text-neu-light-text dark:text-neu-dark-text';
        }
    };

    return (
        <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 p-4 rounded-neu shadow-neu-lg dark:shadow-neu-dark-lg border-l-4 animate-slide-down ${getColorClasses(toast.type)}`}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(toast.type)}
                    </div>
                    <div className="flex-1 text-sm font-medium">
                        {toast.message}
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="flex-shrink-0 neu-icon-button p-1"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
