'use client';

import React, { useRef } from 'react';
import { useState } from 'react';
import Title from '../General/Title';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import InputField from '../General/InputField';
import ImageInputField from '../General/ImageInputField';
import SelectInput from '../General/SelectInput';
import FollowersList from '../General/FollowersList';
import PostCard from './PostCard';
import CommentCard from './CommentCard';
import ImageUploader from '../General/ImageUploader';
import { validateImage } from '@/lib/validation/imageValidation';

export type Comment = {
    postID: number;
    commentID: number;
    commentText: string;
    commenterNickname: string;
    commenterAvatarNumber?: number;
    commentProfileImageId?: number;
    commentImageId?: number;
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

const MAX_COMMENT_LENGTH = 300;

async function validateComment(commentText: string, file: File | null): Promise<string | null> {
    const trimmed = commentText.trim();

    if (!trimmed && !file) {
        return 'Comment cannot be empty. Write something or attach an image.';
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
        return `Comment is too long. Maximum ${MAX_COMMENT_LENGTH} characters allowed (currently ${trimmed.length}).`;
    }

    if (file) {
        // Use the centralized image validation
        const imageError = await validateImage(file);
        if (imageError) {
            return imageError;
        }
    }

    return null;
}

async function handleCreateComment(formData: FormData): Promise<string | null> {
    try {
        const res = await fetchWithAuth('http://localhost:8080/api/createComment', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            return errorData?.message || 'Failed to create comment';
        }

        return null;
    } catch (err) {
        return err instanceof Error ? err.message : 'Failed to create comment';
    }
}

const CommentList: React.FC<CommentListProps> = ({ postID, error, comments, onCommentAdded }) => {
    const commentRef = useRef<HTMLTextAreaElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [comment, setComment] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // Handle image validation errors from ImageUploader
    const handleImageError = (error: string | null) => {
        if (error) {
            setFormError(error);
        } else {
            // Clear error if it was an image error
            if (formError && formError.includes('image')) {
                setFormError(null);
            }
        }
    };

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

        setFormError(null);

        // Frontend validation
        const validationError = await validateComment(comment, file);
        if (validationError) {
            setFormError(validationError);
            return;
        }

        const errorMsg = await handleCreateComment(formData);

        if (errorMsg) {
            setFormError(errorMsg);
        } else {
            // Clear inputs on success
            setComment('');
            setFile(null);
            if (onCommentAdded) onCommentAdded();
        }
    }

    return (
        <div className="rounded-xl h-full bg-gray-900 flex flex-col overflow-hidden border border-gray-700">
            <div className="flex-shrink-0 flex items-center gap-2 py-3 px-4 border-b border-gray-700">
                <i className="fa-regular fa-comments text-blue-400 text-sm"></i>
                <span className="text-sm font-semibold text-white">
                    Comments{comments && comments.length > 0 ? ` (${comments.length})` : ''}
                </span>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
                <div className="p-3 flex flex-col gap-1 bg-gray-900 overflow-y-auto hide-scrollbar flex-1">
                    {!comments || comments.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">
                            No comments yet. Be the first to comment!
                        </p>
                    ) : (
                        comments.map((comment) => (
                            <CommentCard
                                key={comment.commentID}
                                postID={postID}
                                commentID={comment.commentID}
                                commentText={comment.commentText}
                                commenterNickname={comment.commenterNickname}
                                commenterAvatarNumber={comment.commenterAvatarNumber}
                                commenterProfileImageUrl={
                                    comment.commentProfileImageId &&
                                    comment.commentProfileImageId !== 0
                                        ? `http://localhost:8080/api/image?id=${comment.commentProfileImageId}`
                                        : undefined
                                }
                                commentImageUrl={
                                    comment.commentImageId && comment.commentImageId !== 0
                                        ? `http://localhost:8080/api/image?id=${comment.commentImageId}`
                                        : undefined
                                }
                                createdAt={comment.commentTime}
                                likesCount={comment.likesCount}
                                dislikesCount={comment.dislikesCount}
                            />
                        ))
                    )}
                </div>
                <form
                    onSubmit={(e) => handleCommentSubmit(e)}
                    className="flex-shrink-0 px-3 py-3 border-t border-gray-700 bg-gray-800/60"
                >
                    {(error || formError) && (
                        <p className="text-rose-400 text-xs mb-2 px-1">{formError || error}</p>
                    )}
                    {/* Image preview */}
                    {file && (
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="flex items-center gap-2 bg-gray-700/60 rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
                                <i className="fa-regular fa-image text-blue-400"></i>
                                <span className="truncate max-w-[150px]">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="text-gray-400 hover:text-white ml-1 cursor-pointer"
                                >
                                    <i className="fa-solid fa-xmark text-xs"></i>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-end gap-1.5 bg-gray-800 border border-gray-600 rounded-xl px-1 py-1 focus-within:border-blue-500 transition-colors">
                        <textarea
                            id="message"
                            className="flex-1 bg-transparent text-gray-100 text-sm block w-full px-2 py-1.5 placeholder-gray-500 resize-none outline-none max-h-32 overflow-y-auto"
                            placeholder="Write a comment..."
                            rows={1}
                            value={comment}
                            onChange={(e) => {
                                setComment(e.target.value);
                                const el = e.target;
                                el.style.height = 'auto';
                                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    e.currentTarget.form?.requestSubmit();
                                }
                            }}
                        ></textarea>
                        <div className="flex items-center shrink-0 gap-0.5 pb-0.5">
                            <ImageUploader
                                file={file}
                                setFile={setFile}
                                onError={handleImageError}
                            />
                            <button
                                type="submit"
                                className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
                                title="Send"
                            >
                                <i className="fa-solid fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentList;
