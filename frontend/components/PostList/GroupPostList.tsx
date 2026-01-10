'use client';

import React, { useEffect, useState } from 'react';
import PostListUI from './PostListUI';
import { PostListUIProps } from './PostListUI';

const fetchGroupPosts = async (groupId: number) => {
    const res = await fetch(
        `http://localhost:8080/api/groups/posts?groupId=${groupId}`,
        {
            method: 'GET',
            credentials: 'include',
        },
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to fetch group posts');
    }

    return res.json();
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

    const fetchPostsFromAPI = async () => {
        const data = await fetchGroupPosts(groupId);

        const mappedPosts: PostListUIProps['posts'] = data.map((p: any) => ({
            postID: p.groupPostId, // IMPORTANT
            title: p.title,
            content: p.text,
            posterNickname: p.authorUsername, // until backend sends usernames
            posterProfileImageUrl: '',
            postImageUrl: '', // group posts don’t support images
            createdAt: p.creationTime,
            likesCount: 0,
            dislikesCount: 0,
            commentsCount: p.comments?.length ?? 0,
            postContentPopup: postContentPopupHandler,
        }));
        setPosts(mappedPosts);
    };

    useEffect(() => {
        fetchPostsFromAPI();
        onRef?.(fetchPostsFromAPI);
    }, [groupId]);

    return <PostListUI posts={posts} popupHandler={popupHandler} />;
};

export default GroupPostList;
