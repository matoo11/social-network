'use client';

import React, { useEffect } from 'react';
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

export async function getPostByID(id: number) {
    try {
        const res = await fetch('http://localhost:8080/api/getPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Get post failed');
        }

        return res;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('Unexpected error occurred');
        }
    }
}

export async function getAllPosts() {
    try {
        const res = await fetch('http://localhost:8080/api/getAllPosts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Get All posts failed');
        }

        return res;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('Unexpected error occurred');
        }
    }
}

const PostContent: React.FC<PostContentProps> = ({ postID }) => {
    const [currentPostData, setCurrentPostData] = useState<any | null>(null);
    const [allPostsData, setAllPostsData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPostByID(postID);
                const data = await res.json(); // parse JSON response
                setCurrentPostData(data);
                console.log('Post data fetched successfully:', data);
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

    //     useEffect(() => {
    //     const fetchAllPosts = async () => {
    //         setLoading(true);
    //         setError(null);

    //         try {
    //             const res = await getAllPosts();
    //             const data = await res.json(); // parse JSON response
    //             setAllPostsData(data);
    //             console.log('All Posts data fetched successfully:', data);
    //         } catch (err: unknown) {
    //             if (err instanceof Error) {
    //                 setError(err.message);
    //             } else {
    //                 setError('Unexpected error occurred');
    //             }
    //             console.error('Error fetching post data:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchAllPosts();
    // });

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
                            posterNickname={currentPostData.UserName}
                            createdAt={currentPostData.CreationTime}
                            postImageUrl={'http://localhost:8080/api/image?id=' + currentPostData.ImageID}
                            title={currentPostData.PostTitle}
                            content={currentPostData.PostText}
                            likesCount={currentPostData.likesCount}
                            dislikesCount={currentPostData.dislikesCount}
                        />
                    )}
                </div>
                <div className="p-4 h-[70vh] flex flex-col">
                    <CommentList postID={postID} />
                </div>
            </div>
        </div>
    );
};

export default PostContent;
