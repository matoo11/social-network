import React from "react";

const TextElement: React.FC<{ text: React.ReactNode }> = ({ text }) => {
    return <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{text}</p>;
}

export default TextElement;