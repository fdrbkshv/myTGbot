/*import { Context } from 'telegraf';

export async function startHandler(ctx: Context) {
  await ctx.reply(
    '🎬 Добро пожаловать в Movie Companion!\n\n' +
    'Команды:\n' +
    '/watch - найти фильм и получить комментарии\n' +
    '/key - получить API ключ для OMDb\n' +
    '/restart - рестарт бота\n' +// вот эти команды добавить!
    '/off - выключить бота\n' +//
    '/on - включить бота\n' +//
    '/status - статус бота\n' +//
    'Или просто отправь название фильма который мы с тобой посмотрим'
  );
} */
import { MyContext } from '../types/context';
import { ReplyKeyboards } from '../keyboards/reply.keyboard';

export async function startHandler(ctx: MyContext) {
  const isAdmin = ctx.from?.id === 833359210; // Твой ID
  
  await ctx.reply(
    '🎬 Добро пожаловать в Movie Companion!\n\n' +
    'Я помогу тебе найти интересные факты о фильмах во время просмотра.\n\n' +
    'Используй кнопки ниже для навигации:',
    isAdmin ? ReplyKeyboards.adminMenu() : ReplyKeyboards.mainMenu()
  );
}


// видимо этот хендлер тоже не используется...