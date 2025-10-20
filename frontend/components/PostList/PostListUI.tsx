// components/PostListUI.tsx
import React from 'react';
import PostCard from '../PostCard/PostCard';
import Title from '../Title/Title';
import PopupBtn from '../PopupBtn/PopupBtn';
import { Post } from '../PostCard/types';

export type PostListUIProps = {
    posts: Post[];
    popupHandler: () => void;
};

const PostListUI: React.FC<PostListUIProps> = ({ posts, popupHandler }) => {
    return (
        <div className="h-full border-2 border-x-0 border-y-transparent rounded-lg shadow-sm overflow-hidden dark:bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Posts Feed" />
                <PopupBtn className="mb-2" onClick={popupHandler} />
            </div>
            <div className="flex flex-col items-center h-[92.5%] px-15 gap-5 bg-gray-100 dark:bg-gray-900 py-5 overflow-y-auto hide-scrollbar">
                {posts.map((post) => (
                    <PostCard key={post.postID} {...post} />
                ))}
            </div>
        </div>
    );
};

export default PostListUI;
