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

    popupHandler: () => void;
};

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat, popupHandler }) => {
    const handleChatClick = (id: string, username: string) => {
        onSelectChat?.(id, username);
    };

    return (
        <div className="flex flex-col h-full w-full border-2 border-gray-600 rounded-lg shadow-sm overflow-hidden bg-gray-900">
            <div className="flex flex-shrink-0 justify-center gap-5 items-center pt-3 pb-3 px-4 border-b-2 border-gray-600 shadow-sm overflow-hidden bg-gray-900">
                <Title text="Chats" />
                <PopupBtn className="" onClick={popupHandler} />
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-2 p-4">
                    {chats.map((chat) => (
                        <ChatCard
                            key={chat.id}
                            username={chat.username}
                            lastMessage={chat.lastMessage}
                            avatarUrl={chat.avatarUrl}
                            onChatClick={() => handleChatClick(String(chat.id), chat.username)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatList;
