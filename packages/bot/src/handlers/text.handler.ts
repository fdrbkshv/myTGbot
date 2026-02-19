import { MyContext } from '../types/context';
import { StateManager } from '../services/state.manager';
import { InlineKeyboards } from '../keyboards/inline.keyboard';

export async function handleTextMessage(ctx: MyContext) {
  try {
    const userId = ctx.from.id;
    const session = global.userService.getSession(userId);
    const text = ctx.message.text;
    
    console.log('Текст сообщения:', text);
    console.log('Текущий state:', session?.state);
    
    // Навигация
    if (text === '🔙 В меню') {
      await ctx.reply('Главное меню:', { 
        reply_markup: InlineKeyboards.mainMenuKeyboard() 
      });
      return;
    }
    
    // Обработка по состоянию
    if (session && session.state === 'awaiting_movie') {
      console.log('Состояние awaiting_movie, ищем фильм:', text);
      await StateManager.handleMovieSearch(ctx, text);
      return;
    }
    
    if (session && session.state === 'awaiting_timestamp') {
      console.log('Состояние awaiting_timestamp, обрабатываем время:', text);
      await StateManager.handleTimestamp(ctx, text);
      return;
    }
    
    // Если состояние не установлено, но пользователь пишет название
    if (!session.state || session.state === 'idle') {
      if (!text.startsWith('/') && !text.startsWith('🔙') && text.length > 2) {
        console.log('Нет активного состояния, устанавливаем awaiting_movie');
        session.state = 'awaiting_movie';
        global.userService.updateSession(userId, session);
        await StateManager.handleMovieSearch(ctx, text);
        return;
      }
    }
    
    // По умолчанию
    await ctx.reply('Используй кнопки меню:', { 
      reply_markup: InlineKeyboards.mainMenuKeyboard() 
    });
    
  } catch (error) {
    console.error('Ошибка в handleTextMessage:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуй еще раз.');
  }
}