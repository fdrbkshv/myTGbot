import { MyContext } from '../types/context';
import { UserService } from '../services/user.service';
import { InlineKeyboards } from '../keyboards/inline.keyboard';
import { StateManager } from '../services/state.manager';

const userService = new UserService();

export async function handleCallbackQuery(ctx: MyContext) {
  const action = ctx.callbackQuery.data;
  const userId = ctx.from.id;
  const session = userService.getSession(userId);
  
  // Удаляем клавиатуру у старого сообщения
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  } catch (error) {}
  
  switch (action) {
    case 'want_movie':
  console.log('Нажата кнопка Хочу посмотреть'); // Добавим лог
  await handleWantMovie(ctx, userId, session);
  break;

    async function handleWantMovie(ctx: MyContext, userId: number, session: any) {
      console.log('handleWantMovie, текущий state:', session.state); // Лог
      
      session.state = 'awaiting_movie';
      userService.updateSession(userId, session);
      
      console.log('Новый state:', session.state); // Лог
      
      await ctx.reply(
        '🍿 **Отлично! Давай подберем фильм**\n\n' +
        'Напиши название фильма или жанр, и я найду для тебя интересные варианты.\n\n' +
        'Например: "Аватар", "комедия", "боевик"',
        { 
          parse_mode: 'Markdown',
          reply_markup: InlineKeyboards.helpKeyboard() 
        }
      );
    }
    case 'dont_want':
      await handleDontWant(ctx, userId);
      console.log('Нажата кнопка - Не хочу');
      break;
      
    case 'remind_later':
      await handleRemindLater(ctx, userId);
      console.log('Нажата кнопка - Напомни позже');
      break;
      
    case 'start_watching':
      await handleStartWatching(ctx, userId, session);
      console.log('Нажата кнопка - Начать просмотр');
      break;
      
    case 'different_movie':
      await handleDifferentMovie(ctx, userId, session);
      console.log('Нажата кнопка - Другой фильм');
      break;
      
    case 'help':
      await handleHelp(ctx);
      console.log('Нажата кнопка - Помощь');
      break;
      
    case 'about':
      await handleAbout(ctx);
      console.log('Нажата кнопка - Описание');
      break;
      
    case 'commands':
      await handleCommands(ctx);
      console.log('Нажата кнопка - Команды');
      break;
      
    case 'back_to_menu':
      await handleBackToMenu(ctx);
      console.log('Нажата кнопка - Вернуться в меню');
      break;
      
    case 'enter_time':
      await handleEnterTime(ctx, session);
      console.log('Нажата кнопка - Ввести время');
      break;
      
    default:
      if (action?.startsWith('select_movie_')) {
        await handleMovieSelection(ctx, action, userId, session);
      } else if (action?.startsWith('rate_')) {
        await handleRating(ctx, action, userId, session);
      } else if (action?.startsWith('timestamp_')) {
        await handlePresetTimestamp(ctx, action, userId, session);
      }
      break;
  }
  
  await ctx.answerCbQuery();
}

async function handleWantMovie(ctx: MyContext, userId: number, session: any) {
  session.state = 'awaiting_movie';
  userService.updateSession(userId, session);
  
  await ctx.reply(
    '🍿 **Отлично! Давай подберем фильм**\n\n' +
    'Напиши название фильма или жанр, и я найду для тебя интересные варианты.\n\n' +
    'Например: "Аватар", "комедия", "боевик"',
    { 
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.helpKeyboard() 
    }
  );
}

async function handleDontWant(ctx: MyContext, userId: number) {
  userService.setReminder(userId, 16);
  
  await ctx.reply(
    '😴 **Хорошо, отдыхай**\n\n' +
    'Я напомню о себе через 16-24 часа. Если захочешь посмотреть фильм раньше - просто напиши мне!',
    { 
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.reminderKeyboard() 
    }
  );
}

async function handleRemindLater(ctx: MyContext, userId: number) {
  userService.setReminder(userId, 1);
  
  await ctx.reply(
    '⏰ **Договорились!**\n\n' +
    'Я напомню тебе через пару часов. А пока можешь посмотреть список команд:',
    { 
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.helpKeyboard() 
    }
  );
}

async function handleStartWatching(ctx: MyContext, userId: number, session: any) {
  if (!session.movieTitle) return;
  
  session.state = 'watching';
  userService.updateSession(userId, session);
  
  const user = userService.getUser(userId);
  user.status = 'watching';
  user.currentMovie = {
    id: session.movieId!,
    title: session.movieTitle,
    startedAt: new Date()
  };
  userService.updateUser(userId, user);
  
  await ctx.reply(
    '🎬 **Приятного просмотра!**\n\n' +
    'Через 5 минут я спрошу, на какой минуте ты находишься, и расскажу интересные моменты.\n\n' +
    'А пока можешь посмотреть, что я умею:',
    { 
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.watchingKeyboard() 
    }
  );
  
  // Запланировать вопрос о таймкоде через 5 минут
  setTimeout(() => askForTimestamp(ctx, userId), 5 * 60 * 1000);
}

