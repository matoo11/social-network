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
        if (onSelectionChange) {
            onSelectionChange(checkedList);
        }
    }, [checkedList, onSelectionChange]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFollowers(); // wait for the async function
                setFollowersListData(data);
            } catch (error) {
                console.error('Failed to fetch followers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // call the async function inside useEffect
    }, []); // empty deps array → runs only once after first render

    if (loading) {
        return <div>Loading followers...</div>;
    }

    const filteredFollowers = followersListData.filter((follower) =>
        follower.FollowerUsername.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="flex flex-col h-full">
            <div className="h-[15%] flex-shrink-0 mb-10">
                <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Select Followers
                </p>
                <SearchInput
                    className="mt-2"
                    onSearch={(query) => {
                        setSearchQuery(query);
                    }}
                />
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-2 hide-scrollbar">
                {filteredFollowers.length > 0 ? (
                    filteredFollowers.map((follower) => (
                        <FollowerCard
                            key={follower.FollowerID}
                            userID={follower.FollowerID}
                            username={follower.FollowerUsername}
                            avatarUrl={follower.FollowerAvatarURL}
                            checked={checkedList.includes(follower.FollowerID)}
                            onCheckChange={(checked) =>
                                handleCheckChange(follower.FollowerID, checked)
                            }
                        />
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                        No followers found.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FollowersList;
