import { Movie } from '../../../shared/src/types/movie.types';
import { MovieModel } from '../models/movie.model';

export class MovieService {
  private static readonly KINOPOISK_API = 'https://api.kinopoisk.dev/v1.4';
  private static readonly KINOPOISK_UNOFFICIAL = 'https://kinopoiskapiunofficial.tech/api/v2.1';
  
  // Локальная база популярных фильмов (запасной вариант)
  private static readonly FALLBACK_MOVIES: Movie[] = [
    // Основные фильмы
    { id: '1', title: 'Аватар', year: '2009', description: 'Фантастика Джеймса Кэмерона', source: 'kinopoisk' },
    { id: '2', title: 'Шрек', year: '2001', description: 'Мультфильм про огра', source: 'fallback' },
    { id: '3', title: 'Шрек 2', year: '2004', description: 'Шрек знакомится с родителями Фионы', source: 'fallback' },
    { id: '4', title: 'Шрек Третий', year: '2007', description: 'Шрек ищет наследника', source: 'fallback' },
    { id: '5', title: 'Шрек навсегда', year: '2010', description: 'Шрек заключает сделку с Румпельштильцхеном', source: 'fallback' },
    { id: '6', title: 'Матрица', year: '1999', description: 'Культовый киберпанк', source: 'fallback' },
    { id: '7', title: 'Матрица: Перезагрузка', year: '2003', description: 'Вторая часть', source: 'fallback' },
    { id: '8', title: 'Матрица: Революция', year: '2003', description: 'Третья часть', source: 'fallback' },
    { id: '9', title: 'Гарри Поттер и философский камень', year: '2001', description: 'Первая часть', source: 'fallback' },
    { id: '10', title: 'Гарри Поттер и тайная комната', year: '2002', description: 'Вторая часть', source: 'fallback' },
    { id: '11', title: 'Гарри Поттер и узник Азкабана', year: '2004', description: 'Третья часть', source: 'fallback' },
    { id: '12', title: 'Властелин колец: Братство кольца', year: '2001', description: 'Эпическое фэнтези', source: 'fallback' },
    { id: '13', title: 'Властелин колец: Две крепости', year: '2002', description: 'Вторая часть', source: 'fallback' },
    { id: '14', title: 'Властелин колец: Возвращение короля', year: '2003', description: 'Третья часть', source: 'fallback' },
    { id: '15', title: 'Титаник', year: '1997', description: 'История любви', source: 'fallback' },
    { id: '16', title: 'Интерстеллар', year: '2014', description: 'Путешествие в космосе', source: 'fallback' },
    { id: '17', title: 'Начало', year: '2010', description: 'Сны во сне', source: 'fallback' },
    { id: '18', title: 'Зеленая миля', year: '1999', description: 'Мистическая драма', source: 'fallback' },
    { id: '19', title: 'Форрест Гамп', year: '1994', description: 'История простого человека', source: 'fallback' },
    { id: '20', title: 'Бойцовский клуб', year: '1999', description: 'Первое правило', source: 'fallback' },
    { id: '21', title: 'Криминальное чтиво', year: '1994', description: 'Шедевр Тарантино', source: 'fallback' },
    { id: '22', title: 'Побег из Шоушенка', year: '1994', description: 'Дружба в тюрьме', source: 'fallback' },
    { id: '23', title: 'Темный рыцарь', year: '2008', description: 'Бэтмен против Джокера', source: 'fallback' },
    { id: '24', title: 'Звездные войны: Эпизод 4', year: '1977', description: 'Новая надежда', source: 'fallback' },
    { id: '25', title: 'Назад в будущее', year: '1985', description: 'Путешествия во времени', source: 'fallback' },
    { id: '26', title: 'Терминатор 2', year: '1991', description: 'Роботы из будущего', source: 'fallback' },
    { id: '27', title: 'Пираты Карибского моря', year: '2003', description: 'Проклятие Черной жемчужины', source: 'fallback' },
    { id: '28', title: 'Брат', year: '1997', description: 'Культовый русский фильм', source: 'fallback' },
    { id: '29', title: 'Брат 2', year: '2000', description: 'Продолжение', source: 'fallback' },
    { id: '30', title: 'Ирония судьбы', year: '1975', description: 'Новогодняя комедия', source: 'fallback' },
    { id: '31', title: 'Служебный роман', year: '1977', description: 'Комедия', source: 'fallback' },
    { id: '32', title: 'Любовь и голуби', year: '1984', description: 'Лирическая комедия', source: 'fallback' },
    { id: '33', title: 'Один дома', year: '1990', description: 'Рождественская комедия', source: 'fallback' },
    { id: '34', title: 'Маска', year: '1994', description: 'Комедия с Джимом Керри', source: 'fallback' },
    { id: '35', title: 'Джентльмены удачи', year: '1971', description: 'Комедия', source: 'fallback' },
    { id: '36', title: 'Кавказская пленница', year: '1966', description: 'Приключения Шурика', source: 'fallback' },
    { id: '37', title: 'Операция Ы', year: '1965', description: 'Комедия', source: 'fallback' },
    { id: '38', title: 'Иван Васильевич меняет профессию', year: '1973', description: 'Комедия', source: 'fallback' },
    { id: '39', title: 'Джокер', year: '2019', description: 'Психологический триллер', source: 'fallback' },
    { id: '40', title: 'Мстители: Финал', year: '2019', description: 'Супергерои', source: 'fallback' },
  ];

