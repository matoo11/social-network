// app/components/Chat/ChatList.tsx
'use client';

import React from 'react';
import ProfileImage from '../ProfileImage/ProfileImage';

export type ChatCardProps = {
    id?: string;
    username: string;
    lastMessage?: string;
    avatarUrl?: string;
    selected?: boolean;
    actions?: React.ReactNode;
    onChatClick?: (username: string) => void;
};

const ChatCard: React.FC<ChatCardProps> = ({ username, lastMessage, avatarUrl, selected, actions, onChatClick }) => {
    const className = [
        'rounded-lg cursor-pointer shadow-sm transition duration-300 ease-in-out',
        selected
            ? 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600'
            : 'dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700',
    ].join(' ');

    return (
        <div
            className={className}
            onClick={() => onChatClick?.(username)}
        >
            <div className="flex items-center space-x-4 rtl:space-x-reverse p-2">
                <div className="w-8 h-8">
                    <ProfileImage imageUrl={avatarUrl || ''} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                        {username}
                    </p>
                    {!lastMessage ? (
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {lastMessage}
                        </p>
                    ) : null}
                </div>
                {actions ? <div className="flex items-center">{actions}</div> : null}
            </div>
        </div>
    );
};

export default ChatCard;
