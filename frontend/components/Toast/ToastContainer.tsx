'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import ToastComponent from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed [top:calc(7vh+1rem)] right-4 z-50 space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastComponent toast={toast} onClose={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
