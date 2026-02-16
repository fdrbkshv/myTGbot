import { Movie } from '../../../shared/src/types/movie.types';

export interface MovieCacheItem {
  id: string;
  title: string;
  year: string;
  source: Movie['source'];
}

export class MovieModel {
  static fromKinopoisk(data: any): Movie {
    return {
      id: data.id?.toString() || '',
      title: data.name || data.alternativeName || 'Без названия',
      year: data.year?.toString() || '?',
      poster: data.poster?.url || '',
      description: data.description || data.shortDescription || '',
      rating: data.rating?.kp || data.rating?.imdb || 0,
      source: 'kinopoisk'
    };
  }

  static fromKinopoiskUnofficial(data: any): Movie {
    return {
      id: data.filmId?.toString() || '',
      title: data.nameRu || data.nameEn || 'Без названия',
      year: data.year?.toString() || '?',
      poster: data.posterUrl || '',
      description: data.description || '',
      rating: data.rating || 0,
      source: 'kinopoisk-unofficial'
    };
  }

  static toCacheItem(movie: Movie): MovieCacheItem {
    return {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      source: movie.source
    };
  }
}