async function handleDifferentMovie(ctx: MyContext, userId: number, session: any) {
  session.state = 'awaiting_movie';
  userService.updateSession(userId, session);
  
  await ctx.reply(
    '🔄 **Поиск другого фильма**\n\n' +
    'Напиши название или жанр:',
    { 
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.helpKeyboard() 
    }
  );
}

async function handleMovieSelection(ctx: MyContext, action: string, userId: number, session: any) {
  const parts = action.split('_');
  const movieId = parts[2];
  const movieTitle = parts.slice(3).join('_');
  
  session.movieId = movieId;
  session.movieTitle = decodeURIComponent(movieTitle);
  userService.updateSession(userId, session);
  
  await ctx.reply(
    `🍿 **Отличный выбор!**\n\n` +
    `Фильм: *${session.movieTitle}*\n\n` +
    `Что делаем дальше?`,
    {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.movieActionsKeyboard()
    }
  );
}

async function handleRating(ctx: MyContext, action: string, userId: number, session: any) {
  const rating = action.split('_')[1];
  
  const user = userService.getUser(userId);
  if (user.currentMovie) {
    user.movieHistory.push({
      movieId: user.currentMovie.id,
      movieTitle: user.currentMovie.title,
      watchedAt: new Date(),
      rating: parseInt(rating)
    });
    user.status = 'active';
    user.currentMovie = undefined;
    userService.updateUser(userId, user);
    
    session.state = 'idle';
    userService.updateSession(userId, session);
    
    await ctx.reply(
      `✨ **Спасибо за оценку!** ${'⭐'.repeat(parseInt(rating))}\n\n` +
      'Жди новых предложений для просмотра! А пока можешь посмотреть что еще я умею:',
      {
        parse_mode: 'Markdown',
        reply_markup: InlineKeyboards.mainMenuKeyboard()
      }
    );
  }
}

async function handlePresetTimestamp(ctx: MyContext, action: string, userId: number, session: any) {
  const minutes = parseInt(action.split('_')[1]);
  await StateManager.handleTimestamp(ctx, minutes.toString());
}

async function handleEnterTime(ctx: MyContext, session: any) {
  session.state = 'awaiting_timestamp';
  await ctx.reply(
    '⏱️ **Введи время**\n\n' +
    'Напиши, на какой минуте ты сейчас находишься.\n' +
    'Формат: минуты:секунды (например: 45:30)',
    {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.timestampKeyboard()
    }
  );
}

async function handleBackToMenu(ctx: MyContext) {
  await ctx.reply(
    '🎬 **Главное меню**\n\n' +
    'Выбери, что хочешь сделать:',
    {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.mainMenuKeyboard()
    }
  );
}

async function handleHelp(ctx: MyContext) {
  await ctx.reply(
    '❓ **Помощь по командам**\n\n' +
    '• /start - начать работу с ботом\n' +
    '• /help - показать это сообщение\n' +
    '• /about - о проекте\n' +
    '• /commands - все команды\n\n' +
    '**Как пользоваться:**\n' +
    '1. Нажми "🍿 Хочу посмотреть"\n' +
    '2. Напиши название фильма или жанр\n' +
    '3. Выбери фильм из списка\n' +
    '4. Начни просмотр и получай комментарии!',
    {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.backToMainKeyboard()
    }
  );
}

async function handleAbout(ctx: MyContext) {
  await ctx.reply(
    '🎬 **О Movie Companion**\n\n' +
    'Этот бот поможет тебе сделать просмотр фильмов интереснее!\n\n' +
    '**Что я умею:**\n' +
    '• Подбирать фильмы по названию и жанру\n' +
    '• Рассказывать интересные факты во время просмотра\n' +
    '• Напоминать о себе, когда ты скучаешь\n' +
    '• Собирать твои оценки и рекомендации\n\n' +
    '**Планы развития:**\n' +
    '• Интеграция с TMDb и Groq AI\n' +
    '• Telegram Mini App\n' +
    '• Браузерное расширение',
    {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.backToMainKeyboard()
    }
  );
}

async function handleCommands(ctx: MyContext) {
  await ctx.reply(
    '📋 **Все команды бота**\n\n' +
    '**Основные:**\n' +
    '/start - начать работу\n' +
    '/help - помощь\n' +
    '/about - о проекте\n' +
    '/commands - список команд\n\n' +
    '**Для админа:**\n' +
    '/off - выключить бота\n' +
    '/on - включить бота\n' +
    '/restart - перезапустить\n' +
    '/status - статус бота',
    {
      parse_mode: 'Markdown',
      reply_markup: InlineKeyboards.backToMainKeyboard()
    }
  );
}

async function askForTimestamp(ctx: MyContext, userId: number) {
  const session = userService.getSession(userId);
  if (session.state !== 'watching') return;
  
  session.state = 'awaiting_timestamp';
  userService.updateSession(userId, session);
  
  try {
    await ctx.telegram.sendMessage(
      userId,
      '⏱️ **Ты уже начал смотреть фильм?**\n\n' +
      'Если да, напиши на какой минуте ты сейчас находишься (например: 45:30),\n' +
      'и я расскажу интересные моменты, которые уже были!\n\n' +
      'Если еще не начал - просто напиши "нет", и я предложу другой фильм.',
      {
        parse_mode: 'Markdown',
        reply_markup: InlineKeyboards.timestampKeyboard()
      }
    );
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
  }
}