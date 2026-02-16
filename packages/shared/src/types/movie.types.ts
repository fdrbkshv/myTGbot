export interface Movie {
  id: string;
  title: string;
  year: string;
  poster?: string;
  description?: string;
  rating?: number;
  source: 'kinopoisk' | 'kinopoisk-unofficial' | 'omdb' | 'tmdb';
}

export interface MovieSearchResult {
  movies: Movie[];
  total: number;
}

export interface MovieDetails extends Movie {
  genres?: string[];
  director?: string;
  actors?: string[];
  plot?: string;
  imdbRating?: string;
}