'use client';

import React, { useEffect, useState } from 'react';
import PostListUI from './PostListUI';
import { PostListUIProps } from './PostListUI';

export interface DisplayedPost {
    postId: number;
    postTitle: string;
    postText: string;
    postType: string;
    posterNickname: string;
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
    const res = await fetch('http://localhost:8080/api/fetchPostsByUserID', {
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

    //TODO: need to replace with actual API call
    const fetchPostsFromAPI = async () => {
        const mockData: PostListUIProps['posts'] = (await fetchposts()).map((p: DisplayedPost) => ({
            postID: p.postId,
            title: p.postTitle,
            content: p.postText,
            postType: p.postType,
            posterNickname: p.posterNickname,
            posterProfileImageUrl: '',
            postImageUrl:
                p.postImageId !== 0 ? `http://localhost:8080/api/image?id=${p.postImageId}` : null,
            createdAt: p.postTime,
            likesCount: 0, // backend doesn’t provide yet
            dislikesCount: 0, // backend doesn’t provide yet
            commentsCount: p.comments ? p.comments.length : 0,
            postContentPopup: postContentPopupHandler,
        }));

        console.log('Fetched posts:', mockData);
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
