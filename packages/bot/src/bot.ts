import { Telegraf, session } from 'telegraf';
import { MyContext, SessionData } from './types/context';
import { startHandler } from './handlers/start.handler';
import { watchHandler } from './handlers/watch.handler';
import { movieHandler } from './handlers/movie.handler';
import { manualHandler } from './handlers/manual.handler';
import { callbackHandler } from './handlers/callback.handler';
import { message } from 'telegraf/filters';

// Инициализация кэша
declare global {
  var movieCache: Map<string, any>;
}
global.movieCache = new Map();

export function createBot(token: string): Telegraf<MyContext> {
  const bot = new Telegraf<MyContext>(token);
  
  // Middleware
  bot.use(session({ defaultSession: () => ({}) }));
  
  // Commands
  bot.start(startHandler);
  bot.command('watch', watchHandler);
  
  // Message handlers
  bot.on(message('text'), async (ctx) => {
    if (!ctx.session) ctx.session = {};
    const text = ctx.message.text;
    
    // Проверяем ручной режим
    const handled = await manualHandler(ctx, text);
    if (handled) return;
    
    // Проверяем режим поиска
    if (ctx.session.awaitingMovie) {
      await movieHandler(ctx, text);
      return;
    }
    
    await ctx.reply('Используй /watch для поиска фильма');
  });
  
  // Callback handlers
  bot.on('callback_query', callbackHandler);
  
  return bot;
}