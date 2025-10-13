import React from "react";

const Username: React.FC<{ text: React.ReactNode }> = ({ text }) => {
    return <span className="text-base mb-2">{text}</span>;
}

export default Username;