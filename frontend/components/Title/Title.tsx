import React from "react";

const Title: React.FC<{ text: React.ReactNode }> = ({ text }) => {
  return <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{text}</h5>;
}

export default Title;