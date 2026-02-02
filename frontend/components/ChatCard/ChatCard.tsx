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

const ChatCard: React.FC<ChatCardProps> = ({
    username,
    lastMessage,
    avatarUrl,
    selected,
    actions,
    onChatClick,
}) => {
    const className = [
        'rounded-xl cursor-pointer shadow-md border transition-all duration-200 ease-in-out',
        selected
            ? 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/40'
            : 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:shadow-lg',
    ].join(' ');

    return (
        <div className={className} onClick={() => onChatClick?.(username)}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3">
                <div className="w-8 h-8 flex-shrink-0">
                    <ProfileImage imageUrl={avatarUrl || ''} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-md font-semibold  truncate text-white mb-0.5">
                        {username}
                    </p>
                    {!lastMessage ? (
                        <p className="text-xs truncate text-gray-400">
                            {lastMessage}
                        </p>
                    ) : null}
                </div>
                {actions ? <div className="flex items-center flex-shrink-0">{actions}</div> : null}
            </div>
        </div>
    );
};

export default ChatCard;
