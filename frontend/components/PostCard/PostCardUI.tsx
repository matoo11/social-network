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
    <div className={styles.postCardContainer}>
      <div className={styles.postCard}>
        <input type="hidden" name="postID" value={postID} />

        {/* Header */}
        <div className={styles.postCardHeader}>
          <Image
            className={styles.posterProfileImage}
            src={posterProfileImageUrl}
            alt="post-creator-icon"
            width={40}
            height={40}
          />
          <h1 className={styles.posterNickname}>{posterNickname}</h1>
          {createdAt && <p className={styles.postTime}>Posted on {createdAt}</p>}
        </div>

        {/* Title */}
        <div className={styles.postTitle}>
          <h1>{title}</h1>
        </div>

        {/* Category */}
        <div className={styles.postCategoryContainer}>
          <div className={styles.postCategory} title="general">
            <i className="fas fa-comments"></i>
          </div>
        </div>

        {/* Content */}
        <div className={styles.postText}>
          <p>{content}</p>
        </div>

        {/* Reactions */}
        <div className={styles.postReactions}>
          <button className={`${styles.reactionButton} ${styles.like}`} onClick={handleLike}>
            <i className="fas fa-thumbs-up"></i> {likesCount}
          </button>

          <button className={`${styles.reactionButton} ${styles.dislike}`} onClick={handleDislike}>
            <i className="fas fa-thumbs-down"></i> {dislikesCount}
          </button>

          <button className={`${styles.reactionButton} ${styles.comment}`} onClick={handleComment}>
            <i className="fa-regular fa-message"></i> {commentsCount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCardUI;
