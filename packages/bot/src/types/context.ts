import { Context as TelegrafContext } from 'telegraf';

export interface SessionData {
  awaitingMovie?: boolean;
  movieId?: string;
  movieTitle?: string;
  movieYear?: string;
  manualMode?: boolean;
}

export interface MyContext extends TelegrafContext {
  session: SessionData;
}