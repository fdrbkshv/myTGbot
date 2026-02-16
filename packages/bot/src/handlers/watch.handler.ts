/*import { Context } from 'telegraf';
import { MyContext } from '../types/context';

export async function watchHandler(ctx: MyContext) {
  if (!ctx.session) ctx.session = {};
  ctx.session.awaitingMovie = true;
  await ctx.reply('Какой фильм смотрим сегодня?'); // проработать сообщение
} */
import { MyContext } from '../types/context';
import { ReplyKeyboards } from '../keyboards/reply.keyboard';

export async function watchHandler(ctx: MyContext) {
  if (!ctx.session) ctx.session = {};
  ctx.session.awaitingMovie = true;
  
  await ctx.reply(
    '🎬 Отправь название фильма:',
    ReplyKeyboards.searchingMenu()
  );
}