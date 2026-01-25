'use client';

import React from 'react';
import { useState } from 'react';
import ChatCard from '../ChatCard/ChatCard';
import Title from '../Title/Title';
import PopupBtn from '../PopupBtn/PopupBtn';
import { ChatCardProps } from '../ChatCard/ChatCard';

type GroupListItem = ChatCardProps & { joined?: boolean };

type ChatListProps = {
    chats: GroupListItem[];
    onSelectChat?: (id: string, username: string) => void;
    selectedChatId?: string;

    mode: 'mine' | 'all';
    onToggleMode: () => void;

    onInviteMembers?: (groupId: string, groupTitle: string) => void;
    onSeeMembers?: (groupId: string, groupTitle: string) => void;
    onRequestToJoin?: (groupId: string, groupTitle: string) => void;

    popupHandler: () => void;
};

const GroupList: React.FC<ChatListProps> = ({
    chats,
    onSelectChat,
    selectedChatId,
    mode,
    onToggleMode,
    onInviteMembers,
    onSeeMembers,
    onRequestToJoin,
    popupHandler,
}) => {
    const handleChatClick = (id: string, username: string) => {
        if (mode === 'mine') {
            onSelectChat?.(id, username);
        }
    };

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const toggleMenu = (id: string) => {
        setOpenMenuId((prev) => (prev === id ? null : id));
    };


    return (
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Groups" />
                <button
                    type="button"
                    className="mb-2 bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                    onClick={onToggleMode}
                >
                    {mode === 'mine' ? 'All groups' : 'My groups'}
                </button>
                <PopupBtn className="mb-2" onClick={popupHandler} />
            </div>
            <div className="h-[92.5%] overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-2 p-4 ">
                    {chats.map((chat) => (
                        // console.log(chat)
                        <ChatCard
                            key={chat.id}
                            username={chat.username}
                            lastMessage={chat.lastMessage}
                            avatarUrl={chat.avatarUrl}
                            selected={String(chat.id) === String(selectedChatId)}
                            onChatClick={() => {
                                setOpenMenuId(null);
                                handleChatClick(String(chat.id), chat.username);
                            }}
                            actions={
                                mode === 'mine' ? (
                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            aria-label={`Group actions for ${chat.username}`}
                                            className="p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600"
                                            onClick={() => toggleMenu(String(chat.id))}
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <circle cx="12" cy="5" r="2" fill="currentColor" />
                                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                                                <circle cx="12" cy="19" r="2" fill="currentColor" />
                                            </svg>
                                        </button>

                                        {openMenuId === String(chat.id) ? (
                                            <div className="absolute right-0 mt-1 w-44 rounded-md bg-gray-800 border border-gray-600 shadow-lg z-50 overflow-hidden">
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onInviteMembers?.(String(chat.id), chat.username);
                                                    }}
                                                >
                                                    Invite members
                                                </button>
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onSeeMembers?.(String(chat.id), chat.username);
                                                    }}
                                                >
                                                    See members
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50"
                                            disabled={Boolean(chat.joined)}
                                            onClick={() => onRequestToJoin?.(String(chat.id), chat.username)}
                                        >
                                            {chat.joined ? 'Joined' : 'Request to join'}
                                        </button>
                                    </div>
                                )
                            }

                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupList;
