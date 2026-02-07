'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import FollowerCard from '../FollowerCard/FollowerCard';
import SearchInput from '../SearchInput/SearchInput';
import { sendMessage } from '@/lib/api/websocket';
import { useUser } from '@/app/context/UserContext';

type AllUsersListProps = {
    onSelectionChange?: (selectedUserIDs: number[]) => void;
};

interface User {
    User_ID: number;
    User_Name: string;
    Avatar: string;
}

const AllUsersList: React.FC<AllUsersListProps> = ({ onSelectionChange }) => {
    const { user } = useUser();
    const [usersListData, setUsersListData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkedList, setCheckedList] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCheckChange = (userID: number, checked: boolean) => {
        setCheckedList((prev) => {
            if (checked) {
                return [...prev, userID]; // add to list
            } else {
                return prev.filter((id) => id !== userID); // remove from list
            }
        });
    };

    useEffect(() => {
        onSelectionChange?.(checkedList);
    }, [checkedList]);

    useEffect(() => {
        // Request user list from WebSocket
        sendMessage('get_userlist', {});

        // Listen for user list updates
        const handler = (e: any) => {
            const users = e.detail;
            if (Array.isArray(users)) {
                // Filter out the current user
                const filteredUsers = users.filter((u: User) => u.User_ID !== user.userId);
                setUsersListData(filteredUsers);
                setLoading(false);
            }
        };

        window.addEventListener('ws-userlist', handler);
        return () => window.removeEventListener('ws-userlist', handler);
    }, [user.userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
        );
    }

    const filteredUsers = usersListData.filter((user) =>
        user.User_Name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="flex flex-col w-full gap-2 h-full">
            {/* Search Section - Fixed at top */}
            <div className="flex-shrink-0">
                <SearchInput
                    placeholder="Search users..."
                    onSearch={(query) => {
                        setSearchQuery(query);
                    }}
                />
            </div>

            {/* Users List - Scrollable, fills remaining space */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-2 pr-1 hide-scrollbar">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <FollowerCard
                            key={user.User_ID}
                            userID={user.User_ID}
                            username={user.User_Name}
                            avatarUrl={user.Avatar}
                            checked={checkedList.includes(user.User_ID)}
                            onCheckChange={(checked) => handleCheckChange(user.User_ID, checked)}
                        />
                    ))
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-400">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllUsersList;
