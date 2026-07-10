import axios from 'axios';
import i18n from '../i18n';
import { isSupabaseEnabled, supabase } from './supabase';

const getLangCode = () => {
  const lng = i18n.language || 'en';
  const map: Record<string, string> = {
    id: 'id-ID',
    en: 'en-US',
    ja: 'ja-JP',
    ko: 'ko-KR',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    zh: 'zh-CN',
    ar: 'ar-SA',
    ru: 'ru-RU'
  };
  return map[lng] || 'en-US';
};



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
  releaseDate?: string;
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
  directorId?: number;
  cast: string[];
  castMembers: CastMember[];
  genres: string[];
  duration: string;
  releaseDate: string;
  streamSources: { name: string; url: string }[];
  voteCount: number;
  trailerKey?: string;
  originalLanguage?: string;
}

export interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownFor: string;
  popularity: number;
  credits: UnifiedMovie[];
}

// --- Language map ---
const LANGUAGE_MAP: Record<string, string> = {
  en: 'English', id: 'Indonesian', ko: 'Korean', ja: 'Japanese',
  zh: 'Chinese', fr: 'French', de: 'German', es: 'Spanish',
  pt: 'Portuguese', it: 'Italian', hi: 'Hindi', th: 'Thai',
  ru: 'Russian', ar: 'Arabic', tr: 'Turkish', nl: 'Dutch',
  sv: 'Swedish', da: 'Danish', fi: 'Finnish', no: 'Norwegian',
};

export const getLanguageName = (code: string): string =>
  LANGUAGE_MAP[code] || code.toUpperCase();

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
  type: data.name ? 'series' : 'movie',
  releaseDate: data.release_date || data.first_air_date || '',
});

// --- API Implementation ---

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  }
});

const getTmdbPopularMovies = async (page: number = 1): Promise<UnifiedMovie[]> => {
  const res = await api.get('/movie/popular', { params: { language: getLangCode(), region: 'US', page } });
  return res.data.results.map(normalizeTMDB);
};

