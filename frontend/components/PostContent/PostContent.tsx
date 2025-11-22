'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';
import Title from '../Title/Title';
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
    postImageId: number;
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

export async function getPostByID(id: number): Promise<APIResponse<BackendPost>>  {
    try {
        const res = await fetch('http://localhost:8080/api/getPostByID', {
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
    const [currentCommentsData, setCurrentCommentsData] = useState<Comment[] | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
                    commentProfileImageId: c.commentProfileImageId ?? undefined,
                    commentImageId: c.commentImageId ?? undefined,
                    commentTime: c.commentTime,
                    likesCount: c.numberOfLikes ?? 0,
                    dislikesCount: c.numberOfDislikes ?? 0,
                }));

                setCurrentCommentsData(mappedComments);
                console.log('Mapped Comments:', mappedComments);
                console.log("post data", PostData)
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

        fetchPost();
    }, [postID]);

    return (
        <div className="border-2 border-gray-600 rounded-lg h-full bg-gray-900 flex flex-col">
            <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 dark:bg-gray-900">
                <Title text="Post Content" />
            </div>

            <div className="grid grid-cols-[1fr_2fr] divide-x divide-gray-300 h-[92.5%]">
                <div className="p-4 h-[65vh] flex flex-col">
                    {loading && <p>Loading post...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {currentPostData && (
                        <PostCard
                            postID={postID}
                            posterNickname={currentPostData.posterNickname}
                            createdAt={currentPostData.postTime}
                            postImageUrl={
                                'http://localhost:8080/api/image?id=' + currentPostData.postImageId
                            }
                            title={currentPostData.postTitle}
                            content={currentPostData.postText}
                            likesCount={currentPostData.numberOfLikes}
                            dislikesCount={currentPostData.numberOfDislikes}
                        />
                    )}
                </div>
                <div className="p-4 h-[70vh] flex flex-col">
                    <CommentList postID={postID} comments={currentCommentsData}/>
                </div>
            </div>
        </div>
    );
};

export default PostContent;
