'use client';
import React from 'react';

type ReactionProps = {
    type: 'like' | 'dislike' | 'comment';
    count: number;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const Reaction: React.FC<ReactionProps> = ({ type, count, onClick }) => {
    let icon = null;
    let baseColor = '';
    let hoverColor = '';

    switch (type) {
        case 'like':
            baseColor = 'text-green-500 dark:text-green-400';
            hoverColor = 'hover:text-green-600 dark:hover:text-green-300';
            icon = <i className="fa fa-thumbs-up" aria-hidden="true"></i>;
            break;
        case 'dislike':
            baseColor = 'text-red-500 dark:text-red-400';
            hoverColor = 'hover:text-red-600 dark:hover:text-red-300';
            icon = <i className="fa fa-thumbs-down" aria-hidden="true"></i>;
            break;
        case 'comment':
            baseColor = 'text-blue-500 dark:text-blue-400';
            hoverColor = 'hover:text-blue-600 dark:hover:text-blue-300';
            icon = <i className="fa fa-comment" aria-hidden="true"></i>;
            break;
        default:
            icon = null;
    }

    const classNameCss = `
        p-2 border rounded-md shadow-sm inline-flex items-center gap-1
        text-sm bg-white dark:bg-gray-800
        hover:bg-gray-100 dark:hover:bg-gray-700
        cursor-pointer w-15 justify-center
        transition-colors duration-150
        ${baseColor} ${hoverColor}
    `;

    return (
        <button onClick={onClick} className={classNameCss.trim()}>
            <span>{icon}</span>
            <span>{count}</span>
        </button>
    );
};

export default Reaction;
