'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import FollowerCard from '../FollowerCard/FollowerCard';
import SearchInput from '../SearchInput/SearchInput';
import Title from '../Title/Title';

type FollowersListProps = {
    onSelectionChange?: (selectedFollowerIDs: number[]) => void;
};

async function fetchFollowers() {
    const res = await fetch('http://localhost:8080/api/getFollowers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to fetch followers');
    }

    const output = await res.json();
    console.log(output);
    return output;
}

interface Follower {
    FollowerID: number;
    FollowerUsername: string;
    FollowerAvatarURL: string;
    FollowerAvatarNumber: number;
}

const FollowersList: React.FC<FollowersListProps> = ({ onSelectionChange }) => {
    const [followersListData, setFollowersListData] = useState<Follower[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkedList, setCheckedList] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCheckChange = (followerID: number, checked: boolean) => {
        setCheckedList((prev) => {
            if (checked) {
                return [...prev, followerID]; // add to list
            } else {
                return prev.filter((id) => id !== followerID); // remove from list
            }
        });
    };

    useEffect(() => {
        onSelectionChange?.(checkedList);
    }, [checkedList]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFollowers(); // wait for the async function
                setFollowersListData(data || []);
            } catch (error) {
                console.error('Failed to fetch followers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // call the async function inside useEffect
    }, []); // empty deps array → runs only once after first render

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading followers...</p>
            </div>
        );
    }

    if (!followersListData || followersListData.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    You don't have any followers yet.
                </p>
            </div>
        );
    }

    const filteredFollowers = followersListData.filter((follower) =>
        follower.FollowerUsername.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="flex flex-col w-full gap-2">
            {/* Search Section - Fixed at top */}
            <div className="flex-shrink-0">
                <SearchInput
                    placeholder="Search followers..."
                    onSearch={(query) => {
                        setSearchQuery(query);
                    }}
                />
            </div>

            {/* Followers List - Scrollable, shows 3 cards then scrolls */}
            <div className="max-h-[156px] overflow-y-auto overflow-x-hidden space-y-2 pr-1 hide-scrollbar">
                {filteredFollowers.length > 0 ? (
                    filteredFollowers.map((follower) => (
                        <FollowerCard
                            key={follower.FollowerID}
                            userID={follower.FollowerID}
                            username={follower.FollowerUsername}
                            avatarUrl={follower.FollowerAvatarURL}
                            avatarNumber={follower.FollowerAvatarNumber || 1}
                            checked={checkedList.includes(follower.FollowerID)}
                            onCheckChange={(checked) =>
                                handleCheckChange(follower.FollowerID, checked)
                            }
                        />
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic py-2">
                        No followers match your search.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FollowersList;
