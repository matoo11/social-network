'use client';

import React, { useRef } from 'react';
import { useState } from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import ImageInputField from '../ImageInputField/ImageInputField';
import SelectInput from '../SelectInput/SelectInput';
import FollowersList from '../FollowersList/FollowersList';
import PostCard from '../PostCard/PostCard';
import CommentCard from '../CommentCard/CommentCard';
import ImageUploader from '../ImageUploader/ImageUploader';

export type Comment = {
    postID: number;
    commentID: number;
    commentText: string;
    commenterNickname: string;
    commentProfileImageId?: number;
    commentImageId?: number ;
    commentTime: string;
    likesCount: number;
    dislikesCount: number;
};

type CommentListProps = {
    postID: number;
    error?: string;
    comments?: Comment[];
    onCommentAdded?: () => void;
};

type CommentData = {
    commentText: string;
    // commentImage?: File;
    postID: number;
};

async function handleCreateComment(formData: FormData) {
    try {
        const res = await fetch('http://localhost:8080/api/createComment', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Failed to create comment');
        }

        //   router.push('/login');
    } catch (err: unknown) {
        console.error('Error creating comment:', err);
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error('Unexpected error occurred');
        }
    }
}

const CommentList: React.FC<CommentListProps> = ({ postID, error, comments, onCommentAdded }) => {
    const commentRef = useRef<HTMLTextAreaElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [comment, setComment] = useState('');

    async function handleCommentSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data: CommentData = {
            commentText: comment,
            postID: postID,
        };
        const formData = new FormData();
        // formData.append('commentText', comment);
        formData.append('data', JSON.stringify(data));
        if (file) formData.append('image', file);
        console.log('Submitting comment:', comment);
        console.log('With file:', file);

        try {
            await handleCreateComment(formData);
        } catch (err) {
            //TODO: show error to user
            console.error('Error submitting comment:', err);
        }

        // Clear inputs
        setComment('');
        setFile(null);

        if (onCommentAdded) onCommentAdded();
    }

    return (
        <div className="border-2 border-gray-600 rounded-lg h-full bg-gray-900 flex flex-col">
            <div className="flex justify-center gap-5 items-center h-[5%] pt-2 border-b-2 border-gray-600 dark:bg-gray-900">
                <Title text="Comments" />
            </div>

            <div className="flex flex-col h-[95%]">
                <div className="p-4 flex flex-col items-center gap-5 bg-gray-100 dark:bg-gray-900 py-5 overflow-y-auto hide-scrollbar flex-grow">
                    {comments?.map((comment) => (
                        <CommentCard
                            key={comment.commentID}
                            postID={postID}
                            commentID={comment.commentID}
                            commentText={comment.commentText}
                            commenterNickname={comment.commenterNickname}
                            commenterAvatarNumber={comment.commentProfileImageId || 1}
                            commenterProfileImageUrl={comment.commentProfileImageId !== 0 ? `http://localhost:8080/api/image?id=${comment.commentProfileImageId}` : undefined}
                            commentImageUrl={comment.commentImageId !== 0 ? `http://localhost:8080/api/image?id=${comment.commentImageId}` : undefined}
                            createdAt={comment.commentTime}
                            likesCount={comment.likesCount}
                            dislikesCount={comment.dislikesCount}
                        />
                    ))}
                </div>
                <form
                    onSubmit={(e) => handleCommentSubmit(e)}
                    className=" px-5 pt-2 h-[25%] mt-auto border-t-2 border-gray-600"
                >
                    <textarea
                        id="message"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white resize-none"
                        placeholder="write a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
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
                        <ImageUploader file={file} setFile={setFile} className="mt-2" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentList;
