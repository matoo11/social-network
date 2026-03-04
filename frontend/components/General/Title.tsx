import React from 'react';

const Title: React.FC<{ text: React.ReactNode; className?: string }> = ({ text, className }) => {
    return (
        <h5
            className={`text-lg sm:text-xl font-bold tracking-tight text-white leading-snug ${className || ''}`}
        >
            {text}
        </h5>
    );
};

export default Title;
