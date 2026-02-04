import React from 'react';
import CreationTime from '../CreationTime/CreationTime';
import ProfileImage from '../ProfileImage/ProfileImage';
import PostImage from '../PostImage/PostImage';
import Username from '../Username/Username';
import Title from '../Title/Title';
import TextElement from '../TextElement/TextElement';
import Reaction from '../Reaction/Reaction';

export type PostCardUIProps = {
    postID: number;
    title: string;
    content: string;
    posterNickname?: string;
    posterAvatarNumber?: number;
    posterProfileImageUrl?: string;
    postImageUrl?: string;
    createdAt?: string;
    likesCount?: number;
    dislikesCount?: number;
    commentsCount?: number;
    postContentPopup?: (postID: number) => void;
};

const PostCardUI: React.FC<PostCardUIProps> = ({
    postID,
    title,
    content,
    posterNickname = 'Unknown',
    posterAvatarNumber = 1,
    posterProfileImageUrl = '',
    postImageUrl = '',
    createdAt,
    likesCount = 0,
    dislikesCount = 0,
    commentsCount,
    postContentPopup,
}) => {
    const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Liked post ${postID}`);
    };

    const handleDislike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Disliked post ${postID}`);
    };

    const handleComment = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Commented on post ${postID}`);
        if (postContentPopup) {
            postContentPopup(postID);
        }
    };
    if (postImageUrl === 'http://localhost:8080/api/image?id=null') {
        postImageUrl = '';
    }
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 w-full min-w-sm">
            {/* Profile Section */}
            <div className="flex items-center gap-3 px-5 py-3">
                <div className="flex w-10 h-10 rounded-none items-center justify-center">
                    <ProfileImage
                        imageUrl={posterProfileImageUrl || ''}
                        avatarNumber={posterAvatarNumber}
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
                <div className="">
                    <PostImage imageUrl={postImageUrl} />
                </div>
            )}

            {/* Reactions Section */}
            <div className="flex items-center rounded-b gap-3 px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <Reaction onClick={handleLike} type="like" count={likesCount} />
                <Reaction onClick={handleDislike} type="dislike" count={dislikesCount} />
                {commentsCount !== undefined && (
                    <Reaction onClick={handleComment} type="comment" count={commentsCount} />
                )}
            </div>
        </div>
    );
};

export default PostCardUI;
