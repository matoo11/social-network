import React from 'react';

const Username: React.FC<{ text: React.ReactNode; className?: string }> = ({ text, className }) => {
    return (
        <span
            className={`text-sm font-semibold text-gray-100 truncate leading-tight ${className || ''}`}
        >
            {text}
        </span>
    );
};

export default Username;
