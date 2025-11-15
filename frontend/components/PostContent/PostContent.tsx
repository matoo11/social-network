'use client';

import React from 'react';
import { useState } from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import ImageInputField from '../ImageInputField/ImageInputField';
import SelectInput from '../SelectInput/SelectInput';
import FollowersList from '../FollowersList/FollowersList';
import PostCard from '../PostCard/PostCard';
import CommentCard from '../CommentCard/CommentCard';
import CommentList from '../CommentList/CommentList';

type PostContentProps = {
    postID: number;
};

const selectInputOptions = [
    { optionText: 'Public', optionValue: 1 },
    { optionText: 'Followers Only', optionValue: 2 },
    { optionText: 'Private', optionValue: 3 },
];

const PostContent: React.FC<PostContentProps> = ({ postID }) => {
    return (
        <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Post Content" />
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-300">
                <div className="p-4">
                    <PostCard
                        postID={postID}
                        title="Alice"
                        content="This is a sample post content."
                        likesCount={10}
                        dislikesCount={2}
                    />
                </div>
                <div className="p-4">
                    <CommentList postID={postID} />
                </div>
            </div>
        </div>
    );
};

export default PostContent;
