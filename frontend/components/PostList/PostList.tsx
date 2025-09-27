// components/PostList.tsx
import React, { useEffect, useState } from 'react';
import PostListUI from './PostListUI';
import { PostListUIProps } from './types';

const PostList: React.FC = () => {
  // State holds an array of Post, not the entire PostListUIProps object
  const [posts, setPosts] = useState<PostListUIProps['posts']>([]);

  useEffect(() => {
    // Replace with actual API call
    const fetchPosts = async () => {
      const mockData: PostListUIProps['posts'] = [
        {
          postID: 1,
          title: 'First Post',
          content: 'This is a mock post',
          posterNickname: 'Alice',
          posterProfileImageUrl: '/images/alice.jpg',
          createdAt: '2025-09-27',
          likesCount: 5,
          dislikesCount: 1,
          commentsCount: 3,
        },
        {
          postID: 2,
          title: 'Second Post',
          content: 'More mock content here.',
          posterNickname: 'Bob',
          posterProfileImageUrl: '/images/bob.jpg',
          createdAt: '2025-09-26',
          likesCount: 2,
          dislikesCount: 0,
          commentsCount: 1,
        },
      ];
      setPosts(mockData);
    };

    fetchPosts();
  }, []);

  return <PostListUI posts={posts} />;
};

export default PostList;
