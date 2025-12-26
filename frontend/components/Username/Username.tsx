import React from "react";

const Username: React.FC<{ text: React.ReactNode }> = ({ text }) => {
    return <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{text}</p>;
}

export default Username;