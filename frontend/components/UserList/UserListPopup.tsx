'use client';

import { useEffect, useMemo, useState } from 'react';
import Popup from '../Popup/Popup';
import FollowButton from '../FollowButton/FollowButton';
import { sendMessage } from '@/lib/api/websocket';
import { useUser } from '@/app/context/UserContext';
import ProfilePopup from '../ProfilePopup/ProfilePopup';

export type UserDisplay = {
    User_ID: number;
    User_Name: string;
    First_Name?: string;
    Last_Name?: string;
};

type UserListPopupProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function UserListPopup({ isOpen, onClose }: UserListPopupProps) {
    const { user } = useUser();
    const [users, setUsers] = useState<UserDisplay[]>([]);
    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<UserDisplay[]>;
            if (Array.isArray(customEvent.detail)) {
                setUsers(customEvent.detail);
            }
        };

        window.addEventListener('ws-userlist', handler);
        return () => window.removeEventListener('ws-userlist', handler);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        // Ask backend for the latest list (in case we opened before first broadcast)
        sendMessage('get_userlist', {});
    }, [isOpen]);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter((u) => (u.User_Name || '').toLowerCase().includes(term));
    }, [users, search]);

    const handleUserClick = (userId: number) => {
        setSelectedUserId(userId);
        setIsProfileOpen(true);
    };

    const handleProfileClose = () => {
        setIsProfileOpen(false);
        setSelectedUserId(null);
    };

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} className="max-w-lg">
                <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden bg-gray-900">
                    {/* Header */}
                    <div className="flex justify-center gap-5 items-center h-16 pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden bg-gray-900">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            Users
                        </h3>
                    </div>

                    {/* Content area */}
                    <div className="p-6 h-[calc(100%-4rem)]">
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-gray-700 border border-gray-500 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-gray-400"
                                    placeholder="Search users..."
                                />
                            </div>
                        </div>

                        <ul className="h-[calc(100%-3.5rem)] overflow-y-auto hide-scrollbar text-gray-200 space-y-1">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <li key={u.User_ID} className="mb-2">
                                        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-colors">
                                            <div
                                                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                                onClick={() => handleUserClick(u.User_ID)}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <span className="block text-sm font-medium text-white truncate hover:text-blue-500">
                                                        {u.User_Name}
                                                    </span>
                                                    {(u.First_Name || u.Last_Name) && (
                                                        <span className="block text-xs text-gray-400 mt-0.5 truncate">
                                                            {u.First_Name} {u.Last_Name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className="ml-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {user.userId !== 0 && u.User_ID !== user.userId ? (
                                                    <FollowButton userID={u.User_ID} />
                                                ) : null}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="py-12 text-center">
                                    <svg
                                        className="mx-auto w-12 h-12 text-gray-500 mb-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    <p className="text-sm text-gray-400">No users found</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Try a different search term
                                    </p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </Popup>

            <ProfilePopup
                isOpen={isProfileOpen}
                onClose={handleProfileClose}
                userId={selectedUserId}
                onUserClick={handleUserClick}
            />
        </>
    );
}
