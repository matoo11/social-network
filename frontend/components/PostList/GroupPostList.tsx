'use client';

import React, { useEffect, useState } from 'react';
import PostListUI from './PostListUI';
import { PostListUIProps } from './PostListUI';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

const fetchGroupPosts = async (groupId: number) => {
    const res = await fetchWithAuth(`http://localhost:8080/api/groups/posts?groupId=${groupId}`, {
        method: 'GET',
        credentials: 'include',
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(text || 'Failed to fetch group posts');
    }

    if (!text) {
        return [];
    }

    try {
        return JSON.parse(text);
    } catch (err) {
        throw new Error('Failed to parse response');
    }
};

type GroupPostListProps = {
    groupId: number;
    popupHandler: () => void;
    onRef?: (refreshFn: () => void) => void;
    postContentPopupHandler?: (postID: number) => void;
};

const GroupPostList: React.FC<GroupPostListProps> = ({
    groupId,
    popupHandler,
    onRef,
    postContentPopupHandler,
}) => {
    const [posts, setPosts] = useState<PostListUIProps['posts']>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPostsFromAPI = async () => {
        if (groupId === 0) {
            setPosts([]);
            setError(null);
            return;
        }

        try {
            const data = await fetchGroupPosts(groupId);
            setError(null);
            console.log('Fetched Group Posts:', data);
            const mappedPosts: PostListUIProps['posts'] = data.map((p: any) => ({
                postID: p.postId, // IMPORTANT
                title: p.title,
                content: p.text,
                posterNickname: p.authorUsername, // until backend sends usernames
                posterAvatarNumber: p.authorAvatarNumber || 1,
                posterProfileImageUrl: '',
                postImageUrl: p.imageId ? `http://localhost:8080/api/image?id=${p.imageId}` : '',
                createdAt: p.createdAt,
                likesCount: 0,
                dislikesCount: 0,
                commentsCount: p.comments?.length ?? 0,
                postContentPopup: postContentPopupHandler,
            }));
            setPosts(mappedPosts);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
            setError(errorMessage);
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchPostsFromAPI();
        onRef?.(fetchPostsFromAPI);
    }, [groupId]);

    return (
        <div className="flex flex-col h-full w-full rounded-none lg:rounded-lg shadow-none lg:shadow-sm overflow-hidden bg-gray-900">
            {error ? (
                <div className="flex items-center justify-center h-full p-4">
                    <p className="text-red-400 text-center">{error}</p>
                </div>
            ) : (
                <PostListUI
                    posts={posts}
                    popupHandler={popupHandler}
                    title="Group Posts"
                    accentColor="bg-emerald-500"
                    btnColor="emerald"
                    disableBtn={groupId === 0}
                />
            )}
        </div>
    );
};

export default GroupPostList;
