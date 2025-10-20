'use client';

import React from 'react';

type PopupProps = {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
    className?: string;
};

const Popup: React.FC<PopupProps> = ({
    isOpen,
    onClose,
    children,
    title,
    showCloseButton = true,
    className = '',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed h-[100vh] w-[100vw] inset-0 z-50 flex items-center justify-center">
            {/* Blurred background */}
            <div
                className="fixed h-full w-full backdrop-blur-sm bg-white/10"
                onClick={onClose}
            />

            {/* Popup container */}
            <div
                className={`relative h-[80%] w-[80%] max-h-xl mt-[10vh] bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 flex flex-col ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Optional close button */}
                {showCloseButton && (
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-white text-xl"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        X
                    </button>
                )}

                {/* Optional title */}
                {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}

                {/* Content (scrollable) */}
                <div className="flex-1 overflow-y-auto mt-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Popup;
