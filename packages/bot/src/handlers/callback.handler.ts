import { MyContext } from '../types/context';
import { CommentService } from '../services/comment.service';
import { InlineKeyboards } from '../keyboards/inline.keyboard';

const commentService = new CommentService();

export async function callbackHandler(ctx: MyContext) {
  if (!ctx.session) ctx.session = {};
  if (!ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const data = ctx.callbackQuery.data;
  
  if (data.startsWith('mv_')) {
    await handleMovieSelection(ctx, data);
  } else if (data === 'react_like' || data === 'react_dislike') {
    await handleReaction(ctx, data);
  }
  
  await ctx.answerCbQuery();
}

async function handleMovieSelection(ctx: MyContext, data: string) {
  const movieData = (global as any).movieCache?.get(data);
  
  if (!movieData) {
    await ctx.answerCbQuery('Данные устарели, попробуй поискать снова');
    return;
  }
  
  ctx.session.movieId = movieData.id;
  ctx.session.movieTitle = movieData.title;
  ctx.session.movieYear = movieData.year;
  
  let movieInfo = `🎬 ${movieData.title}\n📅 ${movieData.year}\n\nГенерирую комментарии...`;
  await ctx.reply(movieInfo);

  const comments = commentService.generateComments(movieData.title, 3);
  
  for (const comment of comments) {
    const minutes = Math.floor(comment.timestamp / 60);
    const seconds = comment.timestamp % 60;
    
    const msg = await ctx.reply(
      `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}\n\n${comment.text}`,
      { reply_markup: InlineKeyboards.createReactionKeyboard() }
    );
  }
  
  ctx.session.manualMode = true;
  await ctx.reply(
    'Хочешь комментарий на конкретную минуту?\n' +
    'Просто отправь время в формате "минуты:секунды" (например: 45:30)'
  );
}

async function handleReaction(ctx: MyContext, data: string) {
  const msgId = ctx.callbackQuery.message?.message_id;
  if (!msgId) return;
  
  const type = data === 'react_like' ? 'like' : 'dislike';
  commentService.addReaction(msgId.toString(), type);
  await ctx.answerCbQuery('Спасибо за оценку!');
}