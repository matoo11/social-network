export type Post = {
  postID: number;
  title: string;
  content: string;
  posterNickname?: string;
  posterProfileImageUrl?: string;
  postImageUrl?: string;
  createdAt?: string;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
};

export type PostCardUIProps = Post & {
  onLike?: () => void;
  onDislike?: () => void;
  onComment?: () => void;
};