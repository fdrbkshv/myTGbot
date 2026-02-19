export interface User {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'watching' | 'pending';
  lastInteraction: Date;
  nextReminder?: Date;
  currentMovie?: {
    id: string;
    title: string;
    startedAt: Date;
    lastTimestamp?: number;
  };
  movieHistory: Array<{
    movieId: string;
    movieTitle: string;
    watchedAt: Date;
    rating?: number;
  }>;
}

export interface UserSession {
  userId: number;
  state: 'idle' | 'awaiting_movie' | 'awaiting_genre' | 'awaiting_timestamp' | 'watching';
  movieId?: string;
  movieTitle?: string;
  lastMessageId?: number;
  reminderCount?: number;
}