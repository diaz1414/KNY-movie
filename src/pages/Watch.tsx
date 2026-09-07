import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getStreamById, type PlayableStream } from '../services/streamService';
import { LiveVideoPlayer } from '../components/live/LiveVideoPlayer';
import Footer from '../components/Footer';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Tv,
  Radio,
  Clock,
  Play,
  PlayCircle,
  FastForward,
  SkipForward,
  Clapperboard,
  Share2,
  Layers,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Languages,
  AlertCircle,
  FileText,
  Users,
  Hash,
  Sparkles,
  Calendar,
  Star,
  Monitor,
  ArrowUp,
  Search,
  LayoutGrid,
  ListFilter,
  Check,
  Info
} from 'lucide-react';
import { SiWhatsapp, SiFacebook, SiX, SiTelegram } from 'react-icons/si';

const TMDB_API_KEY = 'f76f5f908dd164d45ec92431b0517a3a';

interface TMDBEpisode {
  episode_number: number;
  name: string;
  air_date: string | null;
  runtime: number | null;
  still_path: string | null;
  overview: string;
}

interface TMDBSeason {
  season_number: number;
  name: string;
  poster_path: string | null;
  episode_count: number;
}

interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface TMDBDetail {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  genres: { id: number; name: string }[];
  seasons?: TMDBSeason[];
  number_of_seasons?: number;
  status?: string;
  credits?: {
    cast: TMDBCast[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: {
    results: { key: string; site: string; type: string; official?: boolean }[];
  };
}

interface TMDBRecommendation {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

// 10+ Streaming Server Configurations
const SERVER_CONFIG = [
  {
    name: 'Server 1 (Autoembed)',
    movie: (id: string) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id: string, s: number, e: number) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'Server 2 (VidLink)',
    movie: (id: string) => `https://vidlink.pro/movie/${id}`,
    tv: (id: string, s: number, e: number) => `https://vidlink.pro/tv/${id}/${s}/${e}`
  },
  {
    name: 'Server 3 (2Embed)',
    movie: (id: string) => `https://www.2embed.cc/embed/${id}`,
    tv: (id: string, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
  },
  {
    name: 'Server 4 (Vidsrc Pro)',
    movie: (id: string) => `https://vidsrc.pro/embed/movie/${id}`,
    tv: (id: string, s: number, e: number) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'Server 5 (Vidsrc In)',
    movie: (id: string) => `https://vidsrc.in/embed/movie/${id}`,
    tv: (id: string, s: number, e: number) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'Server 6 (Vidsrc CC)',
    movie: (id: string) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id: string, s: number, e: number) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'Server 7 (SmashyStream)',
    movie: (id: string) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tv: (id: string, s: number, e: number) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  },
  {
    name: 'Server 8 (SuperEmbed)',
    movie: (id: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: string, s: number, e: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
  },
  {
    name: 'Server 9 (Multiembed)',
    movie: (id: string) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    tv: (id: string, s: number, e: number) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`
  },
  {
    name: 'Server 10 (EmbedSoap)',
    movie: (id: string) => `https://www.embedsoap.com/embed/movie/?id=${id}`,
    tv: (id: string, s: number, e: number) => `https://www.embedsoap.com/embed/tv/?id=${id}&s=${s}&e=${e}`
  },
  {
    name: 'Server 11 (Player4U)',
    movie: (id: string) => `https://player4u.xyz/embed/movie/${id}`,
    tv: (id: string, s: number, e: number) => `https://player4u.xyz/embed/tv/${id}/${s}/${e}`
  }
];

// Helper: Parse Local Date
const parseLocalDate = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const Watch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Params
  const liveId = searchParams.get('live');
  const rawId = searchParams.get('id');
  const rawType = searchParams.get('type') || 'movie';

  // Normalize id & type (e.g. series-1234 or tv-1234)
  const { movieId, contentType } = useMemo(() => {
    let mId = rawId || '';
    let cType = rawType;
    if (mId && (mId.startsWith('tv-') || mId.startsWith('series-') || mId.startsWith('movie-'))) {
      const parts = mId.split('-');
      cType = parts[0] === 'series' || parts[0] === 'tv' ? 'tv' : 'movie';
      mId = parts.slice(1).join('-');
    }
    return { movieId: mId, contentType: cType };
  }, [rawId, rawType]);

  const isTV = contentType === 'tv' || contentType === 'series';

  // --- LIVE SPORTS MODE STATES ---
  const [liveStream, setLiveStream] = useState<PlayableStream | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // --- MOVIE / SERIES STATES ---
  const [movieDetail, setMovieDetail] = useState<TMDBDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [currentSeason, setCurrentSeason] = useState<number>(() => {
    const sParam = searchParams.get('s');
    if (sParam) return parseInt(sParam, 10) || 1;
    if (movieId) {
      try {
        const saved = localStorage.getItem(`ykn_progress_${movieId}`);
        if (saved) return JSON.parse(saved).s || 1;
      } catch (e) { /* ignore */ }
    }
    return 1;
  });

  const [currentEpisode, setCurrentEpisode] = useState<number>(() => {
    const eParam = searchParams.get('e');
    if (eParam) return parseInt(eParam, 10) || 1;
    if (movieId) {
      try {
        const saved = localStorage.getItem(`ykn_progress_${movieId}`);
        if (saved) return JSON.parse(saved).e || 1;
      } catch (e) { /* ignore */ }
    }
    return 1;
  });

  const [currentServerIndex, setCurrentServerIndex] = useState<number>(() => {
    if (movieId) {
      try {
        const saved = localStorage.getItem(`ykn_progress_${movieId}`);
        if (saved) return JSON.parse(saved).server || 0;
      } catch (e) { /* ignore */ }
    }
    return 0;
  });

  const [episodesList, setEpisodesList] = useState<TMDBEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState('');
  const [episodeViewMode, setEpisodeViewMode] = useState<'carousel' | 'grid'>('carousel');

  const [isAutoNextEnabled, setIsAutoNextEnabled] = useState<boolean>(() => {
    return localStorage.getItem('ykn_autonext') === 'true';
  });

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  const [recommendations, setRecommendations] = useState<TMDBRecommendation[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // References
  const playerIframeRef = useRef<HTMLIFrameElement | null>(null);
  const seasonListRef = useRef<HTMLDivElement | null>(null);
  const episodeGridRef = useRef<HTMLDivElement | null>(null);
  const castScrollRef = useRef<HTMLDivElement | null>(null);
  const recGridRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch live stream if liveId is present
  useEffect(() => {
    if (!liveId) return;

    const fetchLiveStream = async () => {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const stream = await getStreamById(liveId);
        if (stream) {
          setLiveStream(stream);
        } else {
          setLiveError('Jalur siaran langsung tidak ditemukan.');
        }
      } catch (err) {
        console.error('Failed to fetch live stream details:', err);
        setLiveError('Gagal memuat detail siaran.');
      } finally {
        setLiveLoading(false);
      }
    };

    fetchLiveStream();
  }, [liveId]);

  // 2. Fetch TMDB Movie/TV Details
  useEffect(() => {
    if (liveId || !movieId) return;

    let isMounted = true;
    const fetchDetails = async () => {
      setIsLoadingDetail(true);
      setDetailError(null);

      try {
        const endpoint = isTV ? 'tv' : 'movie';
        let res = await fetch(
          `https://api.themoviedb.org/3/${endpoint}/${movieId}?api_key=${TMDB_API_KEY}&language=id-ID&append_to_response=credits,videos`
        );
        let data = await res.json();

        // Fallback to English if overview is missing in id-ID
        if (!data.overview || data.overview.trim() === '') {
          const enRes = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`
          );
          const enData = await enRes.json();
          data = { ...data, overview: enData.overview || data.overview, videos: enData.videos || data.videos };
        }

        if (isMounted) {
          setMovieDetail(data);

          // Update Document Title & Favicon
          const pageTitle = (data.title || data.name || 'Tayangan') + ' - Yuk Kita Nonton';
          document.title = pageTitle;
        }
      } catch (err) {
        console.error('Failed to fetch TMDB details:', err);
        if (isMounted) {
          setDetailError('Gagal memuat detail tayangan dari server.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [movieId, isTV, liveId]);

  // 3. Fetch TV Episodes when currentSeason changes
  useEffect(() => {
    if (!isTV || !movieId || liveId) return;

    let isMounted = true;
    const fetchEpisodes = async () => {
      setIsLoadingEpisodes(true);
      try {
        let res = await fetch(
          `https://api.themoviedb.org/3/tv/${movieId}/season/${currentSeason}?api_key=${TMDB_API_KEY}&language=id-ID`
        );
        let data = await res.json();

        // Check if episodes have english overviews fallback
        if (data.episodes && data.episodes.length > 0 && !data.episodes[0].overview) {
          const enRes = await fetch(
            `https://api.themoviedb.org/3/tv/${movieId}/season/${currentSeason}?api_key=${TMDB_API_KEY}&language=en-US`
          );
          const enData = await enRes.json();
          if (enData.episodes) {
            data.episodes = data.episodes.map((ep: TMDBEpisode, i: number) => ({
              ...ep,
              overview: ep.overview || enData.episodes[i]?.overview || ''
            }));
          }
        }

        if (isMounted && data.episodes) {
          setEpisodesList(data.episodes);
        }
      } catch (err) {
        console.error('Failed to fetch season episodes:', err);
      } finally {
        if (isMounted) {
          setIsLoadingEpisodes(false);
        }
      }
    };

    fetchEpisodes();

    return () => {
      isMounted = false;
    };
  }, [movieId, isTV, currentSeason, liveId]);

  // 4. Fetch Similar / Recommendations
  useEffect(() => {
    if (liveId || !movieId) return;

    const fetchRecommendations = async () => {
      try {
        const endpoint = isTV ? 'tv' : 'movie';
        const res = await fetch(
          `https://api.themoviedb.org/3/${endpoint}/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=id-ID&page=1`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setRecommendations(data.results.slice(0, 15));
        } else {
          // Fallback to similar
          const simRes = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${movieId}/similar?api_key=${TMDB_API_KEY}&language=id-ID&page=1`
          );
          const simData = await simRes.json();
          if (simData.results) {
            setRecommendations(simData.results.slice(0, 15));
          }
        }
      } catch (e) {
        console.error('Failed to fetch recommendations:', e);
      }
    };

    fetchRecommendations();
  }, [movieId, isTV, liveId]);

  // 5. Sync URL query parameters smoothly without reloading
  useEffect(() => {
    if (liveId) return;
    if (!movieId) return;

    const newParams: Record<string, string> = {
      id: movieId,
      type: isTV ? 'tv' : 'movie'
    };
    if (isTV) {
      newParams.s = String(currentSeason);
      newParams.e = String(currentEpisode);
    }
    setSearchParams(newParams, { replace: true });
  }, [movieId, isTV, currentSeason, currentEpisode, liveId, setSearchParams]);

  // 6. Save Progress & Watch History in LocalStorage
  useEffect(() => {
    if (!movieDetail || liveId || !movieId) return;

    const title = movieDetail.title || movieDetail.name || 'Tayangan';
    const poster = movieDetail.poster_path ? `https://image.tmdb.org/t/p/w200${movieDetail.poster_path}` : '';

    const progressData = {
      id: movieId,
      type: isTV ? 'tv' : 'movie',
      title,
      poster,
      s: currentSeason,
      e: currentEpisode,
      server: currentServerIndex,
      updatedAt: Date.now()
    };

    try {
      localStorage.setItem(`ykn_progress_${movieId}`, JSON.stringify(progressData));
      localStorage.setItem('ykn_last_watched', JSON.stringify(progressData));
    } catch (e) {
      console.warn('Unable to persist watch progress to localStorage:', e);
    }
  }, [movieDetail, currentSeason, currentEpisode, currentServerIndex, movieId, isTV, liveId]);

  // 7. Check if unreleased (Coming Soon)
  const isComingSoon = useMemo(() => {
    if (!movieDetail || isTV) return false;
    const releaseDateStr = movieDetail.release_date;
    if (!releaseDateStr) return false;
    const relDate = parseLocalDate(releaseDateStr);
    if (!relDate) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return relDate.getTime() > today.getTime();
  }, [movieDetail, isTV]);

  // 8. Auto-Next Episode Handler
  const handlePlayNextEpisode = useCallback(() => {
    if (!isTV) return;

    const currentIndex = episodesList.findIndex(ep => ep.episode_number === currentEpisode);
    if (currentIndex !== -1 && currentIndex < episodesList.length - 1) {
      const nextEp = episodesList[currentIndex + 1];
      setCurrentEpisode(nextEp.episode_number);
      setIsPlayerLoaded(false);
      setPlayerKey(k => k + 1);
    } else if (movieDetail?.seasons) {
      // Check if next season exists
      const nextSeason = movieDetail.seasons.find(s => s.season_number === currentSeason + 1);
      if (nextSeason) {
        setCurrentSeason(nextSeason.season_number);
        setCurrentEpisode(1);
        setIsPlayerLoaded(false);
        setPlayerKey(k => k + 1);
      }
    }
  }, [isTV, episodesList, currentEpisode, movieDetail, currentSeason]);

  // 9. PostMessage listener for embedded players that dispatch next episode events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isAutoNextEnabled) return;
      try {
        let msgData = event.data;
        if (typeof msgData === 'string') {
          try {
            msgData = JSON.parse(msgData);
          } catch (e) { /* ignore non-json strings */ }
        }
        if (msgData && (msgData.type === 'PLAYER_EVENT' && msgData.event === 'ended' || msgData.event === 'next')) {
          handlePlayNextEpisode();
        }
      } catch (e) {
        console.warn('Error reading player postMessage:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAutoNextEnabled, handlePlayNextEpisode]);

  // 10. Scroll to Top button visibility listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered episodes list based on search query
  const filteredEpisodes = useMemo(() => {
    if (!episodeSearchQuery.trim()) return episodesList;
    const q = episodeSearchQuery.toLowerCase().trim();
    return episodesList.filter(
      ep =>
        ep.name?.toLowerCase().includes(q) ||
        String(ep.episode_number).includes(q) ||
        ep.overview?.toLowerCase().includes(q)
    );
  }, [episodesList, episodeSearchQuery]);

  // Navigate Back cleanly
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Switch Server
  const handleSelectServer = (idx: number) => {
    if (idx === currentServerIndex) return;
    setCurrentServerIndex(idx);
    setIsPlayerLoaded(false);
    setPlayerKey(k => k + 1);
  };

  // Switch Season
  const handleSelectSeason = (seasonNum: number) => {
    if (seasonNum === currentSeason) return;
    setCurrentSeason(seasonNum);
    setCurrentEpisode(1);
    setIsPlayerLoaded(false);
    setPlayerKey(k => k + 1);
  };

  // Switch Episode
  const handleSelectEpisode = (epNum: number) => {
    if (epNum === currentEpisode) return;
    setCurrentEpisode(epNum);
    setIsPlayerLoaded(false);
    setPlayerKey(k => k + 1);
  };

  // Auto Next toggle
  const handleToggleAutoNext = (enabled: boolean) => {
    setIsAutoNextEnabled(enabled);
    localStorage.setItem('ykn_autonext', String(enabled));
  };

  // Horizontal Scroll Area Helper
  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'prev' | 'next', amount = 400) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'next' ? amount : -amount,
        behavior: 'smooth'
      });
    }
  };

  // Share action
  const handleShare = (platform: 'whatsapp' | 'facebook' | 'x' | 'telegram' | 'copy') => {
    const url = window.location.href;
    const title = movieDetail?.title || movieDetail?.name || 'Yuk Kita Nonton';
    const text = `Nonton ${title} Full HD Gratis di Yuk Kita Nonton!`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    }
  };

  // Compute Current Embed Player URL
  const playerUrl = useMemo(() => {
    if (!movieId) return '';
    const srv = SERVER_CONFIG[currentServerIndex] || SERVER_CONFIG[0];
    return isTV ? srv.tv(movieId, currentSeason, currentEpisode) : srv.movie(movieId);
  }, [movieId, isTV, currentSeason, currentEpisode, currentServerIndex]);

  // Official YouTube Trailer Video Key
  const trailerVideo = useMemo(() => {
    if (!movieDetail?.videos?.results) return null;
    return (
      movieDetail.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
      movieDetail.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
      movieDetail.videos.results.find(v => v.site === 'YouTube')
    );
  }, [movieDetail]);

  // =========================================================================
  // RENDER: LIVE SPORTS STREAM
  // =========================================================================
  if (liveId) {
    return (
      <div className="relative bg-black text-white font-sans min-h-screen overflow-x-hidden antialiased selection:bg-netflix-red selection:text-white">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%),linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,transparent_50%,rgba(0,0,0,0.95)_100%)] pointer-events-none" />

        <div className="container mx-auto max-w-[1400px] px-3 sm:px-4 md:px-8 pt-4 pb-28">
          {/* Top Bar Navigation */}
          <nav className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2.5 text-white/80 hover:text-white font-semibold text-xs md:text-sm uppercase tracking-[2px] px-4 md:px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-widest animate-pulse">
              <Radio size={14} className="text-netflix-red animate-ping" />
              <span>Siaran Langsung</span>
            </div>
          </nav>

          {liveLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="text-netflix-red animate-spin" size={48} />
              <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Menyiapkan Siaran Olahraga...</p>
            </div>
          ) : liveError ? (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-netflix-red mx-auto">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider">{liveError}</h2>
              <p className="text-zinc-400 text-xs">Jalur streaming tidak tersedia atau sedang offline saat ini.</p>
              <button
                onClick={() => navigate('/live-sports')}
                className="px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
              >
                Lihat Jadwal Live Lain
              </button>
            </div>
          ) : liveStream ? (
            <div className="space-y-6">
              {/* Header Title */}
              <div>
                <h1 className="font-outfit text-white text-2xl md:text-4xl font-black leading-tight tracking-tight mb-2">
                  {liveStream.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-semibold">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 uppercase tracking-wider">
                    {liveStream.subName || 'Siaran Langsung'}
                  </span>
                  {liveStream.jadwal_event && (
                    <span className="text-white font-bold">{liveStream.jadwal_event}</span>
                  )}
                </div>
              </div>

              {/* Video Player */}
              <div className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(229,9,20,0.15)]">
                <LiveVideoPlayer servers={liveStream.servers} />
              </div>

              {/* Live Info Banner */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-netflix-red shrink-0">
                    <Radio size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Streaming Olahraga Berkualitas Tinggi</h3>
                    <p className="text-xs text-zinc-400">Jalur server otomatis menyesuaikan kecepatan koneksi internet Anda.</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Refresh Sinyal</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <Footer />
      </div>
    );
  }

  // =========================================================================
  // RENDER: MOVIE & TV SERIES STREAM
  // =========================================================================
  const movieTitle = movieDetail ? movieDetail.title || movieDetail.name || 'Tayangan' : '';
  const originalTitle = movieDetail ? movieDetail.original_title || movieDetail.original_name : '';
  const showOriginalTitle = originalTitle && originalTitle !== movieTitle;
  const castMembers = movieDetail?.credits?.cast?.slice(0, 15) || [];
  const directorName = movieDetail?.credits?.crew?.find(c => c.job === 'Director')?.name || 'Various Production';
  const releaseYear = (movieDetail?.release_date || movieDetail?.first_air_date || '').split('-')[0];

  if (!movieId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black mb-4 uppercase">Film Tidak Ditemukan</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-netflix-red text-white font-black text-xs uppercase tracking-widest rounded-full cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-black text-white font-sans min-h-screen overflow-x-hidden antialiased selection:bg-netflix-red selection:text-white">
      {/* Dynamic Blurred Backdrop Image */}
      {movieDetail?.backdrop_path && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center transition-opacity duration-1000 opacity-30 pointer-events-none filter blur-[80px] brightness-[0.2] scale-110"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movieDetail.backdrop_path})` }}
        />
      )}

      {/* Radial and Linear Gradient Overlays */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_bottom,rgba(0,0,0,0.85)_0%,transparent_50%,rgba(0,0,0,0.98)_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="container mx-auto max-w-[1440px] px-3 sm:px-4 md:px-8 pt-4 md:pt-6 pb-32">
        {/* Navigation Breadcrumb Bar */}
        <nav className="flex items-center justify-between gap-4 mb-4 md:mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold text-xs md:text-sm uppercase tracking-[2px] px-4 md:px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:-translate-x-1 cursor-pointer shadow-lg active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {trailerVideo && (
              <button
                onClick={() => setIsTrailerOpen(!isTrailerOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  isTrailerOpen
                    ? 'bg-netflix-red border-netflix-red text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clapperboard size={14} />
                <span className="hidden sm:inline">Trailer</span>
              </button>
            )}
            <button
              onClick={() => handleShare('copy')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {isCopied ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{isCopied ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </nav>

        {isLoadingDetail ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-netflix-red animate-spin" size={48} />
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Menyiapkan Tayangan...</p>
          </div>
        ) : detailError ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-netflix-red mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider">{detailError}</h2>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : movieDetail ? (
          <div className="space-y-6 md:space-y-8">
            {/* Header Title Section */}
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-1 rounded bg-netflix-red text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-red-950/50">
                  {isTV ? 'SERIAL TV' : 'FILM'}
                </span>
                <span className="px-2.5 py-1 rounded bg-white/10 border border-white/15 text-white/90 text-[10px] font-black uppercase tracking-wider">
                  4K ULTRA HD
                </span>
                {releaseYear && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-semibold">
                    <Calendar size={12} className="text-netflix-red" />
                    <span>{releaseYear}</span>
                  </span>
                )}
                {movieDetail.vote_average ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                    <Star size={12} className="fill-amber-400" />
                    <span>{movieDetail.vote_average.toFixed(1)}</span>
                  </span>
                ) : null}
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-semibold">
                  <Clock size={12} className="text-netflix-red" />
                  <span>
                    {movieDetail.runtime
                      ? `${movieDetail.runtime}m`
                      : movieDetail.number_of_seasons
                        ? `${movieDetail.number_of_seasons} Season`
                        : 'HD'}
                  </span>
                </span>
              </div>

              <h1 className="font-outfit text-white text-2xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                {movieTitle}
              </h1>
              {showOriginalTitle && (
                <p className="text-zinc-400 text-xs md:text-sm font-medium tracking-wide">
                  Judul Asli: <span className="italic text-zinc-300">{originalTitle}</span>
                </p>
              )}
            </header>

            {/* Video Player Frame Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
              {isComingSoon ? (
                /* Unreleased Splash Screen */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-12 text-center z-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-amber-500/20 blur-3xl opacity-50 rounded-full animate-pulse" />
                    <div className="relative w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center text-amber-500 shadow-2xl">
                      <Calendar size={36} />
                    </div>
                  </div>
                  <span className="text-[11px] font-black tracking-[4px] uppercase text-amber-500 mb-2">
                    SEGERA HADIR
                  </span>
                  <h3 className="text-2xl md:text-5xl font-black font-outfit text-white mb-3 leading-tight">
                    {movieTitle}
                  </h3>
                  <p className="text-zinc-400 text-xs md:text-sm font-medium max-w-md mb-6 leading-relaxed">
                    Konten ini belum dirilis secara resmi. Silakan pantau tanggal rilis untuk info tayang streaming.
                  </p>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs tracking-wider shadow-lg">
                    <Clock size={16} className="text-amber-500" />
                    <span>
                      Tanggal Rilis:{' '}
                      {parseLocalDate(movieDetail.release_date || movieDetail.first_air_date)?.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) || 'TBA'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Active Video Player with smooth loader */
                <>
                  {!isPlayerLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020202] z-10 transition-opacity duration-500">
                      <div className="text-netflix-red font-outfit text-4xl font-black tracking-tighter animate-pulse mb-3">
                        YKN
                      </div>
                      <div className="w-16 h-1 bg-netflix-red/20 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-netflix-red animate-pulse" />
                      </div>
                      <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-3">
                        Memuat Server {currentServerIndex + 1}...
                      </span>
                    </div>
                  )}

                  <iframe
                    key={`${playerUrl}-${playerKey}`}
                    ref={playerIframeRef}
                    src={playerUrl}
                    title="YKN Player"
                    onLoad={() => setIsPlayerLoaded(true)}
                    className={`w-full h-full border-none transition-opacity duration-500 ${
                      isPlayerLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    allow="fullscreen *; autoplay *; encrypted-media *; picture-in-picture *"
                    allowFullScreen
                  />
                </>
              )}
            </div>

            {/* Video Player Control Toolbar: Server Selector & Auto-Next Bar */}
            {!isComingSoon && (
              <div className="p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
                {/* Server Selector Chips */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Monitor size={15} className="text-netflix-red" />
                      <span className="text-[11px] font-black tracking-[2px] uppercase text-zinc-300">
                        Pilih Server Streaming
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 hidden sm:inline font-medium">
                      💡 Ganti server jika tayangan macet / buffering
                    </span>
                  </div>

                  <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar scroll-smooth">
                    {SERVER_CONFIG.map((server, idx) => {
                      const isActive = idx === currentServerIndex;
                      return (
                        <button
                          key={server.name}
                          onClick={() => handleSelectServer(idx)}
                          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-netflix-red text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] scale-105 border border-red-500'
                              : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <PlayCircle size={13} className={isActive ? 'text-white' : 'text-zinc-400'} />
                          <span>{server.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Series Quick Control Toolbar */}
                {isTV && (
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FastForward size={16} className="text-netflix-red" />
                      <span className="text-xs font-bold text-zinc-300">
                        Auto Next Episode
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAutoNextEnabled}
                          onChange={(e) => handleToggleAutoNext(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-netflix-red" />
                      </label>
                    </div>

                    <button
                      onClick={handlePlayNextEpisode}
                      className="flex items-center gap-2 px-4 py-2 bg-netflix-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Episode Selanjutnya</span>
                      <SkipForward size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TV Series Seasons & Episodes Hub */}
            {isTV && movieDetail.seasons && !isComingSoon && (
              <section className="rounded-3xl bg-white/[0.02] border border-white/10 p-4 md:p-6 backdrop-blur-xl shadow-2xl space-y-6">
                {/* Season Header & Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-netflix-red" />
                      <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                        Daftar Season
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-semibold">
                      {movieDetail.seasons.filter(s => s.season_number > 0).length} Season Tersedia
                    </span>
                  </div>

                  {/* Sleek Season Pill Chips */}
                  <div
                    ref={seasonListRef}
                    className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
                  >
                    {movieDetail.seasons
                      .filter(s => s.season_number > 0)
                      .map(season => {
                        const isActive = season.season_number === currentSeason;
                        return (
                          <button
                            key={season.season_number}
                            onClick={() => handleSelectSeason(season.season_number)}
                            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                              isActive
                                ? 'bg-netflix-red text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] border border-red-500 scale-102'
                                : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Tv size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
                            <span>{season.name}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-zinc-400'
                            }`}>
                              {season.episode_count || episodesList.length || 0} Ep
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Episode Section Header with Search & Layout Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <PlayCircle size={16} className="text-netflix-red" />
                    <span className="text-xs font-black tracking-[2px] uppercase text-white">
                      Episode Season {currentSeason}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-semibold ml-1">
                      ({filteredEpisodes.length} Episode)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Episode Search Bar */}
                    <div className="relative flex-1 sm:w-48">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Cari episode..."
                        value={episodeSearchQuery}
                        onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-netflix-red transition-colors"
                      />
                    </div>

                    {/* View Mode Toggle: Grid vs Carousel */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0">
                      <button
                        onClick={() => setEpisodeViewMode('carousel')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          episodeViewMode === 'carousel' ? 'bg-netflix-red text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Tampilan Geser"
                      >
                        <ListFilter size={14} />
                      </button>
                      <button
                        onClick={() => setEpisodeViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          episodeViewMode === 'grid' ? 'bg-netflix-red text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Tampilan Grid"
                      >
                        <LayoutGrid size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Episodes Display */}
                {isLoadingEpisodes ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-zinc-400">
                    <Loader2 className="animate-spin text-netflix-red" size={24} />
                    <span className="text-xs font-bold uppercase tracking-wider">Memuat Episode Season {currentSeason}...</span>
                  </div>
                ) : filteredEpisodes.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-xs font-semibold">
                    Tidak ada episode yang cocok dengan pencarian "{episodeSearchQuery}".
                  </div>
                ) : episodeViewMode === 'carousel' ? (
                  /* Carousel Mode */
                  <div className="relative">
                    <button
                      onClick={() => scrollContainer(episodeGridRef, 'prev', 450)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-9 h-9 bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-2xl hidden md:flex"
                      title="Sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div
                      ref={episodeGridRef}
                      className="flex gap-3.5 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                    >
                      {filteredEpisodes.map(ep => {
                        const isActive = ep.episode_number === currentEpisode;
                        const thumbUrl = ep.still_path
                          ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                          : 'https://via.placeholder.com/300x169/222/555?text=No+Preview';

                        return (
                          <div
                            key={ep.episode_number}
                            onClick={() => handleSelectEpisode(ep.episode_number)}
                            className="flex-[0_0_180px] sm:flex-[0_0_220px] md:flex-[0_0_250px] cursor-pointer group transition-all duration-300 shrink-0"
                          >
                            <div
                              className={`relative aspect-video rounded-xl bg-cover bg-center border overflow-hidden shadow-lg transition-all duration-300 ${
                                isActive
                                  ? 'border-netflix-red ring-2 ring-netflix-red shadow-[0_0_20px_rgba(229,9,20,0.5)]'
                                  : 'border-white/10 group-hover:border-white/40 group-hover:-translate-y-1'
                              }`}
                              style={{ backgroundImage: `url('${thumbUrl}')` }}
                            >
                              {/* Episode Badge */}
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-netflix-red text-white text-[10px] font-black uppercase tracking-wider rounded shadow">
                                EP {ep.episode_number}
                              </span>

                              {/* Duration Badge */}
                              {ep.runtime ? (
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold rounded">
                                  {ep.runtime}m
                                </span>
                              ) : null}

                              {/* Active or Hover Play Overlay */}
                              {isActive ? (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1 h-3 bg-netflix-red animate-pulse" />
                                    <span className="w-1 h-5 bg-netflix-red animate-pulse delay-75" />
                                    <span className="w-1 h-4 bg-netflix-red animate-pulse delay-150" />
                                  </div>
                                  <span className="text-[9px] font-black text-netflix-red uppercase tracking-wider mt-1">
                                    Diputar
                                  </span>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-9 h-9 rounded-full bg-netflix-red flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                    <Play size={16} className="fill-white ml-0.5" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-2 space-y-0.5">
                              <h4 className={`text-xs font-bold line-clamp-1 transition-colors ${
                                isActive ? 'text-netflix-red' : 'text-zinc-200 group-hover:text-netflix-red'
                              }`}>
                                {ep.name || `Episode ${ep.episode_number}`}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                                <span>{ep.air_date || 'TBA'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => scrollContainer(episodeGridRef, 'next', 450)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-9 h-9 bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-2xl hidden md:flex"
                      title="Selanjutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  /* Grid Mode */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredEpisodes.map(ep => {
                      const isActive = ep.episode_number === currentEpisode;
                      const thumbUrl = ep.still_path
                        ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                        : 'https://via.placeholder.com/300x169/222/555?text=No+Preview';

                      return (
                        <div
                          key={ep.episode_number}
                          onClick={() => handleSelectEpisode(ep.episode_number)}
                          className="cursor-pointer group transition-all duration-200"
                        >
                          <div
                            className={`relative aspect-video rounded-xl bg-cover bg-center border overflow-hidden shadow transition-all ${
                              isActive
                                ? 'border-netflix-red ring-2 ring-netflix-red shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                                : 'border-white/10 group-hover:border-white/30 group-hover:-translate-y-0.5'
                            }`}
                            style={{ backgroundImage: `url('${thumbUrl}')` }}
                          >
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-netflix-red text-white text-[9px] font-black uppercase rounded shadow">
                              EP {ep.episode_number}
                            </span>
                            {ep.runtime && (
                              <span className="absolute bottom-1.5 right-1.5 px-1 py-0.5 bg-black/80 text-[8px] font-bold rounded">
                                {ep.runtime}m
                              </span>
                            )}
                            {isActive && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-[10px] font-black text-netflix-red uppercase tracking-wider">
                                  Diputar
                                </span>
                              </div>
                            )}
                          </div>
                          <h4 className={`mt-1.5 text-xs font-bold line-clamp-1 ${
                            isActive ? 'text-netflix-red' : 'text-zinc-300 group-hover:text-netflix-red'
                          }`}>
                            {ep.name || `Episode ${ep.episode_number}`}
                          </h4>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Official Trailer Video Section (Collapsible) */}
            {isTrailerOpen && trailerVideo && (
              <section className="rounded-3xl bg-black border border-white/15 p-4 md:p-6 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clapperboard size={16} className="text-netflix-red" />
                    <span className="text-xs font-black tracking-[2px] uppercase text-white">
                      Trailer Resmi
                    </span>
                  </div>
                  <button
                    onClick={() => setIsTrailerOpen(false)}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerVideo.key}?rel=0&modestbranding=1&autoplay=1`}
                    title="Official Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-none"
                  />
                </div>
              </section>
            )}

            {/* Synopsis & Cast Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column: Synopsis, Cast, Genres (2 Cols on large screen) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Synopsis Card */}
                <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-5 md:p-6 backdrop-blur-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-netflix-red" />
                    <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                      Sinopsis
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
                    {movieDetail.overview || 'Sinopsis belum tersedia untuk tayangan ini.'}
                  </p>
                </div>

                {/* Cast Spotlight */}
                {castMembers.length > 0 && (
                  <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-5 md:p-6 backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-netflix-red" />
                        <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                          Pemeran Utama
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">{castMembers.length} Cast</span>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => scrollContainer(castScrollRef, 'prev', 300)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-3 z-10 w-8 h-8 bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                        title="Sebelumnya"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div
                        ref={castScrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
                      >
                        {castMembers.map(cast => {
                          const profileUrl = cast.profile_path
                            ? `https://image.tmdb.org/t/p/w200${cast.profile_path}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(cast.name)}&background=111&color=E50914&bold=true`;

                          return (
                            <Link
                              key={cast.id}
                              to={`/person/${cast.id}`}
                              className="flex-[0_0_80px] sm:flex-[0_0_100px] text-center group no-underline shrink-0"
                            >
                              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden border-2 border-white/10 group-hover:border-netflix-red transition-all duration-300 shadow-md group-hover:scale-105">
                                <img
                                  src={profileUrl}
                                  alt={cast.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="mt-2 text-xs font-bold text-white group-hover:text-netflix-red truncate transition-colors">
                                {cast.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-medium truncate">
                                {cast.character || 'Character'}
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => scrollContainer(castScrollRef, 'next', 300)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-3 z-10 w-8 h-8 bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                        title="Selanjutnya"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Genres */}
                {movieDetail.genres && movieDetail.genres.length > 0 && (
                  <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-5 md:p-6 backdrop-blur-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-netflix-red" />
                      <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                        Kategori & Genre
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {movieDetail.genres.map(g => (
                        <Link
                          key={g.id}
                          to={isTV ? `/series/genre/${g.id}` : `/genre/${g.id}`}
                          className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-netflix-red hover:text-netflix-red text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
                        >
                          {g.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Info Card, Tips, Social Share */}
              <div className="space-y-6">
                {/* Details & Production */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-netflix-red block mb-1">
                      Sutradara / Produksi
                    </span>
                    <h3 className="text-sm font-bold text-white">{directorName}</h3>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-netflix-red block mb-1">
                      Status Tayang
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-300">{movieDetail.status || 'Released'}</h3>
                  </div>

                  {/* Social Sharing */}
                  <div className="pt-4 border-t border-white/10 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-netflix-red block">
                      Bagikan Tayangan
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#25D366] text-white hover:text-[#25D366] transition-all cursor-pointer"
                        title="Bagikan ke WhatsApp"
                      >
                        <SiWhatsapp size={15} />
                      </button>
                      <button
                        onClick={() => handleShare('telegram')}
                        className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#26A5E4] text-white hover:text-[#26A5E4] transition-all cursor-pointer"
                        title="Bagikan ke Telegram"
                      >
                        <SiTelegram size={15} />
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#1877F2] text-white hover:text-[#1877F2] transition-all cursor-pointer"
                        title="Bagikan ke Facebook"
                      >
                        <SiFacebook size={15} />
                      </button>
                      <button
                        onClick={() => handleShare('x')}
                        className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white text-white transition-all cursor-pointer"
                        title="Bagikan ke X"
                      >
                        <SiX size={13} />
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-netflix-red text-white hover:text-netflix-red text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        title="Salin Tautan"
                      >
                        {isCopied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                        <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tips & Guides Card */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-950/10 via-white/[0.02] to-transparent p-5 md:p-6 backdrop-blur-xl space-y-3.5">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-netflix-red" />
                    <span className="text-xs font-black tracking-[2px] uppercase text-zinc-200">
                      Panduan Nonton
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-400">
                    <MousePointerClick size={15} className="text-netflix-red shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-white">Ad Buffer:</strong> Jika pemutar terkunci pada klik pertama, klik sekali di video untuk menutup pop-up lalu tekan play.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-400">
                    <Languages size={15} className="text-netflix-red shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-white">Subtitle:</strong> Klik ikon <strong>CC</strong> di player untuk memilih subtitle Indonesia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <section className="pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-netflix-red" />
                      <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                        Rekomendasi Serupa
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black font-outfit text-white">
                      Mungkin Kamu Juga Suka
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollContainer(recGridRef, 'prev', 450)}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-netflix-red border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                      title="Sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => scrollContainer(recGridRef, 'next', 450)}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-netflix-red border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                      title="Selanjutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div
                  ref={recGridRef}
                  className="flex gap-3.5 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                >
                  {recommendations.map(item => {
                    const itemTitle = item.title || item.name || '';
                    const posterUrl = item.poster_path
                      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                      : 'https://via.placeholder.com/300x450/222/555?text=No+Poster';
                    const year = (item.release_date || item.first_air_date || '').split('-')[0];

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          navigate(`/watch?id=${item.id}&type=${isTV ? 'tv' : 'movie'}`);
                        }}
                        className="flex-[0_0_130px] sm:flex-[0_0_160px] md:flex-[0_0_180px] relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/10 shadow-xl group transition-all duration-300 hover:scale-105 hover:-translate-y-1.5 hover:border-netflix-red hover:shadow-[0_15px_30px_rgba(229,9,20,0.4)] shrink-0"
                      >
                        <img
                          src={posterUrl}
                          alt={itemTitle}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight font-outfit mb-1">
                            {itemTitle}
                          </h4>
                          <div className="text-[10px] font-extrabold text-netflix-red uppercase tracking-wider">
                            {year} • <span className="text-amber-400">★ {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : null}
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-netflix-red text-white flex items-center justify-center shadow-[0_10px_25px_rgba(229,9,20,0.5)] hover:bg-white hover:text-netflix-red transition-all duration-300 hover:scale-110 cursor-pointer"
          title="Kembali ke Atas"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Unified Site Footer */}
      <Footer />
    </div>
  );
};

export default Watch;
