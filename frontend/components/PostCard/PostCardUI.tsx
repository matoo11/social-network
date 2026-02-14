import React from 'react';
import CreationTime from '../CreationTime/CreationTime';
import ProfileImage from '../ProfileImage/ProfileImage';
import PostImage from '../PostImage/PostImage';
import Username from '../Username/Username';
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
        <article className="bg-gray-800 border border-gray-700 rounded-2xl w-full overflow-hidden transition-all duration-200 hover:border-gray-500 hover:shadow-lg hover:shadow-black/20">
            {/* Author Header */}
            <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
                <div className="w-9 h-9 shrink-0">
                    <ProfileImage
                        imageUrl={posterProfileImageUrl || ''}
                        avatarNumber={posterAvatarNumber}
                        altText={`${posterNickname}'s profile`}
                    />
                </div>
                <div className="min-w-0 flex-1 flex items-center gap-2">
                    <Username text={posterNickname} />
                    <span className="text-gray-600 text-xs select-none">·</span>
                    {createdAt && <CreationTime time={String(createdAt)} />}
                </div>
            </div>

            {/* Post Body */}
            <div className="px-4 pb-2.5">
                {title && (
                    <h3 className="text-[15px] font-semibold text-white leading-snug mb-1">
                        {title}
                    </h3>
                )}
                {content && (
                    <TextElement
                        text={content}
                        className="line-clamp-4 !text-[14px] !leading-relaxed"
                    />
                )}
            </div>

            {/* Post Image */}
            {postImageUrl && <PostImage imageUrl={postImageUrl} />}

            {/* Reactions Bar */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-t border-gray-700/60">
                <Reaction onClick={handleLike} type="like" count={likesCount} size="sm" />
                <Reaction onClick={handleDislike} type="dislike" count={dislikesCount} size="sm" />
                {commentsCount !== undefined && (
                    <Reaction
                        onClick={handleComment}
                        type="comment"
                        count={commentsCount}
                        size="sm"
                    />
                )}
            </div>
        </article>
    );
};

export default PostCardUI;
