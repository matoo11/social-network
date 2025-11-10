// app/components/Chat/ChatList.tsx
'use client';

import React from 'react';
import ProfileImage from '../ProfileImage/ProfileImage';

export type ChatCardProps = {
    id?: string;
    username: string;
    lastMessage?: string;
    avatarUrl?: string;
    onChatClick?: (username: string) => void;
};

const ChatCard: React.FC<ChatCardProps> = ({ username, lastMessage, avatarUrl, onChatClick }) => {
    return (
        <div
            className="hover:bg-gray-600 rounded-lg cursor-pointer shadow-sm overflow-hidden dark:bg-gray-800 transition duration-300 ease-in-out"
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
            </div>
        </div>
    );
};

export default ChatCard;
