import axios from 'axios';

// --- Configuration ---

// REPLACEME: Get your free API Key at https://www.themoviedb.org/settings/api
const TMDB_API_KEY = 'f76f5f908dd164d45ec92431b0517a3a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// --- Types ---

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  name?: string; // For TV shows
  original_name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  first_air_date?: string;
  overview: string;
  genre_ids: number[];
}

export interface UnifiedMovie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: string;
  quality: string; // TMDB doesn't provide quality directly, we default to HD/4K
  type: 'movie' | 'series';
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface UnifiedMovieDetail extends UnifiedMovie {
  synopsis: string;
  director: string;
  cast: string[];
  castMembers: CastMember[];
  genres: string[];
  duration: string;
  releaseDate: string;
  streamSources: { name: string; url: string }[];
  voteCount: number;
}

// --- Helpers ---

const getImageUrl = (path: string, size: 'w500' | 'original' | 'w1280' = 'w500') =>
  path ? `${IMAGE_BASE_URL}/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';

const normalizeTMDB = (data: TMDBMovie): UnifiedMovie => ({
  id: data.id.toString(),
  title: data.title || data.name || data.original_title || data.original_name || 'Untitled',
  poster: getImageUrl(data.poster_path, 'w500'),
  backdrop: getImageUrl(data.backdrop_path, 'w1280'),
  rating: data.vote_average.toFixed(1),
  quality: '4K',
  type: data.name ? 'series' : 'movie'
});

// --- API Implementation ---

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  }
});

export const movieService = {
  getPopularMovies: async (lang: string = 'en-US') => {
    const res = await api.get('/movie/popular', { params: { language: lang, region: 'US' } });
    return res.data.results.map(normalizeTMDB);
  },

  getRecentMovies: async (lang: string = 'en-US') => {
    const res = await api.get('/movie/now_playing', { params: { language: lang, region: 'US' } });
    return res.data.results.map(normalizeTMDB);
  },

  getPopularSeries: async (lang: string = 'en-US') => {
    const res = await api.get('/tv/popular', { params: { language: lang, region: 'US' } });
    return res.data.results.map(normalizeTMDB);
  },

  search: async (query: string, lang: string = 'en-US') => {
    const res = await api.get('/search/multi', { params: { query, language: lang } });
    return res.data.results
      .filter((item: any) => item.media_type !== 'person')
      .map(normalizeTMDB);
  },

  getMovieDetail: async (id: string, lang: string = 'en-US'): Promise<UnifiedMovieDetail | null> => {
    try {
      const res = await api.get(`/movie/${id}`, { params: { append_to_response: 'credits', language: lang } });
      const movie = res.data;

      const director = movie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';
      const cast = movie.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];
      const castMembers = movie.credits?.cast?.slice(0, 15).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w500') : null
      })) || [];
      const genres = movie.genres?.map((g: any) => g.name) || [];

      return {
        ...normalizeTMDB(movie),
        synopsis: movie.overview,
        director,
        cast,
        castMembers,
        genres,
        duration: movie.runtime ? `${movie.runtime}m` : '',
        releaseDate: movie.release_date,
        voteCount: movie.vote_count,
        streamSources: [
          { name: 'Server 1 (Primary)', url: `https://vidsrcme.su/embed/movie/${id}` },
          { name: 'Server 2 (Backup)', url: `https://vidsrcme.ru/embed/movie/${id}` },
          { name: 'Server 3 (Mirror)', url: `https://vidsrc-me.ru/embed/movie/${id}` },
          { name: 'Server 4 (HD Stream)', url: `https://vidlink.pro/movie/${id}` },
          { name: 'Server 5 (Regional)', url: `https://autoembed.co/movie/tmdb/${id}` },
          { name: 'Server 6 (Global)', url: `https://vidsrc.cc/v2/embed/movie/${id}` },
          { name: 'Server 7 (SuperEmbed)', url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
          { name: 'Server 8 (WarezCDN)', url: `https://embed.warezcdn.com/serie/${id}` }, // Coba ganti /movie/ kalau film
          { name: 'Server 9 (NontonGo)', url: `https://www.nontongo.win/embed/movie/${id}` },
          { name: 'Server 10 (2Embed)', url: `https://www.2embed.cc/embed/${id}` },
          { name: 'Server Indo (Mino)', url: `https://minochinos.com/embed/${id}` }
        ]
      };
    } catch (e) {
      // Try TV if Movie fails
      try {
        const res = await api.get(`/tv/${id}`, { params: { append_to_response: 'credits' } });
        const tv = res.data;
        const cast = tv.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];
        const castMembers = tv.credits?.cast?.slice(0, 15).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w500') : null
        })) || [];
        const genres = tv.genres?.map((g: any) => g.name) || [];

        return {
          ...normalizeTMDB(tv),
          synopsis: tv.overview,
          director: 'Various',
          cast,
          castMembers,
          genres,
          duration: `${tv.number_of_seasons} Seasons`,
          releaseDate: tv.first_air_date,
          voteCount: tv.vote_count,
          streamSources: [
            { name: 'Server 1 (Primary)', url: `https://vidsrcme.su/embed/tv/${id}` },
            { name: 'Server 2 (Backup)', url: `https://vidsrcme.ru/embed/tv/${id}` },
            { name: 'Server 3 (Mirror)', url: `https://vidsrc-me.ru/embed/tv/${id}` },
            { name: 'Server 4 (HD Stream)', url: `https://vidlink.pro/tv/${id}` },
            { name: 'Server 5 (Regional)', url: `https://autoembed.co/tv/tmdb/${id}` },
            { name: 'Server 6 (Global)', url: `https://vidsrc.cc/v2/embed/tv/${id}` }
          ]
        };
      } catch (err) {
        console.error("Failed to fetch TMDB details", err);
        return null;
      }
    }
  },

  getMoviesByGenre: async (genreId: string, page: number = 1, lang: string = 'en-US') => {
    const res = await api.get('/discover/movie', {
      params: {
        with_genres: genreId,
        language: lang,
        page: page,
        sort_by: 'popularity.desc'
      }
    });
    return res.data.results.map(normalizeTMDB);
  },

  getSeriesByGenre: async (genreId: string, page: number = 1, lang: string = 'en-US') => {
    const res = await api.get('/discover/tv', {
      params: {
        with_genres: genreId,
        language: lang,
        page: page,
        sort_by: 'popularity.desc'
      }
    });
    return res.data.results.map(normalizeTMDB);
  }
};