  async searchKinopoisk(query: string): Promise<Movie[]> {
    try {
      const res = await fetch(
        `${MovieService.KINOPOISK_API}/movie/search?page=1&limit=5&query=${encodeURIComponent(query)}`,
        {
          headers: {
            'X-API-KEY': 'ZGRjYzE1Yy1lYzA4LTRiY2MtOTAyYy0wZmY1M2UzZGU4MDk'
          }
        }
      );
      const data = await res.json();
      
      if (data.docs && data.docs.length > 0) {
        return data.docs.map(MovieModel.fromKinopoisk);
      }
      return [];
    } catch (error) {
      console.log('Кинопоиск не ответил');
      return [];
    }
  }

  async searchRussianMovie(query: string): Promise<Movie[]> {
    try {
      const res = await fetch(
        `${MovieService.KINOPOISK_UNOFFICIAL}/films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=1`,
        {
          headers: {
            'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86'
          }
        }
      );
      const data = await res.json();
      
      if (data.films && data.films.length > 0) {
        return data.films.map(MovieModel.fromKinopoiskUnofficial);
      }
      return [];
    } catch {
      return [];
    }
  }

  async searchMovies(query: string): Promise<Movie[]> {
    console.log('Поиск фильмов по запросу:', query);
    
    // Сначала пробуем API
    let movies = await this.searchKinopoisk(query);
    if (movies.length === 0) {
      movies = await this.searchRussianMovie(query);
    }
    
    // Если API ничего не нашли, используем локальную базу
    if (movies.length === 0) {
      console.log('API не нашли, ищем в локальной базе');
      movies = this.searchFallback(query);
    }
    
    console.log(`Найдено фильмов: ${movies.length}`);
    return movies;
  }

  // Поиск в локальной базе
  private searchFallback(query: string): Movie[] {
    const lowerQuery = query.toLowerCase().trim();
    
    // Точное совпадение
    let results = MovieService.FALLBACK_MOVIES.filter(movie => 
      movie.title.toLowerCase().includes(lowerQuery)
    );
    
    if (results.length > 0) {
      return results.slice(0, 5);
    }
    
    // Разбиваем на слова
    const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);
    
    // Поиск по словам
    results = MovieService.FALLBACK_MOVIES.filter(movie => {
      const titleLower = movie.title.toLowerCase();
      return words.some(word => titleLower.includes(word));
    });
    
    if (results.length > 0) {
      return results.slice(0, 5);
    }
    
    // Поиск по жанрам/ключевым словам
    const genreMap: { [key: string]: string[] } = {
      'комедия': ['один дома', 'маска', 'ирония судьбы', 'служебный роман', 'любовь и голуби', 'джентльмены удачи', 'кавказская пленница', 'операция ы', 'иван васильевич'],
      'боевик': ['матрица', 'терминатор', 'брат', 'темный рыцарь', 'мстители', 'джон уик'],
      'драма': ['зеленая миля', 'форрест гамп', 'побег из шоушенка', 'титаник', 'интерстеллар', 'джокер'],
      'фантастика': ['аватар', 'звездные войны', 'интерстеллар', 'матрица', 'терминатор', 'начало'],
      'мультфильм': ['шрек', 'шрек 2', 'шрек третий', 'шрек навсегда'],
      'русский': ['брат', 'брат 2', 'ирония судьбы', 'служебный роман', 'любовь и голуби', 'кавказская пленница', 'операция ы', 'иван васильевич'],
      'ужасы': ['сияние', 'оно', 'звонок', 'проклятие'],
      'триллер': ['начало', 'бойцовский клуб', 'джокер', 'семь'],
    };
    
    for (const [genre, titles] of Object.entries(genreMap)) {
      if (lowerQuery.includes(genre)) {
        results = MovieService.FALLBACK_MOVIES.filter(movie => 
          titles.some(title => movie.title.toLowerCase().includes(title))
        );
        if (results.length > 0) {
          return results.slice(0, 5);
        }
      }
    }
    
    // Если ничего не нашли, возвращаем популярные фильмы
    return this.getPopularFallback();
  }

  private getPopularFallback(): Movie[] {
    const popularIds = ['2', '6', '9', '12', '1']; // Шрек, Матрица, Гарри Поттер, Властелин колец, Аватар
    return popularIds
      .map(id => MovieService.FALLBACK_MOVIES.find(m => m.id === id))
      .filter(m => m !== undefined) as Movie[];
  }

  async searchByGenre(genre: string): Promise<Movie[]> {
    return this.searchFallback(genre);
  }
}