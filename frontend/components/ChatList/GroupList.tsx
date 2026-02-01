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
    onOpenEvents?: (groupId: string) => void;

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
    onOpenEvents,
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
        <div className="flex flex-col h-full w-full border-2 border-gray-600 rounded-lg shadow-sm overflow-hidden bg-gray-900">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-center items-center gap-3 px-4 py-3 border-b-2 border-gray-600 bg-gray-900 flex-wrap">
                <Title text="Groups" />
                <button
                    type="button"
                    className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 text-sm"
                    onClick={onToggleMode}
                >
                    {mode === 'mine' ? 'All groups' : 'My groups'}
                </button>
                <PopupBtn className="" onClick={popupHandler} />
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-2 p-4">
                    {chats.map((chat) => (
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
                                            className="p-2 rounded-md hover:bg-gray-600"
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
                                                        onInviteMembers?.(
                                                            String(chat.id),
                                                            chat.username,
                                                        );
                                                    }}
                                                >
                                                    Invite members
                                                </button>
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onSeeMembers?.(
                                                            String(chat.id),
                                                            chat.username,
                                                        );
                                                    }}
                                                >
                                                    See members
                                                </button>
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onOpenEvents?.(String(chat.id));
                                                    }}
                                                >
                                                    Events
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 text-sm"
                                            disabled={Boolean(chat.joined)}
                                            onClick={() =>
                                                onRequestToJoin?.(String(chat.id), chat.username)
                                            }
                                        >
                                            {chat.joined ? 'Joined' : 'Join'}
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
