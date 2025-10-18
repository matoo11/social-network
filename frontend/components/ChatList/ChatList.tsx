'use client';

import React from 'react';
import ChatCard from '../ChatCard/ChatCard';
import Title from '../Title/Title';

type ChatItem = {
    id: string;
    name: string;
    lastMessage?: string;
    avatarUrl?: string;
};

type ChatListProps = {
    chats: ChatItem[];
    onSelectChat?: (chatId: string) => void;
};

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat }) => {
    return (
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Chats" />
            </div>
            <div className='h-[92.5%] overflow-y-auto hide-scrollbar'>
            <div className="flex flex-col gap-2 p-4 ">
                {chats.map((chat) => (
                    <ChatCard
                        key={chat.id}
                        username={chat.name}
                        lastMessage={chat.lastMessage}
                        avatarUrl={chat.avatarUrl}
                    />
                ))}
            </div>
            </div>
        </div>
    );
};

export default ChatList;
