// components/PostListUI.tsx
import React from 'react';
import PostCard from '../PostCard/PostCard';
import { PostListUIProps } from './types';
import styles from './PostList.module.css';

const PostListUI: React.FC<PostListUIProps> = ({ posts }) => {
  return (
    <div className="flex flex-col items-center min-h-screen px-15 gap-5">
      {posts.map((post) => (
        <PostCard key={post.postID} {...post} />
      ))}
    </div>
  );
};

export default PostListUI;
