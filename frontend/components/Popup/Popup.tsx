'use client';

import React from 'react';

type PopupProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;

    title?: string;
    showCloseButton?: boolean;

    positionStyle?: React.CSSProperties;
    className?: string;
    style?: React.CSSProperties;
};

const Popup: React.FC<PopupProps> = ({
    isOpen,
    onClose,
    children,
    title,
    showCloseButton = true,
    positionStyle,
    className = '',
    style = {},
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred background */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup container */}
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 ${className}`}
                style={{ position: 'absolute', ...positionStyle, ...style }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Optional close button */}
                {showCloseButton && (
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-white text-xl"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                )}

                {/* Optional title */}
                {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Popup;
