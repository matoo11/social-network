import React from 'react';

const TextElement: React.FC<{ text: React.ReactNode; className?: string }> = ({
    text,
    className,
}) => {
    return <p className={`text-sm leading-relaxed text-gray-300 ${className || ''}`}>{text}</p>;
};

export default TextElement;
