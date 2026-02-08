// components/PostListUI.tsx
import React from 'react';
import PostCard from '../PostCard/PostCard';
import Title from '../Title/Title';
import PopupBtn from '../PopupBtn/PopupBtn';
import { PostCardUIProps } from '../PostCard/PostCardUI';

export type PostListUIProps = {
    posts: PostCardUIProps[];
    popupHandler: () => void;
    title?: string;
    accentColor?: string;
    btnColor?: 'blue' | 'emerald' | 'default';
    disableBtn?: boolean;
};

const PostListUI: React.FC<PostListUIProps> = ({
    posts,
    popupHandler,
    title = 'Social Feed',
    accentColor = 'bg-blue-500',
    btnColor = 'blue',
    disableBtn = false,
}) => {
    return (
        <div className="flex flex-col h-full w-full rounded-lg shadow-sm overflow-hidden bg-gray-900">
            <div className="flex flex-shrink-0 justify-center gap-5 items-center pt-3.5 pb-3 px-4 border-b-2 border-gray-600 shadow-sm overflow-hidden bg-gray-900">
                <div className={`w-1 h-5 ${accentColor} rounded-full`}></div>
                <Title text={title} />
                <PopupBtn className="" onClick={popupHandler} color={btnColor} disabled={disableBtn} />
            </div>
            <div className="flex flex-col items-center flex-1 px-4 gap-5 bg-gray-900 py-5 overflow-y-auto hide-scrollbar">
                {!posts || posts.length === 0 ? (
                    <p className="text-gray-400 mt-10">No posts are available</p>
                ) : (
                    posts.map((post) => <PostCard key={post.postID} {...post} />)
                )}
            </div>
        </div>
    );
};

export default PostListUI;
