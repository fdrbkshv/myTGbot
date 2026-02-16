export interface Comment {
  id: string;
  movieId: string;
  movieTitle: string;
  timestamp: number; // секунды
  text: string;
  createdAt: Date;
}

export interface CommentWithReactions extends Comment {
  likes: number;
  dislikes: number;
}

export interface Reaction {
  commentId: string;
  userId: number;
  type: 'like' | 'dislike';
  createdAt: Date;
}