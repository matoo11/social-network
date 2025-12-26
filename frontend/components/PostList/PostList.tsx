'use client';

import React, { useEffect, useState } from 'react';
import PostListUI from './PostListUI';
import { PostListUIProps } from './PostListUI';

const fetchposts = async () => {
    const res = await fetch('http://localhost:8080/api/getPublicPosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to logout');
    }
    return res.json();
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
        const mockData: PostListUIProps['posts'] = (await fetchposts()).map((p: any) => ({
            postID: p.PostID,
            title: p.PostTitle,
            content: p.PostText,
            posterNickname: p.UserName,
            posterProfileImageUrl: '',
            postImageUrl: `http://localhost:8080/api/image?id=${p.ImageID}`,
            createdAt: p.CreationTime,
            likesCount: 0, // backend doesn’t provide yet
            dislikesCount: 0, // backend doesn’t provide yet
            commentsCount: p.Comments ? p.Comments.length : 0,
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
