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
import ImageUploader from '../ImageUploader/ImageUploader';

type CommentListProps = {
    postID: number;
    error?: string;
};

const CommentList: React.FC<CommentListProps> = ({ postID, error }) => {
    return (
        <div className="border-2 border-gray-600 rounded-lg h-full bg-gray-900 flex flex-col">
            <div className="flex justify-center gap-5 items-center h-[5%] pt-2 border-b-2 border-gray-600 dark:bg-gray-900">
                <Title text="Comments" />
            </div>

            <div className="flex flex-col h-[95%]">
                <div className="p-4 flex flex-col items-center gap-5 bg-gray-100 dark:bg-gray-900 py-5 overflow-y-auto hide-scrollbar flex-grow">
                    <CommentCard
                        postID={123}
                        commentID={456}
                        commentText="This is a sample comment for demonstration purposes."
                        commenterNickname="JohnDoe"
                        commenterProfileImageUrl=""
                        commentImageUrl="http://localhost:8080/api/image?id=1"
                        createdAt="2025-01-14T10:30:00"
                        likesCount={122}
                        dislikesCount={13}
                    />
                    <CommentCard
                        postID={123}
                        commentID={456}
                        commentText="This is a sample comment for demonstration purposes."
                        commenterNickname="JohnDoe"
                        commenterProfileImageUrl=""
                        commentImageUrl=""
                        createdAt="2025-01-14T10:30:00"
                        likesCount={122}
                        dislikesCount={13}
                    />
                </div>
                <div className=" px-5 pt-2 h-[25%] mt-auto border-t-2 border-gray-600">
                    <textarea
                        id="message"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white resize-none"
                        placeholder="write a comment..."
                        value={''}
                        onChange={() => {}}
                    ></textarea>
                    <div className="flex gap-5">
                        {/* Full-width submit button */}
                        <div className="mt-auto h-[10%]">
                            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                            <button
                                type="submit"
                                className="mt-2 mb-2 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                            >
                                Comment
                            </button>
                        </div>
                            <ImageUploader className='mt-2'/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentList;
