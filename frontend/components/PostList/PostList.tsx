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
}

type PostListProps = {
  popupHandler: () => void;
};

const PostList: React.FC<PostListProps> = ({ popupHandler }) => {
    const [posts, setPosts] = useState<PostListUIProps['posts']>([]);

    useEffect(() => {
        //TODO: need to replace with actual API call
        const fetchPosts = async () => {
            const mockData: PostListUIProps['posts'] = (await fetchposts()).map((p: any) => ({
                postID: p.PostID,
                title: p.PostTitle,
                content: p.PostText,
                posterNickname: `User ${p.UserID}`,
                posterProfileImageUrl: p.ImageID ?? '',
                createdAt: p.CreationTime,
                likesCount: 0,        // backend doesn’t provide yet
                dislikesCount: 0,     // backend doesn’t provide yet
                commentsCount: p.Comments ? p.Comments.length : 0,
            }));


            setPosts(mockData);
        };

        fetchPosts();
    }, []);

    return <PostListUI posts={posts} popupHandler={popupHandler} />;
};

export default PostList;
