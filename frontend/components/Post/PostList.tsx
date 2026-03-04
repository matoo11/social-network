'use client';

import React, { useEffect, useState } from 'react';
import PostListUI from './PostListUI';
import { PostListUIProps } from './PostListUI';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

export interface DisplayedPost {
    postId: number;
    postTitle: string;
    postText: string;
    postType: string;
    posterNickname: string;
    posterAvatarNumber: number;
    postImageId: number;
    postTime: string; // ISO date string (Go's time.Time → string)
    numberOfLikes: number;
    numberOfDislikes: number;
    numberOfComments: number;
    comments: DisplayedComment[];
}

export interface DisplayedComment {
    commentId: number;
    postId: number;
    commenterNickname: string;
    commentText: string;
    commentTime: string; // ISO date string
    numberOfLikes: number;
    numberOfDislikes: number;
}

const fetchposts = async () => {
    const res = await fetchWithAuth('http://localhost:8080/api/fetchPostsByUserID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to logout');
    }
    const respond = await res.json();

    return respond.data;
};

type PostListProps = {
    popupHandler: () => void;
    onRef?: (refreshFn: () => void) => void;
    postContentPopupHandler?: (postID: number) => void;
};

const PostList: React.FC<PostListProps> = ({ popupHandler, onRef, postContentPopupHandler }) => {
    const [posts, setPosts] = useState<PostListUIProps['posts']>([]);

    const fetchPostsFromAPI = async () => {
        const data = await fetchposts();

        if (!data || data.length === 0) {
            console.warn('No posts returned');
            setPosts([]);
            return;
        }

        const mockData: PostListUIProps['posts'] = data.map((p: DisplayedPost) => ({
            postID: p.postId,
            title: p.postTitle,
            content: p.postText,
            postType: p.postType,
            posterNickname: p.posterNickname,
            posterAvatarNumber: p.posterAvatarNumber,
            posterProfileImageUrl: '',
            postImageUrl:
                p.postImageId !== 0 ? `http://localhost:8080/api/image?id=${p.postImageId}` : null,
            createdAt: p.postTime,
            likesCount: p.numberOfLikes,
            dislikesCount: p.numberOfDislikes,
            commentsCount: p.numberOfComments,
            postContentPopup: postContentPopupHandler,
        }));

        setPosts(mockData);
    };

    useEffect(() => {
        fetchPostsFromAPI();
        if (onRef) {
            onRef(fetchPostsFromAPI); // provide the refresh function to parent
        }
    }, []);

    return <PostListUI posts={posts} popupHandler={popupHandler} />;
};

export default PostList;
