import React from 'react';
import styles from './PostCard.module.css';
import Image from 'next/image';
import { PostCardUIProps } from './types';
import CreationTime from '../CreationTime/CreationTime';
import ProfileImage from '../ProfileImage/ProfileImage';
import PostImage from '../PostImage/PostImage';
import Username from '../Username/Username';
import Title from '../Title/Title';
import TextElement from '../TextElement/TextElement';

const PostCardUI: React.FC<PostCardUIProps> = ({
    postID,
    title,
    content,
    posterNickname = 'Anonymous',
    posterProfileImageUrl = '',
    postImageUrl = '',
    createdAt,
    likesCount = 0,
    dislikesCount = 0,
    commentsCount = 0,
    onLike,
    onDislike,
    onComment,
}) => {
    const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Liked post ${postID}`);
        if (onLike) onLike();
    };

    const handleDislike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Disliked post ${postID}`);
        if (onDislike) onDislike();
    };

    const handleComment = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Commented on post ${postID}`);
        if (onComment) onComment();
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 w-full min-w-sm">
            {/* Profile Section */}
            <div className="flex items-center gap-3 px-5 py-3">
                <div className="w-10 h-10 overflow-hidden rounded-none">
                    <ProfileImage
                        imageUrl={posterProfileImageUrl}
                        altText={`${posterNickname}'s profile`}
                    />
                </div>

                <div>
                    <Username text={posterNickname} />
                    <CreationTime time={String(createdAt)} />
                </div>
            </div>

            {/* Title & Additional Content */}
            <div className="px-5 mt-2">
                <Title text={title} />
                <TextElement text={content} />
            </div>

            {/* Post Image */}
            {postImageUrl && (
                <div className="mt-4">
                    <PostImage imageUrl={postImageUrl} />
                </div>
            )}
        </div>
    );
};

export default PostCardUI;
