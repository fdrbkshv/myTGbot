import 'dotenv/config';
import { createBot } from './bot';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN не найден в .env файле');
  process.exit(1);
}

const bot = createBot(token);

// Запуск
bot.launch().then(() => console.log('✅ Бот запущен!'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));