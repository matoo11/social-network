'use client';
import React from 'react';

type ReactionProps = {
    type: 'like' | 'dislike' | 'comment';
    count: number;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    size?: 'xs' | 'sm';
};

const Reaction: React.FC<ReactionProps> = ({ type, count, onClick, className, size }) => {
    let icon = null;
    let hoverBg = '';
    let color = '';

    const iconSize = size === 'xs' ? 'text-xs' : 'text-sm';
    const countSize = size === 'xs' ? 'text-xs' : 'text-xs';

    switch (type) {
        case 'like':
            color = 'text-gray-400 hover:text-emerald-400';
            hoverBg = 'hover:bg-emerald-500/10';
            icon = <i className="fa-regular fa-thumbs-up" aria-hidden="true"></i>;
            break;
        case 'dislike':
            color = 'text-gray-400 hover:text-rose-400';
            hoverBg = 'hover:bg-rose-500/10';
            icon = <i className="fa-regular fa-thumbs-down" aria-hidden="true"></i>;
            break;
        case 'comment':
            color = 'text-gray-400 hover:text-blue-400';
            hoverBg = 'hover:bg-blue-500/10';
            icon = <i className="fa-regular fa-comment" aria-hidden="true"></i>;
            break;
        default:
            icon = null;
    }

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                cursor-pointer transition-all duration-150 ${color} ${hoverBg} ${className || ''}`}
        >
            <span className={iconSize}>{icon}</span>
            {count > 0 && <span className={`${countSize} font-medium tabular-nums`}>{count}</span>}
        </button>
    );
};

export default Reaction;
