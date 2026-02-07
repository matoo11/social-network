'use client';

import React from 'react';

type PopupBtnProps = {
    onClick?: () => void;
    className?: string;
    color?: 'blue' | 'emerald' | 'default';
};

const colorMap = {
    blue: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400',
    emerald: 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400',
    default: 'bg-gray-700 hover:bg-gray-600 text-white',
};

const strokeMap = {
    blue: '#60a5fa',
    emerald: '#34d399',
    default: 'white',
};

const PopupBtn: React.FC<PopupBtnProps> = ({ onClick, className = '', color = 'default' }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`aspect-square h-[80%] rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${colorMap[color]} ${className}`}
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1.22229 5.00019H8.77785M5.00007 8.77797V1.22241"
                    stroke={strokeMap[color]}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
};

export default PopupBtn;
