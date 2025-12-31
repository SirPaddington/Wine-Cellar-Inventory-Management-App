import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

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




    return createPortal(
        <div
            className="fixed inset-0 overflow-y-auto"
            style={{
                zIndex: 99999,
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh'
            }}
        >
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Panel */}
                <div
                    className={clsx(
                        "relative w-full transform rounded-2xl bg-neutral-900 border border-slate-700 shadow-2xl transition-all z-[1001] max-h-[95vh] flex flex-col pointer-events-auto",
                        sizeClasses[size]
                    )}
                    style={{ backgroundColor: '#3a3a3a' }} // Force opaque neutral-900
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl flex-shrink-0">
                        <h3 id="modal-title" className="text-xl font-semibold text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    {/* Content Area - Scrollable */}
                    <div className="p-6 overflow-y-auto custom-scrollbar text-lg">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
