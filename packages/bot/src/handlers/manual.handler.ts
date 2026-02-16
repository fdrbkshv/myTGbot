import { MyContext } from '../types/context';
import { CommentService } from '../services/comment.service';
import { InlineKeyboards } from '../keyboards/inline.keyboard';

const commentService = new CommentService();

export async function manualHandler(ctx: MyContext, text: string) {
  if (!ctx.session?.manualMode || !ctx.session?.movieTitle) return false;
  
  const match = text.match(/^(\d+):?(\d+)?$/);
  if (!match) {
    await ctx.reply('Отправь время в формате "минуты:секунды" (например: 45:30 или 120)');
    return true;
  }
  
  const minutes = parseInt(match[1]);
  const seconds = match[2] ? parseInt(match[2]) : 0;
  const timestamp = minutes * 60 + seconds;
  
  await ctx.reply('🔍 Генерирую комментарий...');
  
  const comments = commentService.generateComments(ctx.session.movieTitle, 1);
  const comment = comments[0];
  
  const msg = await ctx.reply(
    `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}\n\n${comment.text}`,
    { reply_markup: InlineKeyboards.createReactionKeyboard() }
  );
  
  return true;
}