'use client';

import React from 'react';
import ChatCard from '../ChatCard/ChatCard';
import Title from '../Title/Title';
import PopupBtn from '../PopupBtn/PopupBtn';
import { ChatCardProps } from '../ChatCard/ChatCard';
import { on } from 'events';
import Username from '../Username/Username';

type ChatListProps = {
    chats: ChatCardProps[];
    onSelectChat?: (id: string, username: string) => void;
    selectedChatId?: string;
    popupHandler: () => void;
};

const ChatList: React.FC<ChatListProps> = ({
    chats,
    onSelectChat,
    popupHandler,
    selectedChatId,
}) => {
    const handleChatClick = (id: string, username: string) => {
        onSelectChat?.(id, username);
    };

    return (
        <div className="flex flex-col h-full w-full border-2 border-gray-600 rounded-lg shadow-sm overflow-hidden bg-gray-900">
            <div className="flex flex-shrink-0 justify-center gap-2 sm:gap-5 items-center py-2 sm:py-3 px-2 sm:px-4 border-b-2 border-gray-600 shadow-sm overflow-hidden bg-gray-900">
                <div className="w-1 h-4 sm:h-5 bg-blue-500 rounded-full"></div>
                <Title text="Direct Messages" className="whitespace-nowrap" />
                <PopupBtn className="" onClick={popupHandler} color="blue" />
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-4">
                    {chats.map((chat) => (
                        <ChatCard
                            key={chat.id}
                            username={chat.username}
                            lastMessage={chat.lastMessage}
                            avatarUrl={chat.avatarUrl}
                            avatarNumber={chat.avatarNumber}
                            selected={String(chat.id) === String(selectedChatId)}
                            onChatClick={() => {
                                handleChatClick(String(chat.id), chat.username);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatList;
