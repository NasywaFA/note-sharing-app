'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        info: <AlertCircle className="h-5 w-5 text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${bgColors[type]} border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]`}>
                {icons[type]}
                <p className="flex-1 text-gray-900">{message}</p>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
  );
}