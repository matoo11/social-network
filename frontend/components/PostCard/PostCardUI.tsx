import React from 'react';
import styles from './PostCard.module.css';
import Image from 'next/image';
import { PostCardUIProps } from './types';

const PostCardUI: React.FC<PostCardUIProps> = ({
    postID,
    title,
    content,
    posterNickname = 'Anonymous',
    posterProfileImageUrl = '/default-profile.png',
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
        <div className={styles['post-content']}>
            <div className={styles['post-container']}>
                <img
                    src={posterProfileImageUrl}
                    alt="user"
                    className={styles['profile-photo-md'] + ' pull-left'}
                />
                <div className={styles['post-detail']}>
                    <div className={styles['user-info']}>
                        <h3>
                            <b>{posterNickname}</b>
                        </h3>
                        <p className={styles['text-muted']}>
                            Posted on 
                            {createdAt}
                        </p>
                    </div>
                    <div className={styles['post-text']}>
                        <p>{content}</p>
                    </div>
                    <div className={styles['reaction']}>
                        <form
                            id="post_like-${d.postID}"
                            method="POST"
                            className={styles['reaction-form']}
                        >
                            <input type="hidden" name="postID" value="${d.postID}" />
                            <button className={`${styles['btn']} ${styles['text-gray']}`}>
                                <i className='fa fa-thumbs-up'>
                                    {likesCount}
                                </i>
                            </button>
                        </form>
                        <form
                            id="post_dislike-${d.postID}"
                            method="POST"
                            className={styles['reaction-form']}
                        >
                            <input type="hidden" name="postID" value="${d.postID}" />
                            <button className={`${styles['btn']} ${styles['text-gray']}`}>
                                <i className='fa fa-thumbs-down'>
                                    {dislikesCount}
                                </i>
                            </button>
                        </form>
                    </div>
                    <div className={styles['line-divider']}></div>
                    <button
                        className={styles['post-submit'] + ' toggle-comments-btn'}
                        data-post-id="${d.postID}"
                    >
                        Show Comments ({commentsCount})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCardUI;