export const movieService = {
  getPopularMovies: async (page: number = 1) => {
    if (!isSupabaseEnabled) {
      return getTmdbPopularMovies(page);
    }

    try {
      // 1. Fetch top viewed items from Supabase
      // Minimum 5 views to be considered "trending" — needs real engagement, not just 1-2 accidental views
      const { data: supabaseData, error } = await supabase
        .from('movie_views')
        .select('*')
        .gte('view_count', 5)
        .order('view_count', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);

      // 2. Fetch popular movies from TMDB as backup/padding
      const res = await api.get('/movie/popular', { params: { language: getLangCode(), region: 'US', page } });
      const tmdbMovies = res.data.results.map(normalizeTMDB);

      if (error || !supabaseData || supabaseData.length === 0) {
        // Fallback to TMDB if Supabase fails or is empty
        return tmdbMovies;
      }

      // Map Supabase data to UnifiedMovie
      const watchedMovies: UnifiedMovie[] = supabaseData.map((item: any) => ({
        id: item.tmdb_id,
        title: item.title,
        poster: item.poster_path || '',
        backdrop: item.backdrop_path || '',
        rating: item.rating || '8.0',
        quality: '4K',
        type: (item.type || 'movie') as 'movie' | 'series',
        releaseDate: ''
      }));

      // Combine and deduplicate: prioritize watchedMovies
      const combined = [...watchedMovies];
      const seenIds = new Set(watchedMovies.map(m => m.id));

      for (const m of tmdbMovies) {
        if (!seenIds.has(m.id)) {
          combined.push(m);
        }
      }

      return combined.slice(0, 20);
    } catch (err) {
      console.error('Failed to get popular/trending movies from Supabase:', err);
      return getTmdbPopularMovies(page);
    }
  },

  getRecentMovies: async (page: number = 1) => {
    const res = await api.get('/movie/now_playing', { params: { language: getLangCode(), region: 'US', page } });
    return res.data.results.map(normalizeTMDB);
  },

  getTopRatedMovies: async (page: number = 1) => {
    try {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 2; // e.g. 2024 if 2026
      const startDate = `${startYear}-01-01`;

      const [moviesRes, tvRes] = await Promise.all([
        api.get('/discover/movie', {
          params: {
            language: getLangCode(),
            region: 'US',
            sort_by: 'vote_average.desc',
            'vote_count.gte': 300,
            'primary_release_date.gte': startDate,
            page
          }
        }),
        api.get('/discover/tv', {
          params: {
            language: getLangCode(),
            sort_by: 'vote_average.desc',
            'vote_count.gte': 150,
            'first_air_date.gte': startDate,
            page
          }
        })
      ]);

      const movies = moviesRes.data.results.map((m: any) => ({ ...m, name: undefined }));
      const tvs = tvRes.data.results;

      const combined = [...movies, ...tvs]
        .map(normalizeTMDB)
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

      return combined.slice(0, 20);
    } catch (err) {
      console.error('Failed to fetch top rated mixed content:', err);
      const res = await api.get('/movie/top_rated', { params: { language: getLangCode(), region: 'US', page } });
      return res.data.results.map(normalizeTMDB);
    }
  },

  getPopularSeries: async (page: number = 1) => {
    const res = await api.get('/tv/popular', { params: { language: getLangCode(), page } });
    return res.data.results.map(normalizeTMDB);
  },

  search: async (query: string) => {
    const res = await api.get('/search/multi', { params: { query, language: getLangCode() } });
    return res.data.results
      .filter((item: any) => item.media_type !== 'person')
      .map(normalizeTMDB);
  },

  getMovieDetail: async (id: string, type?: 'movie' | 'series'): Promise<UnifiedMovieDetail | null> => {
    const isTV = type === 'series' || id.startsWith('tv-') || id.startsWith('series-');
    const cleanId = id.replace(/^(movie|series|tv)-/, '');

    if (isTV) {
      try {
        const res = await api.get(`/tv/${cleanId}`, { params: { append_to_response: 'credits,videos', language: getLangCode() } });
        const tv = res.data;
        const cast = tv.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];
        const castMembers = tv.credits?.cast?.slice(0, 15).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w500') : null
        })) || [];
        const genres = tv.genres?.map((g: any) => g.name) || [];

        const trailerVideo = tv.videos?.results?.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || tv.videos?.results?.find(
          (v: any) => v.site === 'YouTube'
        );

        // Find creator
        const creator = tv.created_by?.[0];

        return {
          ...normalizeTMDB(tv),
          id: cleanId,
          synopsis: tv.overview,
          director: creator?.name || 'Various',
          directorId: creator?.id,
          cast,
          castMembers,
          genres,
          duration: `${tv.number_of_seasons} Season${tv.number_of_seasons > 1 ? 's' : ''}`,
          releaseDate: tv.first_air_date,
          voteCount: tv.vote_count,
          trailerKey: trailerVideo?.key,
          originalLanguage: tv.original_language,
          streamSources: [
            { name: 'Server 1 (Primary)', url: `https://vidsrcme.su/embed/tv/${cleanId}` },
            { name: 'Server 2 (Backup)', url: `https://vidsrcme.ru/embed/tv/${cleanId}` },
            { name: 'Server 3 (Mirror)', url: `https://vidsrc-me.ru/embed/tv/${cleanId}` },
            { name: 'Server 4 (HD Stream)', url: `https://vidlink.pro/tv/${cleanId}` },
            { name: 'Server 5 (Regional)', url: `https://autoembed.co/tv/tmdb/${cleanId}` },
            { name: 'Server 6 (Global)', url: `https://vidsrc.cc/v2/embed/tv/${cleanId}` }
          ]
        };
      } catch (err) {
        console.error("Failed to fetch TMDB tv details", err);
        return null;
      }
    } else {
      try {
        const res = await api.get(`/movie/${cleanId}`, { params: { append_to_response: 'credits,videos', language: getLangCode() } });
        const movie = res.data;

        const director = movie.credits?.crew?.find((c: any) => c.job === 'Director');
        const directorName = director?.name || 'Unknown';
        const directorId = director?.id;
        const cast = movie.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];
        const castMembers = movie.credits?.cast?.slice(0, 15).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w500') : null
        })) || [];
        const genres = movie.genres?.map((g: any) => g.name) || [];

        // Find YouTube trailer
        const trailerVideo = movie.videos?.results?.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || movie.videos?.results?.find(
          (v: any) => v.site === 'YouTube'
        );

        return {
          ...normalizeTMDB(movie),
          id: cleanId,
          synopsis: movie.overview,
          director: directorName,
          directorId,
          cast,
          castMembers,
          genres,
          duration: movie.runtime ? `${movie.runtime}m` : '',
          releaseDate: movie.release_date,
          voteCount: movie.vote_count,
          trailerKey: trailerVideo?.key,
          originalLanguage: movie.original_language,
          streamSources: [
            { name: 'Server 1 (Primary)', url: `https://vidsrcme.su/embed/movie/${cleanId}` },
            { name: 'Server 2 (Backup)', url: `https://vidsrcme.ru/embed/movie/${cleanId}` },
            { name: 'Server 3 (Mirror)', url: `https://vidsrc-me.ru/embed/tv/${cleanId}` }, // tv endpoint inside if fallback is used? Actually keep movie
            { name: 'Server 4 (HD Stream)', url: `https://vidlink.pro/movie/${cleanId}` },
            { name: 'Server 5 (Regional)', url: `https://autoembed.co/movie/tmdb/${cleanId}` },
            { name: 'Server 6 (Global)', url: `https://vidsrc.cc/v2/embed/movie/${cleanId}` },
            { name: 'Server 7 (SuperEmbed)', url: `https://multiembed.mov/directstream.php?video_id=${cleanId}&tmdb=1` },
            { name: 'Server 8 (WarezCDN)', url: `https://embed.warezcdn.com/movie/${cleanId}` },
            { name: 'Server 9 (NontonGo)', url: `https://www.nontongo.win/embed/movie/${cleanId}` },
            { name: 'Server 10 (2Embed)', url: `https://www.2embed.cc/embed/${cleanId}` },
            { name: 'Server Indo (Mino)', url: `https://minochinos.com/embed/${cleanId}` }
          ]
        };
      } catch (e) {
        if (!type) {
          // Fallback to TV if Movie fails and no type was specified
          try {
            const res = await api.get(`/tv/${cleanId}`, { params: { append_to_response: 'credits,videos', language: getLangCode() } });
            const tv = res.data;
            const cast = tv.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];
            const castMembers = tv.credits?.cast?.slice(0, 15).map((c: any) => ({
              id: c.id,
              name: c.name,
              character: c.character,
              profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w500') : null
            })) || [];
            const genres = tv.genres?.map((g: any) => g.name) || [];

            const trailerVideo = tv.videos?.results?.find(
              (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
            ) || tv.videos?.results?.find(
              (v: any) => v.site === 'YouTube'
            );

            // Find creator
            const creator = tv.created_by?.[0];

            return {
              ...normalizeTMDB(tv),
              id: cleanId,
              synopsis: tv.overview,
              director: creator?.name || 'Various',
              directorId: creator?.id,
              cast,
              castMembers,
              genres,
              duration: `${tv.number_of_seasons} Season${tv.number_of_seasons > 1 ? 's' : ''}`,
              releaseDate: tv.first_air_date,
              voteCount: tv.vote_count,
              trailerKey: trailerVideo?.key,
              originalLanguage: tv.original_language,
              streamSources: [
                { name: 'Server 1 (Primary)', url: `https://vidsrcme.su/embed/tv/${cleanId}` },
                { name: 'Server 2 (Backup)', url: `https://vidsrcme.ru/embed/tv/${cleanId}` },
                { name: 'Server 3 (Mirror)', url: `https://vidsrc-me.ru/embed/tv/${cleanId}` },
                { name: 'Server 4 (HD Stream)', url: `https://vidlink.pro/tv/${cleanId}` },
                { name: 'Server 5 (Regional)', url: `https://autoembed.co/tv/tmdb/${cleanId}` },
                { name: 'Server 6 (Global)', url: `https://vidsrc.cc/v2/embed/tv/${cleanId}` }
              ]
            };
          } catch (err) {
            console.error("Failed to fetch TMDB tv fallback details", err);
            return null;
          }
        }
        console.error("Failed to fetch TMDB movie details", e);
        return null;
      }
    }
  },

  getSimilarMovies: async (id: string, type: 'movie' | 'series' = 'movie'): Promise<UnifiedMovie[]> => {
    try {
      const endpoint = type === 'series' ? `/tv/${id}/similar` : `/movie/${id}/similar`;
      const res = await api.get(endpoint, { params: { language: getLangCode(), page: 1 } });
      return res.data.results.slice(0, 12).map(normalizeTMDB);
    } catch {
      return [];
    }
  },

  getPersonDetail: async (personId: string): Promise<PersonDetail | null> => {
    try {
      const res = await api.get(`/person/${personId}`, {
        params: { append_to_response: 'combined_credits', language: getLangCode() }
      });
      const person = res.data;

      // Get combined credits sorted by popularity, deduplicated
      const seen = new Set<number>();
      const credits: UnifiedMovie[] = (person.combined_credits?.cast || [])
        .filter((c: any) => {
          if (seen.has(c.id) || !c.poster_path) return false;
          seen.add(c.id);
          return true;
        })
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, 24)
        .map((c: any) => normalizeTMDB(c));

      return {
        id: person.id,
        name: person.name,
        biography: person.biography || '',
        birthday: person.birthday,
        deathday: person.deathday,
        placeOfBirth: person.place_of_birth,
        profilePath: person.profile_path ? getImageUrl(person.profile_path, 'w500') : null,
        knownFor: person.known_for_department || 'Acting',
        popularity: person.popularity,
        credits,
      };
    } catch (err) {
      console.error('Failed to fetch person detail', err);
      return null;
    }
  },

  getMoviesByGenre: async (genreId: string, page: number = 1) => {
    const res = await api.get('/discover/movie', {
      params: {
        with_genres: genreId,
        language: getLangCode(),
        page: page,
        sort_by: 'popularity.desc'
      }
    });
    return res.data.results.map(normalizeTMDB);
  },

  getSeriesByGenre: async (genreId: string, page: number = 1) => {
    const res = await api.get('/discover/tv', {
      params: {
        with_genres: genreId,
        language: getLangCode(),
        page: page,
        sort_by: 'popularity.desc'
      }
    });
    return res.data.results.map(normalizeTMDB);
  },

  getUpcomingMovies: async (page: number = 1) => {
    const res = await api.get('/movie/upcoming', { params: { language: getLangCode(), region: 'US', page } });
    const movies = res.data.results.map(normalizeTMDB);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return movies.filter((movie: UnifiedMovie) => {
      if (!movie.releaseDate) return false;
      const parts = movie.releaseDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const release = new Date(year, month, day);
          return release > today;
        }
      }
      const fallback = new Date(movie.releaseDate);
      return !isNaN(fallback.getTime()) && fallback > today;
    });
  },

  getTrendingMovies: async (page: number = 1) => {
    const res = await api.get('/trending/movie/week', { params: { language: getLangCode(), page } });
    return res.data.results.map(normalizeTMDB);
  },

  getRandomByGenre: async (genreId?: string, type: 'movie' | 'series' | 'both' = 'both'): Promise<UnifiedMovie | null> => {
    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const pickType = type === 'both' ? (Math.random() > 0.5 ? 'movie' : 'series') : type;
      const endpoint = pickType === 'series' ? '/discover/tv' : '/discover/movie';

      const params: Record<string, any> = {
        language: getLangCode(),
        page: randomPage,
        sort_by: 'vote_count.desc',
        'vote_average.gte': 7,
        'vote_count.gte': 500,
      };
      if (genreId) params.with_genres = genreId;

      const res = await api.get(endpoint, { params });
      const results = res.data.results.filter((m: any) => m.poster_path);
      if (results.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * results.length);
      return normalizeTMDB(results[randomIndex]);
    } catch {
      return null;
    }
  },
};
