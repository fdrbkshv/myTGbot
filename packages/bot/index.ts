// index.ts
import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import 'dotenv/config';

interface SessionData {
  awaitingMovie?: boolean;
  movieId?: string;
  movieTitle?: string;
  movieYear?: string;
  manualMode?: boolean;
}

interface MyContext extends Telegraf.Context {
  session: SessionData;
}

// Кэш для временного хранения данных фильмов
interface MovieCacheItem {
  id: string;
  title: string;
  year: string;
  source: string;
}

// Используем глобальный объект для кэша
declare global {
  var movieCache: Map<string, MovieCacheItem>;
}
global.movieCache = new Map();

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);
bot.use(session({ defaultSession: () => ({}) }));

// Хранилище реакций
interface Reactions {
  likes: number;
  dislikes: number;
}

const reactions = new Map<string, Reactions>();

// Команда /start
bot.start(async (ctx) => {
  await ctx.reply(
    '🎬 Добро пожаловать в Movie Companion!\n\n' +
    'Команды:\n' +
    '/watch - найти фильм и получить комментарии\n' +
    '/key - получить API ключ для OMDb\n' +
    'Или просто отправь название фильма (можно на русском)'
  );
});

// Команда для получения ключа
bot.command('key', async (ctx) => {
  await ctx.reply(
    '🔑 Чтобы получить API ключ для OMDb:\n\n' +
    '1. Перейди на http://www.omdbapi.com/apikey.aspx\n' +
    '2. Введи свой email\n' +
    '3. Выбери "FREE" (1000 запросов в день)\n' +
    '4. Ключ придет на почту моментально\n\n' +
    'Потом добавь его в файл .env:\n' +
    'OMDB_API_KEY=твой_ключ'
  );
});

// Команда /watch
bot.command('watch', async (ctx) => {
  if (!ctx.session) ctx.session = {};
  ctx.session.awaitingMovie = true;
  await ctx.reply('Отправь название фильма (можно на русском):');
});

