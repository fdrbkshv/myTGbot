export interface User {
  id: number; // Telegram ID
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface UserSession {
  userId: number;
  awaitingMovie?: boolean;
  movieId?: string;
  movieTitle?: string;
  movieYear?: string;
  manualMode?: boolean;
}