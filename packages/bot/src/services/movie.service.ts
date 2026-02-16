import { Movie } from '../../../shared/src/types/movie.types';
import { MovieModel } from '../models/movie.model';

export class MovieService {
  private static readonly KINOPOISK_API = 'https://api.kinopoisk.dev/v1.4';
  private static readonly KINOPOISK_UNOFFICIAL = 'https://kinopoiskapiunofficial.tech/api/v2.1';

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
    let movies = await this.searchKinopoisk(query);
    if (movies.length === 0) {
      movies = await this.searchRussianMovie(query);
    }
    return movies;
  }
}