// Функция поиска на Кинопоиске
async function searchKinopoisk(query: string) {
  try {
    const res = await fetch(
      `https://api.kinopoisk.dev/v1.4/movie/search?page=1&limit=5&query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-API-KEY': 'ZGRjYzE1Yy1lYzA4LTRiY2MtOTAyYy0wZmY1M2UzZGU4MDk'
        }
      }
    );
    const data = await res.json();
    
    if (data.docs && data.docs.length > 0) {
      return data.docs.map((m: any) => ({
        id: m.id.toString(),
        title: m.name || m.alternativeName || 'Без названия',
        year: m.year?.toString() || '?',
        poster: m.poster?.url || '',
        description: m.description || m.shortDescription || '',
        rating: m.rating?.kp || m.rating?.imdb || 0,
        source: 'kinopoisk'
      }));
    }
    return [];
  } catch (error) {
    console.log('Кинопоиск не ответил');
    return [];
  }
}

// Функция поиска на русском через альтернативное API
async function searchRussianMovie(query: string) {
  try {
    const res = await fetch(
      `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=1`,
      {
        headers: {
          'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86'
        }
      }
    );
    const data = await res.json();
    
    if (data.films && data.films.length > 0) {
      return data.films.map((f: any) => ({
        id: f.filmId.toString(),
        title: f.nameRu || f.nameEn || 'Без названия',
        year: f.year?.toString() || '?',
        poster: f.posterUrl || '',
        description: f.description || '',
        rating: f.rating || 0,
        source: 'kinopoisk-unofficial'
      }));
    }
    return [];
  } catch {
    return [];
  }
}

// Обработка текстовых сообщений
bot.on(message('text'), async (ctx) => {
  if (!ctx.session) ctx.session = {};
  
  const text = ctx.message.text;

  if (ctx.session.awaitingMovie) {
    ctx.session.awaitingMovie = false;
    
    await ctx.reply('🔍 Ищу фильм...');
    
    let movies: any[] = [];
    
    try {
      movies = await searchKinopoisk(text);
      if (movies.length === 0) {
        movies = await searchRussianMovie(text);
      }
    } catch (error) {
      console.error(error);
    }
    
    if (movies.length === 0) {
      return ctx.reply(
        '❌ Фильм не найден.\n\n' +
        'Попробуй:\n' +
        '• Ввести название на английском\n' +
        '• Уточнить год (например: "Матрица 1999")'
      );
    }

    const moviesToShow = movies.slice(0, 5);
    
    const keyboard = {
      inline_keyboard: moviesToShow.map((m: any, index: number) => {
        const callbackId = `mv_${index}_${Date.now()}`;
        
        global.movieCache.set(callbackId, {
          id: m.id,
          title: m.title,
          year: m.year,
          source: m.source
        });
        
        return [{
          text: `${m.title} (${m.year}) ${m.rating ? '⭐' : ''}`,
          callback_data: callbackId
        }];
      })
    };

    await ctx.reply('Нашел несколько вариантов:', { reply_markup: keyboard });
    return;
  }

  if (ctx.session.manualMode && ctx.session.movieTitle) {
    const match = text.match(/^(\d+):?(\d+)?$/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = match[2] ? parseInt(match[2]) : 0;
      const timestamp = minutes * 60 + seconds;
      
      await ctx.reply('🔍 Генерирую комментарий...');
      
      const comment = generateComment(ctx.session.movieTitle, timestamp);
      const msg = await ctx.reply(
        `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}\n\n${comment}`,
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '👍', callback_data: 'react_like' },
              { text: '👎', callback_data: 'react_dislike' }
            ]]
          }
        }
      );
      
      reactions.set(msg.message_id.toString(), { likes: 0, dislikes: 0 });
    } else {
      await ctx.reply('Отправь время в формате "минуты:секунды" (например: 45:30 или 120)');
    }
    return;
  }

  await ctx.reply('Используй /watch для поиска фильма');
});

// Обработка callback кнопок
bot.on('callback_query', async (ctx) => {
  if (!ctx.session) ctx.session = {};
  
  const data = ctx.callbackQuery.data;
  
  if (data?.startsWith('mv_')) {
    const movieData = global.movieCache.get(data);
    
    if (!movieData) {
      await ctx.answerCbQuery('Данные устарели, попробуй поискать снова');
      return;
    }
    
    ctx.session.movieId = movieData.id;
    ctx.session.movieTitle = movieData.title;
    ctx.session.movieYear = movieData.year;
    
    let movieInfo = `🎬 ${movieData.title}\n📅 ${movieData.year}\n\nГенерирую комментарии...`;
    await ctx.reply(movieInfo);

    const comments = generateRandomComments(movieData.title, 3);
    
    for (const c of comments) {
      const minutes = Math.floor(c.timestamp / 60);
      const seconds = c.timestamp % 60;
      
      const msg = await ctx.reply(
        `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}\n\n${c.comment}`,
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '👍', callback_data: 'react_like' },
              { text: '👎', callback_data: 'react_dislike' }
            ]]
          }
        }
      );
      
      reactions.set(msg.message_id.toString(), { likes: 0, dislikes: 0 });
    }
    
    ctx.session.manualMode = true;
    await ctx.reply(
      'Хочешь комментарий на конкретную минуту?\n' +
      'Просто отправь время в формате "минуты:секунды" (например: 45:30)'
    );
    
    await ctx.answerCbQuery();
    return;
  }
  
  if (data === 'react_like' || data === 'react_dislike') {
    const msgId = ctx.callbackQuery.message?.message_id;
    
    if (msgId && reactions.has(msgId.toString())) {
      const current = reactions.get(msgId.toString())!;
      if (data === 'react_like') current.likes++;
      if (data === 'react_dislike') current.dislikes++;
      reactions.set(msgId.toString(), current);
      
      console.log(`Статистика: 👍 ${current.likes}, 👎 ${current.dislikes}`);
    }
    
    await ctx.answerCbQuery('Спасибо за оценку!');
  }
});

// Функция генерации комментариев
function generateComment(movieTitle: string, timestamp: number): string {
  const minutes = Math.floor(timestamp / 60);
  const seconds = timestamp % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const facts = [
    `На ${timeStr} в фильме "${movieTitle}" происходит важный поворот сюжета!`,
    `Интересно, что сцена на ${timeStr} снималась в павильоне.`,
    `Актеры особенно старались в этом моменте (${timeStr}).`,
    `Режиссер считает сцену на ${timeStr} ключевой для понимания фильма.`,
    `На ${timeStr} можно заметить небольшую ошибку монтажа.`,
    `Саундтрек в этом месте (${timeStr}) написал известный композитор.`,
    `Этот кадр на ${timeStr} стал мемом в интернете.`,
    `На ${timeStr} актер импровизировал - этого не было в сценарии!`,
    `Съемки этой сцены (${timeStr}) заняли 3 дня.`,
    `В этом моменте (${timeStr}) спрятана пасхалка для фанатов.`
  ];
  
  return facts[Math.floor(Math.random() * facts.length)];
}

function generateRandomComments(movieTitle: string, count: number) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const timestamp = Math.floor(Math.random() * 7200);
    comments.push({
      timestamp,
      comment: generateComment(movieTitle, timestamp)
    });
  }
  return comments.sort((a, b) => a.timestamp - b.timestamp);
}

// Запуск бота
bot.launch().then(() => console.log('✅ Бот запущен!'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));