'use client';

import React from 'react';
import PostCardUI from './PostCardUI';

const PostCard: React.FC<React.ComponentProps<typeof PostCardUI>> = (props) => {
  return <PostCardUI {...props} />;
};

export default PostCard;
