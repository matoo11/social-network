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
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Chats" />
                <PopupBtn className="mb-2" onClick={popupHandler} />
            </div>
            <div className="h-[92.5%] overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-2 p-4 ">
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
