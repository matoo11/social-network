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
        <div className="flex gap-3 px-4 py-1.5 hover:bg-gray-800/50 transition-colors group rounded-lg">
            {/* Profile Image */}
            <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    <ProfileImage imageUrl={userImage} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
                {/* Username and Time */}
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                        className={`text-sm font-semibold ${isSent ? 'text-blue-400' : 'text-gray-100'}`}
                    >
                        {username}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                        {time}
                    </span>
                </div>

                {/* Message Text */}
                <div className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap min-w-[200px]">
                    {message}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
