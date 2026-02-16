import 'dotenv/config';
import { createBot } from './bot';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN не найден в .env файле');
  process.exit(1);
}

let bot = createBot(token);

// Функция запуска бота
async function startBot() {
  try {
    await bot.launch();
    console.log('✅ Бот запущен!');
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
}

// Запускаем
startBot();

// Обработка перезапуска
process.on('SIGINT', async () => {
  console.log('👋 Бот остановлен (SIGINT)');
  bot.stop('SIGINT');
});

process.on('SIGTERM', async () => {
  console.log('👋 Бот остановлен (SIGTERM)');
  bot.stop('SIGTERM');
});