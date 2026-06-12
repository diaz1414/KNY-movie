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
  getPopularMovies: async (page: number = 1) => {
    const res = await api.get('/movie/popular', { params: { language: 'en-US', region: 'US', page } });
    return res.data.results.map(normalizeTMDB);
  },

  getRecentMovies: async (page: number = 1) => {
    const res = await api.get('/movie/now_playing', { params: { language: 'en-US', region: 'US', page } });
    return res.data.results.map(normalizeTMDB);
  },

  getTopRatedMovies: async (page: number = 1) => {
    const res = await api.get('/movie/top_rated', { params: { language: 'en-US', region: 'US', page } });
    return res.data.results.map(normalizeTMDB);
  },

  getPopularSeries: async (page: number = 1) => {
    const res = await api.get('/tv/popular', { params: { language: 'en-US', region: 'US', page } });
    return res.data.results.map(normalizeTMDB);
  },

  search: async (query: string) => {
    const res = await api.get('/search/multi', { params: { query, language: 'en-US' } });
    return res.data.results
      .filter((item: any) => item.media_type !== 'person')
      .map(normalizeTMDB);
  },

  getMovieDetail: async (id: string): Promise<UnifiedMovieDetail | null> => {
    try {
      const res = await api.get(`/movie/${id}`, { params: { append_to_response: 'credits,videos', language: 'en-US' } });
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
        const res = await api.get(`/tv/${id}`, { params: { append_to_response: 'credits,videos', language: 'en-US' } });
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

  getSimilarMovies: async (id: string, type: 'movie' | 'series' = 'movie'): Promise<UnifiedMovie[]> => {
    try {
      const endpoint = type === 'series' ? `/tv/${id}/similar` : `/movie/${id}/similar`;
      const res = await api.get(endpoint, { params: { language: 'en-US', page: 1 } });
      return res.data.results.slice(0, 12).map(normalizeTMDB);
    } catch {
      return [];
    }
  },

  getPersonDetail: async (personId: string): Promise<PersonDetail | null> => {
    try {
      const res = await api.get(`/person/${personId}`, {
        params: { append_to_response: 'combined_credits', language: 'en-US' }
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
        language: 'en-US',
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
        language: 'en-US',
        page: page,
        sort_by: 'popularity.desc'
      }
    });
    return res.data.results.map(normalizeTMDB);
  },

  getUpcomingMovies: async (page: number = 1) => {
    const res = await api.get('/movie/upcoming', { params: { language: 'en-US', region: 'US', page } });
    return res.data.results.map(normalizeTMDB);
  },

  getTrendingMovies: async (page: number = 1) => {
    const res = await api.get('/trending/movie/week', { params: { language: 'en-US', page } });
    return res.data.results.map(normalizeTMDB);
  },

  getRandomByGenre: async (genreId?: string, type: 'movie' | 'series' | 'both' = 'both'): Promise<UnifiedMovie | null> => {
    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const pickType = type === 'both' ? (Math.random() > 0.5 ? 'movie' : 'series') : type;
      const endpoint = pickType === 'series' ? '/discover/tv' : '/discover/movie';

      const params: Record<string, any> = {
        language: 'en-US',
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
