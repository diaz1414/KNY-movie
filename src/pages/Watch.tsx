import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getStreamById, type PlayableStream } from '../services/streamService';
import { STREAM_SERVERS, buildStreamUrl } from '../config/streamServers';
import { LiveVideoPlayer } from '../components/live/LiveVideoPlayer';
import Footer from '../components/Footer';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Tv,
  Radio,
  Clock,
  Server,
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
  MoreHorizontal,
  ArrowUp,
  RotateCcw,
  History
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
  backdrop_path: string | null;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number;
  number_of_seasons?: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: TMDBCast[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
  seasons?: TMDBSeason[];
}

interface TMDBRecommendation {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

const SERVER_CONFIG = STREAM_SERVERS;

const parseLocalDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const formatTime = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

  // --- RESUME PLAYBACK STATES (VidSrc startAt) ---
  const startAtParam = useMemo(() => {
    const val = Number(searchParams.get('startAt'));
    return !isNaN(val) && val > 0 ? Math.floor(val) : 0;
  }, [searchParams]);

  const [activeStartAt, setActiveStartAt] = useState<number>(startAtParam);
  const [savedProgressSeconds, setSavedProgressSeconds] = useState<number>(0);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(false);

  // Sync / check local saved progress when movieId, currentSeason, or currentEpisode changes
  useEffect(() => {
    if (!movieId) return;
    if (startAtParam > 0) {
      setActiveStartAt(startAtParam);
      setShowResumeBanner(false);
      return;
    }

    try {
      const savedRaw = localStorage.getItem(`ykn_progress_${movieId}`);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        const matchSeason = isTV ? saved.s === currentSeason : true;
        const matchEpisode = isTV ? saved.e === currentEpisode : true;
        if (matchSeason && matchEpisode && saved.progressSeconds && saved.progressSeconds > 15 && (saved.percent || 0) < 95) {
          setSavedProgressSeconds(saved.progressSeconds);
          setShowResumeBanner(true);
          return;
        }
      }
    } catch (e) {
      /* ignore */
    }
    setShowResumeBanner(false);
    setSavedProgressSeconds(0);
  }, [movieId, currentSeason, currentEpisode, isTV, startAtParam]);

  const [episodesList, setEpisodesList] = useState<TMDBEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  const [isAutoNextEnabled, setIsAutoNextEnabled] = useState<boolean>(() => {
    return localStorage.getItem('ykn_autonext') === 'true';
  });

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  const [recommendations, setRecommendations] = useState<TMDBRecommendation[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
          `https://api.themoviedb.org/3/${endpoint}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`
        );
        let data = await res.json();

        if (!res.ok) {
          // Fallback to check other type
          const fallbackEndpoint = endpoint === 'tv' ? 'movie' : 'tv';
          const fallbackRes = await fetch(
            `https://api.themoviedb.org/3/${fallbackEndpoint}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`
          );
          if (fallbackRes.ok) {
            data = await fallbackRes.json();
          } else {
            throw new Error(data.status_message || 'Content not found');
          }
        }

        if (!isMounted) return;
        setMovieDetail(data);

        // Document title
        const title = data.title || data.name || 'Watch';
        document.title = `Watch ${title} - YKN`;
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load movie details:', err);
        setDetailError(err.message || 'Failed to load movie details');
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [liveId, movieId, isTV]);

  // 3. Fetch Season Episodes for TV Series
  useEffect(() => {
    if (!isTV || !movieId || liveId) return;

    let isMounted = true;
    const fetchEpisodes = async () => {
      setIsLoadingEpisodes(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${movieId}/season/${currentSeason}?api_key=${TMDB_API_KEY}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setEpisodesList(data.episodes || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch season episodes:', err);
      } finally {
        if (isMounted) setIsLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
    return () => { isMounted = false; };
  }, [isTV, movieId, currentSeason, liveId]);

  // 4. Fetch Recommendations
  useEffect(() => {
    if (liveId || !movieId) return;

    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        const endpoint = isTV ? 'tv' : 'movie';
        let allResults: TMDBRecommendation[] = [];

        for (let page = 1; page <= 3; page++) {
          const res = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              allResults = allResults.concat(data.results);
            } else if (page === 1) {
              // fallback to similar
              const simRes = await fetch(
                `https://api.themoviedb.org/3/${endpoint}/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
              );
              if (simRes.ok) {
                const simData = await simRes.json();
                allResults = simData.results || [];
              }
              break;
            }
          }
        }

        if (isMounted) {
          setRecommendations(allResults.slice(0, 60));
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [liveId, movieId, isTV]);

  // 5. Save progress and sync URL params
  useEffect(() => {
    if (liveId || !movieId || !movieDetail) return;

    let existingData: any = {};
    try {
      const saved = localStorage.getItem(`ykn_progress_${movieId}`);
      if (saved) existingData = JSON.parse(saved);
    } catch (e) { /* ignore */ }

    const isSameEpisode = isTV ? (existingData.s === currentSeason && existingData.e === currentEpisode) : true;

    // Save to localStorage (retain existing progressSeconds if same episode)
    const data = {
      ...existingData,
      s: currentSeason,
      e: currentEpisode,
      server: currentServerIndex,
      progressSeconds: isSameEpisode ? (existingData.progressSeconds || 0) : 0,
      durationSeconds: isSameEpisode ? (existingData.durationSeconds || 0) : 0,
      percent: isSameEpisode ? (existingData.percent || 0) : 0,
      timestamp: Date.now()
    };
    localStorage.setItem(`ykn_progress_${movieId}`, JSON.stringify(data));

    const globalData = {
      id: movieId,
      title: movieDetail.title || movieDetail.name || '',
      poster: movieDetail.poster_path ? `https://image.tmdb.org/t/p/w300${movieDetail.poster_path}` : '',
      type: isTV ? 'series' : 'movie',
      season: currentSeason,
      episode: currentEpisode,
      progressSeconds: data.progressSeconds,
      durationSeconds: data.durationSeconds,
      percent: data.percent,
      timestamp: Date.now()
    };
    localStorage.setItem('ykn_last_watched', JSON.stringify(globalData));

    // Update URL Search Params cleanly without reloading
    const newParams = new URLSearchParams(searchParams);
    if (isTV) {
      newParams.set('s', String(currentSeason));
      newParams.set('e', String(currentEpisode));
    }
    setSearchParams(newParams, { replace: true });
  }, [currentSeason, currentEpisode, currentServerIndex, isTV, movieId, movieDetail]);

  // 6. Scroll To Top Visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute Player Embed URL
  const playerUrl = useMemo(() => {
    if (!movieId) return '';
    const serverObj = SERVER_CONFIG[currentServerIndex] || SERVER_CONFIG[0];
    return buildStreamUrl(serverObj, {
      movieId,
      isTV,
      currentSeason,
      currentEpisode,
      isAutoNextEnabled,
      startAt: activeStartAt
    });
  }, [movieId, isTV, currentSeason, currentEpisode, currentServerIndex, isAutoNextEnabled, activeStartAt]);

  // Check if unreleased (Coming Soon)
  const isComingSoon = useMemo(() => {
    if (!movieDetail) return false;
    const releaseDateStr = movieDetail.release_date || movieDetail.first_air_date;
    const release = parseLocalDate(releaseDateStr);
    if (!release) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return release > today;
  }, [movieDetail]);

  // Handle Play Next Episode
  const handlePlayNextEpisode = useCallback(() => {
    if (!isTV || !episodesList.length) return;
    const nextEpNum = currentEpisode + 1;
    const nextEp = episodesList.find(e => e.episode_number === nextEpNum);

    if (nextEp) {
      setActiveStartAt(0);
      setShowResumeBanner(false);
      setSavedProgressSeconds(0);
      setCurrentEpisode(nextEpNum);
      setIsPlayerLoaded(false);
      setPlayerKey(k => k + 1);
    } else if (movieDetail?.seasons) {
      const nextSeasonNum = currentSeason + 1;
      const nextSeason = movieDetail.seasons.find(s => s.season_number === nextSeasonNum);
      if (nextSeason) {
        setActiveStartAt(0);
        setShowResumeBanner(false);
        setSavedProgressSeconds(0);
        setCurrentSeason(nextSeasonNum);
        setCurrentEpisode(1);
        setIsPlayerLoaded(false);
        setPlayerKey(k => k + 1);
      }
    }
  }, [isTV, episodesList, currentEpisode, movieDetail, currentSeason]);

  // Auto-next postMessage listener from video player & VidSrc PLAYER_EVENT progress tracking
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;

      // Handle VidSrc official PLAYER_EVENT
      if (data.type === 'PLAYER_EVENT' && data.data) {
        const { player_status, player_progress, player_duration } = data.data;

        // Save progress if progress reported (> 5s)
        if (typeof player_progress === 'number' && player_progress > 5 && movieId) {
          const duration = typeof player_duration === 'number' && player_duration > 0 ? player_duration : 0;
          const percent = duration > 0 ? Math.min(100, Math.round((player_progress / duration) * 100)) : 0;
          const progressSec = Math.floor(player_progress);

          const progressData = {
            s: currentSeason,
            e: currentEpisode,
            server: currentServerIndex,
            progressSeconds: progressSec,
            durationSeconds: Math.floor(duration),
            percent,
            timestamp: Date.now()
          };
          localStorage.setItem(`ykn_progress_${movieId}`, JSON.stringify(progressData));

          if (movieDetail) {
            const globalData = {
              id: movieId,
              title: movieDetail.title || movieDetail.name || '',
              poster: movieDetail.poster_path ? `https://image.tmdb.org/t/p/w300${movieDetail.poster_path}` : '',
              type: isTV ? 'series' : 'movie',
              season: currentSeason,
              episode: currentEpisode,
              progressSeconds: progressSec,
              durationSeconds: Math.floor(duration),
              percent,
              timestamp: Date.now()
            };
            localStorage.setItem('ykn_last_watched', JSON.stringify(globalData));
          }
        }

        // Handle completed playback
        if (player_status === 'completed') {
          if (isAutoNextEnabled && isTV) {
            handlePlayNextEpisode();
          }
        }
        return;
      }

      // Handle other player ended events (VidLink / 2Embed / legacy)
      const isEnded = (
        data.event === 'ended' ||
        data.type === 'ended' ||
        data === 'vidlink_ended' ||
        data === 'vidsrc_ended'
      );
      if (isEnded && isAutoNextEnabled && isTV) {
        handlePlayNextEpisode();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAutoNextEnabled, isTV, handlePlayNextEpisode, movieId, currentSeason, currentEpisode, currentServerIndex, movieDetail]);

  // Switch Server
  const handleSelectServer = (idx: number) => {
    if (idx === currentServerIndex) return;
    setIsPlayerLoaded(false);
    setCurrentServerIndex(idx);
    setPlayerKey(k => k + 1);
  };

  // Switch Season
  const handleSelectSeason = (seasonNum: number) => {
    if (seasonNum === currentSeason) return;
    setActiveStartAt(0);
    setShowResumeBanner(false);
    setSavedProgressSeconds(0);
    setCurrentSeason(seasonNum);
    setCurrentEpisode(1);
    setIsPlayerLoaded(false);
    setPlayerKey(k => k + 1);
  };

  // Switch Episode
  const handleSelectEpisode = (epNum: number) => {
    if (epNum === currentEpisode) return;
    setActiveStartAt(0);
    setShowResumeBanner(false);
    setSavedProgressSeconds(0);
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

  // Handle Back
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Share Content
  const handleShare = (platform: 'whatsapp' | 'facebook' | 'x' | 'telegram' | 'other') => {
    const title = movieDetail?.title || movieDetail?.name || 'Film Seru';
    const url = window.location.href;
    const text = `Nonton ${title} di YKN Movies! Kualitas mantap 🔥`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'other':
        if (navigator.share) {
          navigator.share({ title, text, url }).catch(console.error);
        } else {
          navigator.clipboard.writeText(url);
          alert('Link tautan berhasil disalin ke clipboard!');
        }
        break;
    }
  };

  // --- RENDER LIVE SPORTS MODE ---
  if (liveId) {
    return (
      <main className="fixed inset-0 z-[9999] bg-black text-white flex flex-col font-sans">
        {/* Top Header Navigation */}
        <header className="flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] bg-zinc-950/80 border-b border-white/5 select-none shrink-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2.5 rounded-full hover:bg-white/10 text-white transition-all cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">
                {liveStream ? liveStream.name : 'Loading Stream'}
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                {liveStream ? liveStream.subName : 'Siaran Langsung'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPlayerKey(k => k + 1)}
            className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {/* Stream Content View */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full overflow-y-auto premium-scroll">
          {liveLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-netflix-red animate-spin" size={40} />
              <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Menghubungkan ke Server...</p>
            </div>
          ) : liveError ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-netflix-red mx-auto border border-white/10">
                <ArrowLeft size={30} />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">{liveError}</h2>
              <button
                onClick={() => navigate('/live-sports')}
                className="px-5 py-2.5 bg-netflix-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Kembali ke Jadwal
              </button>
            </div>
          ) : liveStream ? (
            <div className="w-full space-y-4">
              <LiveVideoPlayer servers={liveStream.servers} />

              {/* Premium Match / Channel Info Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-netflix-red/10 blur-3xl" />

                <div className="relative flex items-center gap-4">
                  {liveStream.isChannel ? (
                    liveStream.logo ? (
                      <img
                        src={liveStream.logo}
                        alt={liveStream.name}
                        className="h-14 w-14 rounded-2xl object-contain bg-white/5 border border-white/10 p-1 shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Tv className="text-netflix-red" size={24} />
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      {liveStream.logo ? (
                        <img src={liveStream.logo} alt={liveStream.player1 || ''} className="h-11 w-11 rounded-xl object-contain bg-white/5 border border-white/10 p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg"><Radio size={18} className="text-zinc-600" /></div>
                      )}
                      <span className="text-zinc-600 font-black text-sm">VS</span>
                      {liveStream.logo2 ? (
                        <img src={liveStream.logo2} alt={liveStream.player2 || ''} className="h-11 w-11 rounded-xl object-contain bg-white/5 border border-white/10 p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg"><Radio size={18} className="text-zinc-600" /></div>
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-netflix-red/15 border border-netflix-red/30 px-2.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-netflix-red animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-netflix-red">LIVE</span>
                      </span>
                      {liveStream.subName && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 truncate">{liveStream.subName}</span>
                      )}
                    </div>

                    <h2 className="text-sm font-black uppercase tracking-wide text-white leading-tight truncate">
                      {liveStream.name}
                    </h2>

                    {liveStream.jadwal_event && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 tracking-wide">
                        <Clock size={10} />
                        {new Date(liveStream.jadwal_event).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
                        })}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                    <Server size={14} className="text-netflix-red mb-0.5" />
                    <span className="text-base font-black text-white">{liveStream.servers.length}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">SERVER</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  // --- RENDER MOVIE / SERIES FULL NATIVE WATCH PAGE ---
  const movieTitle = movieDetail ? (movieDetail.title || movieDetail.name || movieDetail.original_title || movieDetail.original_name || '') : '';
  const originalTitle = movieDetail?.original_title || movieDetail?.original_name;
  const showOriginalTitle = originalTitle && originalTitle !== movieTitle;

  const trailerVideo = movieDetail?.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || movieDetail?.videos?.results?.find(v => v.site === 'YouTube');

  const castMembers = movieDetail?.credits?.cast?.slice(0, 15) || [];
  const directorName = movieDetail?.credits?.crew?.find(c => c.job === 'Director')?.name || 'Various Production';

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
          className="fixed inset-0 -z-10 bg-cover bg-center transition-opacity duration-1000 opacity-40 pointer-events-none filter blur-[60px] brightness-[0.25] scale-110"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movieDetail.backdrop_path})` }}
        />
      )}

      {/* Radial and Linear Gradient Overlays */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,transparent_50%,rgba(0,0,0,0.95)_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="container mx-auto max-w-[1440px] p-4 md:p-8 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-32">
        {/* Navigation Back Button */}
        <nav className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-3 text-white/70 hover:text-white font-semibold text-xs md:text-sm uppercase tracking-[2px] px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:-translate-x-1 cursor-pointer shadow-lg"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
        </nav>

        {isLoadingDetail ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-netflix-red animate-spin" size={48} />
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Menyiapkan Tayangan...</p>
          </div>
        ) : detailError ? (
          <div className="py-24 text-center space-y-4">
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
          <div>
            {/* Header Title Section */}
            <header className="mb-8">
              <h1 className="font-outfit text-white text-3xl md:text-6xl font-black leading-tight tracking-tight mb-3 bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                {movieTitle}
              </h1>
              {showOriginalTitle && (
                <p className="text-zinc-500 text-sm md:text-base font-semibold tracking-wider mb-4">
                  {originalTitle}
                </p>
              )}

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {(movieDetail.release_date || movieDetail.first_air_date) && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
                    <Calendar size={14} className="text-netflix-red" />
                    <span>{(movieDetail.release_date || movieDetail.first_air_date)?.split('-')[0]}</span>
                  </div>
                )}
                {movieDetail.vote_average ? (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-amber-300 font-bold">{movieDetail.vote_average.toFixed(1)}</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
                  <Clock size={14} className="text-netflix-red" />
                  <span>
                    {movieDetail.runtime
                      ? `${movieDetail.runtime}m`
                      : movieDetail.number_of_seasons
                        ? `${movieDetail.number_of_seasons} Season`
                        : 'HD'}
                  </span>
                </div>
              </div>
            </header>

            {/* Server Selector Section (Only if not coming soon) */}
            {!isComingSoon && (
              <section className="mb-6">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <Monitor size={14} className="text-netflix-red" />
                  <span className="text-[11px] font-black tracking-[3px] uppercase text-netflix-red">
                    Pilih Server Streaming
                  </span>
                </div>
                <div className="flex overflow-x-auto md:flex-wrap gap-2.5 w-full pb-2 no-scrollbar">
                  {SERVER_CONFIG.map((server, idx) => {
                    const isActive = idx === currentServerIndex;
                    return (
                      <button
                        key={server.name}
                        onClick={() => handleSelectServer(idx)}
                        className={`px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-300 backdrop-blur-3xl whitespace-nowrap shrink-0 cursor-pointer ${isActive
                            ? 'bg-netflix-red border border-netflix-red text-white shadow-[0_0_25px_rgba(229,9,20,0.4)] scale-105'
                            : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white hover:-translate-y-0.5'
                          }`}
                      >
                        <PlayCircle size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
                        <span>{server.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Resume Playback Notification Banner */}
            {showResumeBanner && savedProgressSeconds > 15 && !isComingSoon && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900/90 to-zinc-900/70 border border-netflix-red/30 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl animate-slide-up">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-netflix-red/20 border border-netflix-red/40 flex items-center justify-center text-netflix-red shrink-0 shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-white leading-tight">
                      Lanjutkan menonton dari <span className="text-netflix-red font-black tracking-wide">{formatTime(savedProgressSeconds)}</span>?
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Progress tersimpan otomatis dari sesi menonton kamu sebelumnya.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setShowResumeBanner(false);
                      setActiveStartAt(0);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-white/5"
                  >
                    <RotateCcw size={13} />
                    <span>Mulai dari Awal</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowResumeBanner(false);
                      setActiveStartAt(savedProgressSeconds);
                      setIsPlayerLoaded(false);
                      setPlayerKey(k => k + 1);
                    }}
                    className="px-5 py-2 rounded-xl bg-netflix-red hover:bg-red-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:scale-105"
                  >
                    <Play size={13} fill="white" />
                    <span>Lanjutkan ({formatTime(savedProgressSeconds)})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Video Player Frame */}
            <div className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] mb-8">
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
                    </div>
                  )}

                  <iframe
                    key={`${playerUrl}-${playerKey}`}
                    ref={playerIframeRef}
                    src={playerUrl}
                    title="YKN Player"
                    onLoad={() => setIsPlayerLoaded(true)}
                    className={`w-full h-full border-none transition-opacity duration-500 ${isPlayerLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    allow="fullscreen *; autoplay *; encrypted-media *; picture-in-picture *"
                    allowFullScreen
                  />
                </>
              )}
            </div>

            {/* TV Series Controls & Auto-Next Toggle */}
            {isTV && !isComingSoon && (
              <div className="flex flex-wrap items-center justify-between gap-4 mb-10 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                {/* Auto Next Toggle */}
                <div className="flex items-center gap-3">
                  <FastForward size={18} className="text-netflix-red" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Auto Next Episode
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={isAutoNextEnabled}
                      onChange={(e) => handleToggleAutoNext(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red" />
                  </label>
                </div>

                {/* Manual Next Button */}
                <button
                  onClick={handlePlayNextEpisode}
                  className="flex items-center gap-2 px-5 py-2.5 bg-netflix-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Episode Selanjutnya</span>
                  <SkipForward size={16} />
                </button>
              </div>
            )}

            {/* TV Series Seasons & Episodes Lists */}
            {isTV && movieDetail.seasons && !isComingSoon && (
              <div className="space-y-8 mb-12">
                {/* Season Selector */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={16} className="text-netflix-red" />
                    <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                      Daftar Season
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => scrollContainer(seasonListRef, 'prev')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                      title="Sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div
                      ref={seasonListRef}
                      className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                    >
                      {movieDetail.seasons
                        .filter(s => s.season_number > 0)
                        .map(season => {
                          const isActive = season.season_number === currentSeason;
                          const posterUrl = season.poster_path
                            ? `https://image.tmdb.org/t/p/w200${season.poster_path}`
                            : 'https://via.placeholder.com/200x300/222/555?text=Poster';

                          return (
                            <div
                              key={season.season_number}
                              onClick={() => handleSelectSeason(season.season_number)}
                              className="flex-[0_0_120px] md:flex-[0_0_150px] cursor-pointer group transition-all duration-300"
                            >
                              <div
                                className={`aspect-[2/3] rounded-2xl bg-cover bg-center border transition-all duration-300 overflow-hidden shadow-lg ${isActive
                                    ? 'border-netflix-red ring-2 ring-netflix-red scale-105'
                                    : 'border-white/10 group-hover:border-white/40 group-hover:scale-102'
                                  }`}
                                style={{ backgroundImage: `url('${posterUrl}')` }}
                              />
                              <p className={`mt-2.5 text-xs font-bold text-center truncate ${isActive ? 'text-netflix-red' : 'text-zinc-400 group-hover:text-white'
                                }`}>
                                {season.name}
                              </p>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => scrollContainer(seasonListRef, 'next')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                      title="Selanjutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Episode Grid */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <PlayCircle size={16} className="text-netflix-red" />
                    <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                      Episode - Season {currentSeason}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => scrollContainer(episodeGridRef, 'prev')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                      title="Sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div
                      ref={episodeGridRef}
                      className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                    >
                      {isLoadingEpisodes ? (
                        <div className="flex items-center gap-3 py-8 text-zinc-500">
                          <Loader2 className="animate-spin" size={20} />
                          <span className="text-xs font-bold uppercase tracking-wider">Memuat Episode...</span>
                        </div>
                      ) : (
                        episodesList.map(ep => {
                          const isActive = ep.episode_number === currentEpisode;
                          const thumbUrl = ep.still_path
                            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                            : 'https://via.placeholder.com/300x169/222/555?text=No+Preview';

                          return (
                            <div
                              key={ep.episode_number}
                              onClick={() => handleSelectEpisode(ep.episode_number)}
                              className="flex-[0_0_200px] md:flex-[0_0_260px] cursor-pointer group transition-all duration-300"
                            >
                              <div
                                className={`relative aspect-video rounded-2xl bg-cover bg-center border overflow-hidden shadow-lg transition-all duration-300 ${isActive
                                    ? 'border-netflix-red ring-2 ring-netflix-red'
                                    : 'border-white/10 group-hover:border-white/40 group-hover:-translate-y-1'
                                  }`}
                                style={{ backgroundImage: `url('${thumbUrl}')` }}
                              >
                                <span className="absolute top-2 left-2 px-2 py-0.5 bg-netflix-red text-white text-[9px] font-black uppercase tracking-wider rounded">
                                  EP {ep.episode_number}
                                </span>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play size={24} className="text-white fill-white" />
                                </div>
                              </div>
                              <div className="mt-2.5">
                                <h4 className={`text-xs font-bold line-clamp-1 transition-colors ${isActive ? 'text-netflix-red' : 'text-white group-hover:text-netflix-red'
                                  }`}>
                                  {ep.name || `Episode ${ep.episode_number}`}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                                  <span>{ep.air_date || 'TBA'}</span>
                                  {ep.runtime ? <span>• {ep.runtime}m</span> : null}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      onClick={() => scrollContainer(episodeGridRef, 'next')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                      title="Selanjutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Official Trailer Section */}
            {trailerVideo && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Clapperboard size={16} className="text-netflix-red" />
                  <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                    Trailer Resmi
                  </span>
                </div>
                <button
                  onClick={() => setIsTrailerOpen(!isTrailerOpen)}
                  className="flex items-center gap-3 px-6 py-3.5 bg-netflix-red/10 hover:bg-netflix-red/20 border border-netflix-red/30 hover:border-netflix-red/60 rounded-2xl text-white font-black text-xs uppercase tracking-wider transition-all duration-300 group cursor-pointer mb-4"
                >
                  <div className="w-7 h-7 rounded-full bg-netflix-red flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Play size={12} className="text-white fill-white ml-0.5" />
                  </div>
                  <span>{isTrailerOpen ? 'Tutup Trailer' : 'Tonton Trailer'}</span>
                </button>

                {isTrailerOpen && (
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerVideo.key}?rel=0&modestbranding=1&autoplay=1`}
                      title="Official Trailer"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-none"
                    />
                  </div>
                )}
              </section>
            )}

            {/* Share Section */}
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Share2 size={16} className="text-netflix-red" />
                <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                  Bagikan Tayangan Ini
                </span>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-white/15 hover:border-[#25D366] hover:text-[#25D366] cursor-pointer"
                >
                  <SiWhatsapp size={16} />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-white/15 hover:border-[#1877F2] hover:text-[#1877F2] cursor-pointer"
                >
                  <SiFacebook size={16} />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('x')}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-white/15 hover:border-white cursor-pointer"
                >
                  <SiX size={14} />
                  <span>X (Twitter)</span>
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-white/15 hover:border-[#26A5E4] hover:text-[#26A5E4] cursor-pointer"
                >
                  <SiTelegram size={16} />
                  <span>Telegram</span>
                </button>
                <button
                  onClick={() => handleShare('other')}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-white/15 hover:border-netflix-red hover:text-netflix-red cursor-pointer"
                >
                  <MoreHorizontal size={16} />
                  <span>Salin / Lainnya</span>
                </button>
              </div>
            </section>

            {/* Tips & Guides Banner */}
            <section className="flex flex-col gap-3 bg-gradient-to-br from-netflix-red/10 to-transparent border-l-4 border-l-netflix-red p-6 rounded-r-3xl mb-12 backdrop-blur-md">
              <div className="flex items-start gap-3 text-xs leading-relaxed text-zinc-300">
                <MousePointerClick size={18} className="text-netflix-red shrink-0 mt-0.5" />
                <p>
                  <b>AD BUFFER:</b> Jika pemutar terasa terkunci pada klik pertama, klik sekali di dalam area video untuk menutup iklan tersembunyi, lalu tekan tombol play kembali.
                </p>
              </div>
              <div className="flex items-start gap-3 text-xs leading-relaxed text-zinc-300">
                <Languages size={18} className="text-netflix-red shrink-0 mt-0.5" />
                <p>
                  <b>SUBTITLE:</b> Gunakan ikon <b>CC</b> atau pengaturan di pojok kanan bawah pemutar video untuk memilih bahasa subtitle Indonesia atau bahasa lainnya.
                </p>
              </div>
              <div className="flex items-start gap-3 text-xs leading-relaxed text-zinc-300">
                <AlertCircle size={18} className="text-netflix-red shrink-0 mt-0.5" />
                <p>
                  <b>SERVER ALTERNATIF:</b> Jika Server 1 lambat atau buffering, silakan beralih ke Server 2, Server 4 (HD), atau Server 6.
                </p>
              </div>
            </section>

            {/* Synopsis & Cast Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-12 mb-16">
              {/* Left Column: Synopsis & Cast Spotlight */}
              <div className="space-y-8">
                {/* Synopsis */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
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
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={16} className="text-netflix-red" />
                      <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                        Pemeran Utama Spotlight
                      </span>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => scrollContainer(castScrollRef, 'prev')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                        title="Sebelumnya"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <div
                        ref={castScrollRef}
                        className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                      >
                        {castMembers.map(cast => {
                          const profileUrl = cast.profile_path
                            ? `https://image.tmdb.org/t/p/w200${cast.profile_path}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(cast.name)}&background=111&color=E50914&bold=true`;

                          return (
                            <Link
                              key={cast.id}
                              to={`/person/${cast.id}`}
                              className="flex-[0_0_90px] md:flex-[0_0_120px] text-center group no-underline"
                            >
                              <img
                                src={profileUrl}
                                alt={cast.name}
                                loading="lazy"
                                className="w-full aspect-square object-cover rounded-full border-2 border-white/10 group-hover:border-netflix-red transition-all duration-300 shadow-md group-hover:scale-105"
                              />
                              <div className="mt-2.5 text-xs font-bold text-white group-hover:text-netflix-red truncate transition-colors">
                                {cast.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                                {cast.character || 'Character'}
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => scrollContainer(castScrollRef, 'next')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-xl hidden md:flex"
                        title="Selanjutnya"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Genres */}
                {movieDetail.genres && movieDetail.genres.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
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
                          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-netflix-red hover:text-netflix-red text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
                        >
                          {g.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Production Details Card */}
              <div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-2xl space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-netflix-red block mb-1">
                      Sutradara / Produksi
                    </span>
                    <h3 className="text-base font-bold text-white">{directorName}</h3>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-netflix-red block mb-1">
                      Pemeran Utama
                    </span>
                    <div className="text-sm font-semibold text-zinc-300 space-y-1">
                      {castMembers.slice(0, 5).map(c => (
                        <div key={c.id}>{c.name}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations / More Like This */}
            {recommendations.length > 0 && (
              <section className="mt-16 mb-20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-netflix-red" />
                  <span className="text-xs font-black tracking-[3px] uppercase text-netflix-red">
                    Rekomendasi Serupa
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black font-outfit text-white mb-6">
                  Mungkin Kamu Juga Suka
                </h2>

                <div className="relative">
                  <button
                    onClick={() => scrollContainer(recGridRef, 'prev', 450)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-2xl hidden md:flex"
                    title="Sebelumnya"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div
                    ref={recGridRef}
                    className="flex gap-4 overflow-x-auto pb-6 no-scrollbar scroll-smooth"
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
                          className="flex-[0_0_150px] md:flex-[0_0_190px] relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/10 shadow-xl group transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:border-netflix-red hover:shadow-[0_20px_40px_rgba(229,9,20,0.4)]"
                        >
                          <img
                            src={posterUrl}
                            alt={itemTitle}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight font-outfit mb-1">
                              {itemTitle}
                            </h4>
                            <div className="text-[10px] font-extrabold text-netflix-red uppercase tracking-wider">
                              {year} • <span className="text-amber-400">★ {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}</span>
                            </div>
                          </div>
                          <div className="md:hidden block text-center text-xs font-bold text-white mt-1 px-1 truncate font-outfit">
                            {itemTitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => scrollContainer(recGridRef, 'next', 450)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-netflix-red transition-all cursor-pointer shadow-2xl hidden md:flex"
                    title="Selanjutnya"
                  >
                    <ChevronRight size={20} />
                  </button>
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
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-netflix-red text-white flex items-center justify-center shadow-[0_10px_25px_rgba(229,9,20,0.5)] hover:bg-white hover:text-netflix-red transition-all duration-300 hover:scale-110 cursor-pointer"
          title="Kembali ke Atas"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Unified Site Footer */}
      <Footer />
    </div>
  );
};

export default Watch;
