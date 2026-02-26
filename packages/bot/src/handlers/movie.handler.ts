import { MyContext } from '../types/context';
import { MovieService } from '../services/movie.service';
import { InlineKeyboards } from '../keyboards/inline.keyboard';
import { ReplyKeyboards } from '../keyboards/reply.keyboard';

const movieService = new MovieService();

async function deleteMessageAfterDelay(ctx: MyContext, messageId: number, delay: number = 3000) {
  setTimeout(async () => {
    try {
      await ctx.deleteMessage(messageId);
    } catch (error) {}
  }, delay);
}

export async function movieHandler(ctx: MyContext, text: string) {
  if (!ctx.session) ctx.session = {};
  ctx.session.awaitingMovie = false;
  
  const searchMsg = await ctx.reply('🔍 Ищу фильм...');
  await deleteMessageAfterDelay(ctx, searchMsg.message_id, 2000);
  
  const movies = await movieService.searchMovies(text);
  
  if (movies.length === 0) {
    const notFoundMsg = await ctx.reply(
      '❌ Фильм не найден.\n\n' +
      'Попробуй другое название или уточни год'
    );
    await deleteMessageAfterDelay(ctx, notFoundMsg.message_id, 4000);
    await ctx.reply('Что дальше?', ReplyKeyboards.mainMenu());
    return;
  }

  const moviesToShow = movies.slice(0, 5);
  const keyboard = InlineKeyboards.createMovieKeyboard(moviesToShow, (global as any).movieCache);

  await ctx.reply('Нашел несколько вариантов:', { 
    reply_markup: keyboard 
  });
}


// врядли используется.....
