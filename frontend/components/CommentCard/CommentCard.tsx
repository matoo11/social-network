import React from 'react';
import CreationTime from '../CreationTime/CreationTime';
import ProfileImage from '../ProfileImage/ProfileImage';
import PostImage from '../PostImage/PostImage';
import Username from '../Username/Username';
import Title from '../Title/Title';
import TextElement from '../TextElement/TextElement';
import Reaction from '../Reaction/Reaction';

export type CommentCardUIProps = {
    postID: number;
    commentID: number;
    commentText: string;
    commenterNickname?: string;
    commenterProfileImageUrl?: string;
    createdAt?: string;
    likesCount?: number;
    dislikesCount?: number;
};

const CommentCard: React.FC<CommentCardUIProps> = ({
    postID,
    commentID,
    commentText,
    commenterNickname = 'Unknown',
    commenterProfileImageUrl = '',
    createdAt,
    likesCount = 0,
    dislikesCount = 0,
}) => {
    const handleCommentLike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Liked post ${postID}`);
    };

    const handleCommentDislike = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Disliked post ${postID}`);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 w-full min-w-sm">
            {/* Profile Section */}
            <div className="flex items-center gap-3 px-5 py-2">
                <div className="flex w-6 h-6 rounded-none items-center justify-center">
                    <ProfileImage
                        imageUrl={commenterProfileImageUrl || ''}
                        altText={`${commenterNickname}'s profile`}
                    />
                </div>
                <Username text={commenterNickname} />
                <CreationTime time={String(createdAt)} />
            </div>

            {/* Title & Additional Content */}
            <div className="px-5">
                <TextElement text={commentText}/>
            </div>

            {/* Reactions Section */}
            <div className="flex items-center rounded-b gap-3 px-5 py-1 border-t border-gray-700 bg-gray-700">
                <Reaction onClick={handleCommentLike} type="like" count={likesCount} size='xs'/>
                <Reaction onClick={handleCommentDislike} type="dislike" count={dislikesCount} size='xs' />
            </div>
        </div>
    );
};

export default CommentCard;
