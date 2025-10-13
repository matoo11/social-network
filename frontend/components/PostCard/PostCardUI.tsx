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
        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            {/* Profile Section */}
            <div className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 overflow-hidden rounded-none">
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

            {/* Post Image */}
            {postImageUrl && (
                <div className="mt-4">
                    <PostImage imageUrl={postImageUrl} />
                </div>
            )}

            {/* Title & Additional Content */}
            <div className="p-5">
                <Title text={title} />
                <TextElement text={content} />
            </div>
        </div>
    );
};

export default PostCardUI;
