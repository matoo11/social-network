'use client';

import React from 'react';
import { useState } from 'react';
import ChatCard from '../ChatCard/ChatCard';
import Title from '../Title/Title';
import PopupBtn from '../PopupBtn/PopupBtn';
import { ChatCardProps } from '../ChatCard/ChatCard';
import GroupJoinButton from '../GroupJoinButton/GroupJoinButton';

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
    onOpenChat?: (groupId: string, groupTitle: string) => void;

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
    onOpenChat,
    popupHandler,
}) => {
    const handleChatClick = (id: string, username: string, joined?: boolean) => {
        if (mode === 'mine' || joined) {
            onSelectChat?.(id, username);
        }
    };

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const toggleMenu = (id: string) => {
        setOpenMenuId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="flex flex-col h-full w-full border-0 lg:border-2 border-gray-600 rounded-none lg:rounded-lg shadow-sm overflow-hidden bg-gray-900">
            <div className="hidden lg:flex flex-nowrap flex-shrink-0 justify-center gap-2 items-center py-3 px-3 border-b-2 border-gray-600 shadow-sm bg-gray-900">
                <div className="w-1 h-5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="truncate min-w-0">
                    <Title text="Groups" />
                </span>
                <button
                    type="button"
                    className="bg-emerald-700 text-white px-2 py-1 rounded-md hover:bg-emerald-600 text-xs whitespace-nowrap flex-shrink-0"
                    onClick={onToggleMode}
                >
                    {mode === 'mine' ? 'All Groups' : 'My Groups'}
                </button>
                <PopupBtn
                    className="h-8 w-8 !aspect-auto flex-shrink-0"
                    onClick={popupHandler}
                    color="emerald"
                />
            </div>
            {/* Mobile header with toggle and create buttons */}
            <div className="flex lg:hidden flex-nowrap flex-shrink-0 justify-between gap-2 items-center py-2 px-3 border-b border-gray-700 bg-gray-900">
                <button
                    type="button"
                    className="bg-emerald-700 text-white px-3 py-1.5 rounded-md hover:bg-emerald-600 text-xs whitespace-nowrap"
                    onClick={onToggleMode}
                >
                    {mode === 'mine' ? 'All Groups' : 'My Groups'}
                </button>
                <PopupBtn
                    className="h-8 w-8 !aspect-auto flex-shrink-0"
                    onClick={popupHandler}
                    color="emerald"
                />
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-4">
                    {chats.map((chat) => (
                        <ChatCard
                            key={chat.id}
                            username={chat.username}
                            lastMessage={chat.lastMessage}
                            avatarUrl={chat.avatarUrl}
                            selected={String(chat.id) === String(selectedChatId)}
                            onChatClick={() => {
                                setOpenMenuId(null);
                                handleChatClick(
                                    String(chat.id),
                                    chat.username,
                                    Boolean(chat.joined),
                                );
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
                                                        onOpenChat?.(
                                                            String(chat.id),
                                                            chat.username,
                                                        );
                                                    }}
                                                >
                                                    Open Chat
                                                </button>
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
                                        <GroupJoinButton groupId={Number(chat.id)} />
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
