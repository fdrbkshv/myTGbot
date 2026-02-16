import { MyContext } from '../types/context';
import { MovieService } from '../services/movie.service';
import { InlineKeyboards } from '../keyboards/inline.keyboard';

const movieService = new MovieService();

export async function movieHandler(ctx: MyContext, text: string) {
  if (!ctx.session) ctx.session = {};
  ctx.session.awaitingMovie = false;
  
  await ctx.reply('🔍 Ищу фильм...');
  
  const movies = await movieService.searchMovies(text);
  
  if (movies.length === 0) {
    return ctx.reply(
      '❌ Фильм не найден.\n\n' +
      'Попробуй:\n' +
      '• Ввести название на английском\n' +
      '• Уточнить год (например: "Матрица 1999")'
    );
  }

  const moviesToShow = movies.slice(0, 5);
  const keyboard = InlineKeyboards.createMovieKeyboard(moviesToShow, (global as any).movieCache);

  await ctx.reply('Нашел несколько вариантов:', { reply_markup: keyboard });
}