// components/PostListUI.tsx
import React from 'react';
import PostCard from '../PostCard/PostCard';
import { PostListUIProps } from './types';
import styles from './PostList.module.css';

const PostListUI: React.FC<PostListUIProps> = ({ posts }) => {
  return (
    <div className={styles['posts-list']}>
      {posts.map((post) => (
        <PostCard key={post.postID} {...post} />
      ))}
    </div>
  );
};

export default PostListUI;
