export class InlineKeyboards {
  // вот эта клавиатура используется как затычка для кнопки "В главное меню"

  static mainMenuKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🍿 Хочу посмотреть', callback_data: 'want_movie' },
          { text: '❓ Помощь', callback_data: 'help' }
        ],
        [
          { text: 'ℹ️ О проекте', callback_data: 'about' },
          { text: '📋 Команды', callback_data: 'commands' }
        ],
        [
          { text: 'Оу Моя первая кнопка', callback_data: 'my_First_Button' },
          { text: 'Оу Моя вторая кнопка', callback_data: 'my_Second_Button' }
        ]
      ]
    };
  }

  static initialKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🍿 Хочу посмотреть', callback_data: 'want_movie' },
          { text: '😴 Не сейчас', callback_data: 'dont_want' }
        ],
        [
          { text: '⏰ Напомнить позже', callback_data: 'remind_later' },
          { text: '❓ Помощь', callback_data: 'help' }
        ],
        [
          { text: '1 Моя первая кнопка1', callback_data: 'my_First_Button' },
          { text: '2 Моя вторая кнопка2', callback_data: 'my_Second_Button' }
        ]
      ]
    };
  }

  static helpKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '❓ Помощь', callback_data: 'help' },
          { text: '📋 Команды', callback_data: 'commands' }
        ],
        [
          { text: '🔙 В меню', callback_data: 'back_to_menu' }
        ]
      ]
    };
  }

  static movieActionsKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🎬 Начать просмотр', callback_data: 'start_watching' },
          { text: '🔄 Другой фильм', callback_data: 'different_movie' }
        ],
        [
          { text: '❓ Помощь', callback_data: 'help' },
          { text: '🔙 В меню', callback_data: 'back_to_menu' }
        ]
      ]
    };
  }

  static watchingKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '⏱️ Ввести время', callback_data: 'enter_time' },
          { text: '🔄 Другой фильм', callback_data: 'different_movie' }
        ],
        [
          { text: '❓ Помощь', callback_data: 'help' },
          { text: '🔙 В меню', callback_data: 'back_to_menu' }
        ]
      ]
    };
  }

  static reminderKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🍿 Всё-таки хочу!', callback_data: 'want_movie' },
          { text: '❓ Помощь', callback_data: 'help' }
        ]
      ]
    };
  }

  static backToMainKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🔙 В главное меню', callback_data: 'back_to_menu' }
        ]
      ]
    };
  }

  static createMovieKeyboard(movies: any[], cache: Map<string, any>) {
    const keyboard = [];
    
    // Добавляем кнопки для каждого фильма
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      const callbackId = `select_movie_${movie.id}_${movie.title}`;
      
      cache.set(callbackId, {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        source: movie.source
      });
      
      keyboard.push([{
        text: `${i + 1}. ${movie.title} (${movie.year})`,
        callback_data: callbackId
      }]);
    }
    
    // Добавляем кнопки навигации
    keyboard.push([
      { text: '🔄 Другой запрос', callback_data: 'different_movie' },
      { text: '🔙 В меню', callback_data: 'back_to_menu' }
    ]);
    
    keyboard.push([
      { text: '❓ Помощь', callback_data: 'help' }
    ]);
    
    return { inline_keyboard: keyboard };
  }

  static timestampKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '⏱️ 15 минут', callback_data: 'timestamp_15' },
          { text: '⏱️ 30 минут', callback_data: 'timestamp_30' },
          { text: '⏱️ 45 минут', callback_data: 'timestamp_45' }
        ],
        [
          { text: '⏱️ 1 час', callback_data: 'timestamp_60' },
          { text: '⏱️ 1.5 часа', callback_data: 'timestamp_90' },
          { text: '⏱️ 2 часа', callback_data: 'timestamp_120' }
        ],
        [
          { text: '❓ Помощь', callback_data: 'help' },
          { text: '🔙 В меню', callback_data: 'back_to_menu' }
        ]
      ]
    };
  }
}