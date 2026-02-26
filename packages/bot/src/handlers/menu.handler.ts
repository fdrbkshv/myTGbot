import { MyContext } from '../types/context';
import { ReplyKeyboards } from '../keyboards/reply.keyboard';

export async function menuHandler(ctx: MyContext, text: string) {
  if (!ctx.session) ctx.session = {};
  
  const isAdmin = ctx.from?.id === 833359210;
  
  switch (text) {
    case '🎬 Найти фильм':
      ctx.session.awaitingMovie = true;
      ctx.session.manualMode = false;
      await ctx.reply('🎬 Отправь название фильма:', ReplyKeyboards.searchingMenu());
      return true;
      
    case '⏱️ Ручной режим':
      if (ctx.session.movieTitle) {
        ctx.session.manualMode = true;
        ctx.session.awaitingMovie = false;
        await ctx.reply(
          '⏱️ Отправь время в формате "минуты:секунды"\n' +
          'Например: 45:30 или 120',
          ReplyKeyboards.manualModeMenu()
        );
      } else {
        await ctx.reply(
          '❌ Сначала найди фильм через /watch или кнопку "Найти фильм"',
          ReplyKeyboards.mainMenu()
        );
      }
      return true;
      
    case 'ℹ️ Помощь':
      await ctx.reply(
        '📚 **Как пользоваться ботом:**\n\n' +
        '1️⃣ Нажми "Найти фильм" и введи название\n' +
        '2️⃣ Выбери фильм из списка\n' +
        '3️⃣ Получи 3 случайных комментария\n' +
        '4️⃣ Можешь ввести конкретное время для комментария\n\n' +
        'Реакции 👍/👎 помогают улучшить рекомендации!',
        { parse_mode: 'Markdown' }
      );
      return true;
      
    case '📊 Статус':
      const status = global.isBotActive ? '🟢 Активен' : '🔴 Отключен';
      const movieInfo = ctx.session.movieTitle 
        ? `\n\nТекущий фильм: ${ctx.session.movieTitle}` 
        : '';
      await ctx.reply(`Статус бота: ${status}${movieInfo}`);
      return true;
      
    case '❌ Отменить поиск':
      ctx.session.awaitingMovie = false;
      await ctx.reply('Поиск отменен', ReplyKeyboards.mainMenu());
      return true;
      
    case '❌ Выйти из ручного режима':
      ctx.session.manualMode = false;
      await ctx.reply('Ручной режим отключен', ReplyKeyboards.mainMenu());
      return true;
      
    case '🔙 Главное меню':
      ctx.session.awaitingMovie = false;
      ctx.session.manualMode = false;
      await ctx.reply('Главное меню:', isAdmin ? ReplyKeyboards.adminMenu() : ReplyKeyboards.mainMenu());
      return true;
      
    case '🔴 Выключить':
      if (isAdmin) {
        global.isBotActive = false;
        await ctx.reply('🔴 Бот выключен. Для включения нажми "🟢 Включить"');
        setTimeout(() => process.exit(0), 1000);
      }
      return true;
      
    case '🟢 Включить':
      if (isAdmin) {
        global.isBotActive = true;
        await ctx.reply('🟢 Бот включен');
      }
      return true;
      
    case '🔄 Перезапустить':
      if (isAdmin) {
        await ctx.reply('🔄 Перезапускаю бота...');
        setTimeout(() => process.exit(0), 1000);
      }
      return true;
      
    default:
      return false;
  }
}




// из этого половина не используется)
//видимо нихуя отсюда не используется
