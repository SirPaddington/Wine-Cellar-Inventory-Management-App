import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
// Simple homegrown modal using fixed positioning and z-index.

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - High opacity to hide background text */}
            <div
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Panel - Solid bg-slate-900 ensures no transparency bleeding */}
            {/* Panel - Solid bg-slate-900 ensures no transparency bleeding */}
            <div
                className={clsx(
                    "relative w-full transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl transition-all z-50",
                    sizeClasses[size]
                )}
                style={{ backgroundColor: '#0f172a', isolation: 'isolate' }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900" style={{ backgroundColor: '#0f172a' }}>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Content Area - bg-slate-900 matches panel */}
                <div className="p-6 bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};
