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

type CommentListProps = {
    postID: number;
};

const CommentList: React.FC<CommentListProps> = ({ postID }) => {
    return (
        <div className="border-2 border-gray-600 rounded-lg h-full bg-gray-900">
            <div className="flex justify-center gap-5 items-center h-[%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                <Title text="Comments" />
            </div>

            <div className="bg-white">
                <div className="p-4">
                    <CommentCard
                        postID={123}
                        commentID={456}
                        commentText="This is a sample comment for demonstration purposes."
                        commenterNickname="JohnDoe"
                        commenterProfileImageUrl=""
                        createdAt="2025-01-14T10:30:00"
                        likesCount={122}
                        dislikesCount={13}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommentList;
