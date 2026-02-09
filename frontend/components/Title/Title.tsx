import React from 'react';

const Title: React.FC<{ text: React.ReactNode; className?: string }> = ({ text, className }) => {
    return (
        <h5
            className={`text-lg sm:text-2xl font-bold tracking-tight text-white ${className || ''}`}
        >
            {text}
        </h5>
    );
};

export default Title;
