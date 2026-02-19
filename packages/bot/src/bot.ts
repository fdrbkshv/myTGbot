import { Telegraf, session } from 'telegraf';
import { MyContext } from './types/context';
import { UserService } from './services/user.service';
import { MovieService } from './services/movie.service';
import { InlineKeyboards } from './keyboards/inline.keyboard';
import { handleCallbackQuery } from './handlers/callback.handler';
import { handleTextMessage } from './handlers/text.handler';
import { message } from 'telegraf/filters';

declare global {
  var movieCache: Map<string, any>;
  var userService: UserService;
  var movieService: MovieService;
  var isBotActive: boolean;
}

global.movieCache = new Map();
global.userService = new UserService();
global.movieService = new MovieService();
global.isBotActive = true;

const ADMIN_ID = 833359210;

export function createBot(token: string): Telegraf<MyContext> {
  const bot = new Telegraf<MyContext>(token);
  
  bot.use(session({ defaultSession: () => ({}) }));
  
  // Middleware проверки активности
  bot.use(async (ctx, next) => {
    if (!global.isBotActive && ctx.from?.id !== ADMIN_ID) {
      await ctx.reply('🔴 Бот временно отключен');
      return;
    }
    return next();
  });
  
  // Команда /start
  bot.start(async (ctx) => {
    await ctx.replyWithPhoto(
      'https://img.freepik.com/free-vector/cinema-movie-background_1017-8728.jpg',
      {
        caption: '🎬 **Добро пожаловать в Movie Companion!**\n\nЯ помогу тебе выбрать фильм и расскажу интересные факты во время просмотра.\n\nНажми /help для списка команд.',
        parse_mode: 'Markdown',
        reply_markup: InlineKeyboards.initialKeyboard()
      }
    );
  });
  
  // Команда /help
  bot.command('help', async (ctx) => {
    await ctx.reply('📋 **Команды:**\n/start - начало\n/help - помощь\n/about - о проекте', {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.backToMainKeyboard()
    });
  });
  
  // Команда /about
  bot.command('about', async (ctx) => {
    await ctx.reply('🎬 **Movie Companion** v1.0\nПомощник для просмотра фильмов', {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.backToMainKeyboard()
    });
  });
  
  // Админ-команды
  bot.command('off', async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) return ctx.reply('❌ Нет прав');
    global.isBotActive = false;
    await ctx.reply('🔴 Бот выключен');
    setTimeout(() => process.exit(0), 1000);
  });
  
  // Обработчики
  bot.on('callback_query', handleCallbackQuery);
  bot.on(message('text'), handleTextMessage);
  
  return bot;
}