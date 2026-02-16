import { Telegraf, session } from 'telegraf';
import { MyContext } from './types/context';
import { startHandler } from './handlers/start.handler';
import { watchHandler } from './handlers/watch.handler';
import { movieHandler } from './handlers/movie.handler';
import { manualHandler } from './handlers/manual.handler';
import { callbackHandler } from './handlers/callback.handler';
import { menuHandler } from './handlers/menu.handler';
import { ReplyKeyboards } from './keyboards/reply.keyboard';
import { message } from 'telegraf/filters';

// Инициализация глобальных переменных
declare global {
  var movieCache: Map<string, any>;
  var isBotActive: boolean;
}

// Убедимся что глобальные переменные инициализированы
global.movieCache = global.movieCache || new Map();
global.isBotActive = global.isBotActive !== undefined ? global.isBotActive : true;

const ADMIN_ID = 833359210; // Твой ID

export function createBot(token: string): Telegraf<MyContext> {
  const bot = new Telegraf<MyContext>(token);
  
  // Session middleware
  bot.use(session({ defaultSession: () => ({}) }));
  
  // Middleware для проверки активности бота
  bot.use(async (ctx, next) => {
    if (!global.isBotActive && ctx.from?.id !== ADMIN_ID) {
      await ctx.reply('🔴 Бот временно отключен. Попробуй позже.');
      return;
    }
    return next();
  });
  
  // Команды
  bot.start(startHandler);
  bot.command('watch', watchHandler);
  bot.command('menu', async (ctx) => {
    const isAdmin = ctx.from?.id === ADMIN_ID;
    await ctx.reply('Главное меню:', isAdmin ? ReplyKeyboards.adminMenu() : ReplyKeyboards.mainMenu());
  });
  
  // Команда /off - выключить бота (только для админа)
  bot.command('off', async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
      await ctx.reply('❌ У тебя нет прав на эту команду');
      return;
    }
    
    global.isBotActive = false;
    await ctx.reply('🔴 Бот выключен. Для включения используй /on');
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
  
  // Команда /on - включить бота (только для админа)
  bot.command('on', async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
      await ctx.reply('❌ У тебя нет прав на эту команду');
      return;
    }
    
    global.isBotActive = true;
    await ctx.reply('🟢 Бот включен');
  });
  
  // Команда /restart - перезапустить бота (только для админа)
  bot.command('restart', async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
      await ctx.reply('❌ У тебя нет прав на эту команду');
      return;
    }
    
    await ctx.reply('🔄 Перезапускаю бота...');
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
  
  // Команда /status - проверить статус бота
  bot.command('status', async (ctx) => {
    const status = global.isBotActive ? '🟢 Активен' : '🔴 Отключен';
    await ctx.reply(`Статус бота: ${status}`);
  });
  
  // Обработка текстовых сообщений
  bot.on(message('text'), async (ctx) => {
    if (!ctx.session) ctx.session = {};
    const text = ctx.message.text;
    
    // Сначала проверяем команды меню
    const menuHandled = await menuHandler(ctx, text);
    if (menuHandled) return;
    
    // Проверяем ручной режим
    const manualHandled = await manualHandler(ctx, text);
    if (manualHandled) return;
    
    // Проверяем режим поиска
    if (ctx.session.awaitingMovie) {
      await movieHandler(ctx, text);
      return;
    }
    
    // Если ничего не подошло
    const isAdmin = ctx.from?.id === ADMIN_ID;
    await ctx.reply(
      'Используй кнопки меню для навигации:',
      isAdmin ? ReplyKeyboards.adminMenu() : ReplyKeyboards.mainMenu()
    );
  });
  
  // Callback handlers
  bot.on('callback_query', callbackHandler);
  
  return bot;
}