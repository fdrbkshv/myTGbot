/*import { MyContext } from '../types/context';
import { CommentService } from '../services/comment.service';
import { InlineKeyboards } from '../keyboards/inline.keyboard';

const commentService = new CommentService();

// Функция для удаления сообщения с задержкой
async function deleteMessageAfterDelay(ctx: MyContext, messageId: number, delay: number = 3000) {
  setTimeout(async () => {
    try {
      await ctx.deleteMessage(messageId);
    } catch (error) {
      // Игнорируем ошибки удаления
    }
  }, delay);
}

export async function manualHandler(ctx: MyContext, text: string) {
  if (!ctx.session?.manualMode || !ctx.session?.movieTitle) return false;
  
  const match = text.match(/^(\d+):?(\d+)?$/);
  if (!match) {
    const errorMsg = await ctx.reply('Отправь время в формате "минуты:секунды" (например: 45:30 или 120)');
    // Удалим сообщение об ошибке через 3 секунды
    await deleteMessageAfterDelay(ctx, errorMsg.message_id, 3000);
    return true;
  }
  
  const minutes = parseInt(match[1]);
  const seconds = match[2] ? parseInt(match[2]) : 0;
  const timestamp = minutes * 60 + seconds;
  
  // Отправляем сообщение о генерации и удаляем его
  const generatingMsg = await ctx.reply('🔍 Генерирую комментарий...');
  await deleteMessageAfterDelay(ctx, generatingMsg.message_id, 1500);
  
  const comments = commentService.generateComments(ctx.session.movieTitle, 1);
  const comment = comments[0];
  
  await ctx.reply(
    `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}\n\n${comment.text}`,
    { reply_markup: InlineKeyboards.createReactionKeyboard() }
  );
  
  return true;
}*/
import { MyContext } from '../types/context';
import { CommentService } from '../services/comment.service';
import { InlineKeyboards } from '../keyboards/inline.keyboard';
import { ReplyKeyboards } from '../keyboards/reply.keyboard';

const commentService = new CommentService();

async function deleteMessageAfterDelay(ctx: MyContext, messageId: number, delay: number = 3000) {
  setTimeout(async () => {
    try {
      await ctx.deleteMessage(messageId);
    } catch (error) {}
  }, delay);
}

export async function manualHandler(ctx: MyContext, text: string) {
  if (!ctx.session?.manualMode || !ctx.session?.movieTitle) return false;
  
  // Проверяем не команда ли это меню
  if (text.startsWith('❌') || text.startsWith('🔙') || text === '🎬 Новый поиск') {
    return false; // Пропускаем для menuHandler
  }
  
  const match = text.match(/^(\d+):?(\d+)?$/);
  if (!match) {
    const errorMsg = await ctx.reply('⏱️ Отправь время в формате "минуты:секунды" (например: 45:30)');
    await deleteMessageAfterDelay(ctx, errorMsg.message_id, 3000);
    return true;
  }
  
  const minutes = parseInt(match[1]);
  const seconds = match[2] ? parseInt(match[2]) : 0;
  const timestamp = minutes * 60 + seconds;
  
  const generatingMsg = await ctx.reply('🔍 Генерирую комментарий...');
  await deleteMessageAfterDelay(ctx, generatingMsg.message_id, 1500);
  
  const comments = commentService.generateComments(ctx.session.movieTitle, 1);
  const comment = comments[0];
  
  await ctx.reply(
    `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}\n\n${comment.text}`,
    { 
      reply_markup: {
        ...InlineKeyboards.createReactionKeyboard(),
        ...ReplyKeyboards.afterSearchMenu()
      }
    }
  );
  
  return true;
}