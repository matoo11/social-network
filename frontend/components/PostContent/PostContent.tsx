'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';
import Title from '../Title/Title';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import PostCard from '../PostCard/PostCard';
import CommentList from '../CommentList/CommentList';
import { Comment } from '../CommentList/CommentList';

type PostContentProps = {
    postID: number;
};

interface APIResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
    authenticated: boolean;
}

interface BackendPost {
    postId: number;
    postTitle: string;
    postText: string;
    postType: string;
    posterNickname: string;
    posterAvatarNumber?: number;
    postImageId?: number;
    postTime: string;
    numberOfLikes: number;
    numberOfDislikes: number;
    numberOfComments: number;
    comments: BackendDisplayedComment[];
}

interface BackendDisplayedComment {
    postId: number;
    commentId: number;
    commentText: string;
    commenterNickname: string;
    commenterAvatarNumber?: number;
    commentProfileImageId: number;
    commentImageId: number;
    commentTime: string;
    numberOfLikes: number;
    numberOfDislikes: number;
}

const selectInputOptions = [
    { optionText: 'Public', optionValue: 1 },
    { optionText: 'Followers Only', optionValue: 2 },
    { optionText: 'Private', optionValue: 3 },
];

export async function getPostByID(id: number): Promise<APIResponse<BackendPost>> {
    console.log('Response received for getPostByID');
    try {
        const res = await fetchWithAuth('http://localhost:8080/api/getPostByID', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Get post failed');
        }
        const data: APIResponse<BackendPost> = await res.json();
        console.log('Fetched Post Data:', data);
        return data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('Unexpected error occurred');
        }
    }
}

const PostContent: React.FC<PostContentProps> = ({ postID }) => {
    const [currentPostData, setCurrentPostData] = useState<BackendPost | null>(null);
    const [currentCommentsData, setCurrentCommentsData] = useState<Comment[] | undefined>(
        undefined,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await getPostByID(postID);

            const PostData = res.data;

            setCurrentPostData(PostData);
            const CommentListData = PostData.comments || [];

            const mappedComments: Comment[] = CommentListData.map((c: BackendDisplayedComment) => ({
                postID: c.postId,
                commentID: c.commentId,
                commentText: c.commentText,
                commenterNickname: c.commenterNickname,
                commenterAvatarNumber: c.commenterAvatarNumber,
                commentProfileImageId: c.commentProfileImageId ?? undefined,
                commentImageId: c.commentImageId ?? undefined,
                commentTime: c.commentTime,
                likesCount: c.numberOfLikes ?? 0,
                dislikesCount: c.numberOfDislikes ?? 0,
            }));

            setCurrentCommentsData(mappedComments);
            console.log('Mapped Comments:', mappedComments);
            console.log('post data', PostData);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
            console.error('Error fetching post data:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPost();
    }, [postID]);

    return (
        <div className="border-2 border-gray-600 rounded-lg h-full bg-gray-900 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-center items-center py-3 px-4 border-b-2 border-gray-600 bg-gray-900">
                <Title text="Post Content" />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Post Section */}
                <div className="lg:w-2/5 p-4 overflow-y-auto hide-scrollbar border-b-2 lg:border-b-0 lg:border-r-2 border-gray-600">
                    {loading && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Loading post...</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}
                    {currentPostData && (
                        <PostCard
                            postID={postID}
                            posterNickname={currentPostData.posterNickname}
                            posterAvatarNumber={currentPostData.posterAvatarNumber}
                            createdAt={currentPostData.postTime}
                            postImageUrl={
                                currentPostData.postImageId
                                    ? 'http://localhost:8080/api/image?id=' +
                                      currentPostData.postImageId
                                    : ''
                            }
                            title={currentPostData.postTitle}
                            content={currentPostData.postText}
                            likesCount={currentPostData.numberOfLikes}
                            dislikesCount={currentPostData.numberOfDislikes}
                        />
                    )}
                </div>

                {/* Comments Section */}
                <div className="lg:w-3/5 flex-1 min-h-0 p-4">
                    <CommentList
                        postID={postID}
                        comments={currentCommentsData}
                        onCommentAdded={fetchPost}
                    />
                </div>
            </div>
        </div>
    );
};

export default PostContent;
