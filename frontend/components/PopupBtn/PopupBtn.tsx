'use client';

import React from 'react';

type PopupBtnProps = {
  onClick?: () => void;
  className?: string;
};

const PopupBtn: React.FC<PopupBtnProps> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`aspect-square h-[80%] bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-500 hover:bg-gray-800 ${className}`}
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
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default PopupBtn;
