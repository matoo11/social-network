import React from 'react';
import CreationTime from '../CreationTime/CreationTime';
import ProfileImage from '../ProfileImage/ProfileImage';
import Username from '../Username/Username';

export type CommentCardUIProps = {
    postID: number;
    commentID: number;
    commentText: string;
    commenterNickname?: string;
    commenterAvatarNumber?: number;
    commenterProfileImageUrl?: string;
    commentImageUrl?: string;
    createdAt?: string;
    likesCount?: number;
    dislikesCount?: number;
};

const CommentCard: React.FC<CommentCardUIProps> = ({
    postID,
    commentID,
    commentText,
    commenterNickname = 'Unknown',
    commenterAvatarNumber = 1,
    commenterProfileImageUrl = '',
    commentImageUrl = '',
    createdAt,
    likesCount = 0,
    dislikesCount = 0,
}) => {
    const handleCommentLike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Post ID: ${postID}`);
        console.log(`Liked Comment ID: ${commentID}`);
    };

    const handleCommentDislike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Post ID: ${postID}`);
        console.log(`Disliked Comment ID: ${commentID}`);
    };

    return (
        <div className="w-full">
            <div className="flex gap-2.5">
                {/* Avatar */}
                <div className="w-7 h-7 shrink-0 mt-0.5">
                    <ProfileImage
                        imageUrl={commenterProfileImageUrl || ''}
                        altText={`${commenterNickname}'s profile`}
                        avatarNumber={commenterAvatarNumber}
                    />
                </div>

                {/* Bubble */}
                <div className="bg-gray-700/50 rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-md min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-0.5">
                        <Username text={commenterNickname} className="!text-xs" />
                        <span className="text-gray-600 text-[10px] select-none">&middot;</span>
                        {createdAt && (
                            <CreationTime time={String(createdAt)} className="!text-[11px]" />
                        )}
                    </div>

                    {/* Text */}
                    <p className="text-[13px] leading-relaxed text-gray-300 break-words">
                        {commentText}
                    </p>

                    {/* Image */}
                    {commentImageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={commentImageUrl}
                                alt="Comment attachment"
                                className="max-h-48 w-auto rounded-lg object-contain"
                            />
                        </div>
                    )}

                    {/* Reactions inside bubble */}
                    <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-gray-600/30">
                        <button
                            onClick={handleCommentLike}
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                            <i className="fa-regular fa-thumbs-up" aria-hidden="true"></i>
                            {likesCount > 0 && <span className="tabular-nums">{likesCount}</span>}
                        </button>
                        <button
                            onClick={handleCommentDislike}
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            <i className="fa-regular fa-thumbs-down" aria-hidden="true"></i>
                            {dislikesCount > 0 && (
                                <span className="tabular-nums">{dislikesCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentCard;
