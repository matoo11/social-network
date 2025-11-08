import React from 'react';
import ProfileImage from '../ProfileImage/ProfileImage';

interface ChatMessageProps {
    username: string;
    userImage: string;
    message: string;
    time: string; // e.g., "10:30 AM"
    type: 'sent' | 'received'; // sent by the current user or received
}

const ChatMessage: React.FC<ChatMessageProps> = ({ username, userImage, message, time, type }) => {
    const isSent = type === 'sent';

    return (
        <div className={`flex items-end mb-3 justify-start`}>
            {/* Image on left for received, right for sent */}
            <div className="flex items-center gap-3 px-2 py-5">
                <div className="flex w-10 h-10 rounded-none items-center justify-center">
                    <ProfileImage imageUrl={userImage} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex flex-col max-w-xs">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    {username}
                </span>

                <div
                    className={`px-4 py-2 rounded-lg break-words ${
                        isSent
                            ? 'bg-blue-500 text-white self-end rounded-br-none'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                    }`}
                >
                    {message}
                </div>

                <span className={`text-xs mt-1 text-gray-200 text-left`}>{time}</span>
            </div>
        </div>
    );
};

export default ChatMessage;
