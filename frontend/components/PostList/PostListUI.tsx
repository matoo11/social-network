// components/PostListUI.tsx
import React from 'react';
import PostCard from '../PostCard/PostCard';
import { PostListUIProps } from './types';

const PostListUI: React.FC<PostListUIProps> = ({ posts }) => {
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.postID} {...post} />
      ))}
    </div>
  );
};

export default PostListUI;
