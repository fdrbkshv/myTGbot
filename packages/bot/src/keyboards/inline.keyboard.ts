import { Movie } from '../../../shared/src/types/movie.types';
import { InlineKeyboard } from 'telegraf';

export class InlineKeyboards {
  static createMovieKeyboard(movies: Movie[], cache: Map<string, any>): any {
    return {
      inline_keyboard: movies.map((movie, index) => {
        const callbackId = `mv_${index}_${Date.now()}`;
        
        cache.set(callbackId, {
          id: movie.id,
          title: movie.title,
          year: movie.year,
          source: movie.source
        });
        
        return [{
          text: `${movie.title} (${movie.year}) ${movie.rating ? '⭐' : ''}`,
          callback_data: callbackId
        }];
      })
    };
  }

  static createReactionKeyboard(): any {
    return {
      inline_keyboard: [[
        { text: '👍', callback_data: 'react_like' },
        { text: '👎', callback_data: 'react_dislike' }
      ]]
    };
  }
}