import { MyContext } from '../types/context';
import { InlineKeyboards } from '../keyboards/inline.keyboard';

export class StateManager {
  static async handleMovieSearch(ctx: MyContext, query: string) {
    try {
      console.log('handleMovieSearch вызван с запросом:', query);
      
      const userId = ctx.from.id;
      const session = global.userService.getSession(userId);
      
      // Отправляем сообщение о поиске
      const searchMsg = await ctx.reply('🔍 **Ищу фильмы...**', { parse_mode: 'Markdown' });
      
      // Получаем фильмы
      const movies = await global.movieService.searchMovies(query);
      console.log('Найдено фильмов:', movies.length);
      
      // Удаляем сообщение о поиске
      try {
        await ctx.deleteMessage(searchMsg.message_id);
      } catch (e) {
        console.log('Не удалось удалить сообщение о поиске');
      }
      
      if (!movies || movies.length === 0) {
        await ctx.reply(
          '😕 **Ничего не нашел**\n\nПопробуй другое название или жанр.',
          { 
            parse_mode: 'Markdown',
            reply_markup: InlineKeyboards.helpKeyboard() 
          }
        );
        return;
      }
      
      // Показываем результаты
      const moviesToShow = movies.slice(0, 5);
      let message = '🎬 **Вот что я нашел:**\n\n';
      
      moviesToShow.forEach((movie, i) => {
        message += `${i + 1}. *${movie.title}* (${movie.year || '?'})\n`;
        if (movie.description) {
          message += `   📝 ${movie.description.substring(0, 80)}...\n`;
        }
        message += '\n';
      });
      
      message += '👇 **Выбери фильм:**';
      
      // Создаем клавиатуру
      const keyboard = InlineKeyboards.createMovieKeyboard(moviesToShow, global.movieCache);
      
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
      
    } catch (error) {
      console.error('Ошибка в handleMovieSearch:', error);
      await ctx.reply(
        '❌ **Произошла ошибка**\n\nПопробуй еще раз или позже.',
        { parse_mode: 'Markdown' }
      );
    }
  }

  static async handleTimestamp(ctx: MyContext, text: string) {
    try {
      const userId = ctx.from.id;
      const session = global.userService.getSession(userId);
      
      if (!session.movieTitle) {
        await ctx.reply('❌ Сначала выбери фильм');
        return;
      }
      
      if (text.toLowerCase().includes('нет') || text.toLowerCase().includes('не начал')) {
        session.state = 'idle';
        global.userService.updateSession(userId, session);
        
        await ctx.reply(
          '😴 **Не проблема!**\n\nМожет выберем другой фильм?',
          {
            parse_mode: 'Markdown',
            reply_markup: InlineKeyboards.movieActionsKeyboard()
          }
        );
        return;
      }
      
      const match = text.match(/^(\d+):?(\d+)?$/);
      
      if (!match) {
        await ctx.reply(
          '⏱️ **Неверный формат**\n\nОтправь время в формате "минуты:секунды"\nНапример: 45:30 или просто 45',
          {
            parse_mode: 'Markdown',
            reply_markup: InlineKeyboards.timestampKeyboard()
          }
        );
        return;
      }
      
      const minutes = parseInt(match[1]);
      const seconds = match[2] ? parseInt(match[2]) : 0;
      const timestamp = minutes * 60 + seconds;
      
      const searchMsg = await ctx.reply('🔍 **Вспоминаю интересные моменты...**', { parse_mode: 'Markdown' });
      
      // Генерируем комментарии
      const comments = global.movieService.generateCommentsBefore(
        session.movieTitle,
        timestamp,
        3
      );
      
      // Удаляем сообщение о поиске
      try {
        await ctx.deleteMessage(searchMsg.message_id);
      } catch (e) {}
      
      if (!comments || comments.length === 0) {
        await ctx.reply(
          '🍿 **В начале фильма пока ничего особенного**\n\nНаслаждайся просмотром!',
          {
            parse_mode: 'Markdown',
            reply_markup: InlineKeyboards.watchingKeyboard()
          }
        );
      } else {
        let message = '✨ **Вот что интересного произошло:**\n\n';
        comments.forEach(c => {
          const mins = Math.floor(c.timestamp / 60);
          const secs = c.timestamp % 60;
          message += `⏱️ *${mins}:${secs.toString().padStart(2, '0')}*\n`;
          message += `${c.text}\n\n`;
        });
        
        message += '👇 **Продолжаем просмотр?**';
        
        await ctx.reply(message, {
          parse_mode: 'Markdown',
          reply_markup: InlineKeyboards.watchingKeyboard()
        });
      }
      
      session.state = 'watching';
      global.userService.updateSession(userId, session);
      
    } catch (error) {
      console.error('Ошибка в handleTimestamp:', error);
      await ctx.reply('❌ Произошла ошибка');
    }
  }
}