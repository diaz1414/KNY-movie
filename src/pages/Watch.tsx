import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getStreamById, type PlayableStream } from '../services/streamService';
import { LiveVideoPlayer } from '../components/live/LiveVideoPlayer';
import { ArrowLeft, Loader2, RefreshCw, Tv, Radio, Clock, Server } from 'lucide-react';

const Watch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const liveId = searchParams.get('live');

  // Movie/Series watch iframe states (original logic)
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Live Sports states
  const [liveStream, setLiveStream] = useState<PlayableStream | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // 1. Fetch live stream if liveId is active
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
  }, [liveId, reloadKey]);

  // Original watch.html source memo
  const watchSrc = useMemo(() => {
    return `/watch.html${window.location.search}${window.location.hash}`;
  }, [reloadKey]);

  // Original timeout & network listener hooks
  useEffect(() => {
    if (liveId) return; // skip for live mode

    const slowTimer = window.setTimeout(() => {
      if (!isLoaded) setIsSlow(true);
    }, 9000);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.clearTimeout(slowTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isLoaded, reloadKey, liveId]);

  // Original iframe redirect guard hook
  useEffect(() => {
    if (liveId) return; // skip for live mode

    let redirectGuardUntil = 0;
    const REDIRECT_GUARD_MS = 8000;

    const markIframeInteraction = () => {
      if (document.activeElement === iframeRef.current) {
        redirectGuardUntil = Date.now() + REDIRECT_GUARD_MS;
      }
    };

    const clearIframeInteraction = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && iframeRef.current?.contains(target)) return;
      redirectGuardUntil = 0;
    };

    const blockRecentIframeRedirect = (event: BeforeUnloadEvent) => {
      if (Date.now() >= redirectGuardUntil) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('blur', markIframeInteraction);
    window.addEventListener('beforeunload', blockRecentIframeRedirect);
    document.addEventListener('pointerdown', clearIframeInteraction, true);

    return () => {
      window.removeEventListener('blur', markIframeInteraction);
      window.removeEventListener('beforeunload', blockRecentIframeRedirect);
      document.removeEventListener('pointerdown', clearIframeInteraction, true);
    };
  }, [liveId]);

  const retry = () => {
    if (liveId) {
      setReloadKey((key) => key + 1);
    } else {
      setIsLoaded(false);
      setIsSlow(false);
      setReloadKey((key) => key + 1);
    }
  };

  // --- RENDER LIVE SPORTS MODE ---
  if (liveId) {
    return (
      <main className="fixed inset-0 z-[9999] bg-black text-white flex flex-col font-sans">
        {/* Top Header Navigation */}
        <header className="flex items-center justify-between p-4 bg-zinc-950/80 border-b border-white/5 select-none shrink-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-full hover:bg-white/10 text-white transition-all cursor-pointer"
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
            onClick={retry}
            className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
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
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-netflix-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Kembali
              </button>
            </div>
          ) : liveStream ? (
            <div className="w-full space-y-4">
              <LiveVideoPlayer servers={liveStream.servers} />

              {/* Premium Match / Channel Info Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl">
                {/* Glow accent */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-netflix-red/10 blur-3xl" />

                <div className="relative flex items-center gap-4">
                  {/* Team logos / Channel logo */}
                  {liveStream.isChannel ? (
                    /* Channel logo */
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
                    /* Match team logos */
                    <div className="flex items-center gap-2 shrink-0">
                      {liveStream.logo ? (
                        <img src={liveStream.logo} alt={liveStream.player1 || ''} className="h-11 w-11 rounded-xl object-contain bg-white/5 border border-white/10 p-1" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg"><Radio size={18} className="text-zinc-600" /></div>
                      )}
                      <span className="text-zinc-600 font-black text-sm">VS</span>
                      {liveStream.logo2 ? (
                        <img src={liveStream.logo2} alt={liveStream.player2 || ''} className="h-11 w-11 rounded-xl object-contain bg-white/5 border border-white/10 p-1" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg"><Radio size={18} className="text-zinc-600" /></div>
                      )}
                    </div>
                  )}

                  {/* Info text */}
                  <div className="flex-1 min-w-0">
                    {/* Live badge */}
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

  // --- RENDER REGULAR MOVIE/SERIES IFRAME MODE ---
  return (
    <main className="fixed inset-0 z-[9999] bg-black text-white font-sans">
      {!isLoaded && (
        <section className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
          <div className="w-full max-w-sm">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/30 bg-red-600/10 shadow-[0_0_50px_rgba(229,9,20,0.2)]">
              <span className="font-outfit text-3xl font-black text-netflix-red">YKN</span>
            </div>
            <div className="mx-auto mb-6 h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-netflix-red" />
            </div>
            <h1 className="mb-3 font-outfit text-xl font-black uppercase tracking-[0.22em] text-white">
              {isOffline ? 'Connection Lost' : isSlow ? 'Still Loading' : 'Preparing Player'}
            </h1>
            <p className="mx-auto mb-7 max-w-xs text-sm font-medium leading-6 text-white/55">
              {isOffline
                ? 'Internet kamu lagi putus. Sambungkan lagi lalu coba reload player.'
                : isSlow
                  ? 'Jaringan atau server streaming sedang lambat. Tunggu sebentar, atau coba muat ulang.'
                  : 'Sedang menyiapkan halaman nonton dan server terbaik untuk perangkat kamu.'}
            </p>
            {isSlow || isOffline ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-full bg-netflix-red px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:brightness-110"
                >
                  Retry
                </button>
                <a
                  href={watchSrc}
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-black uppercase tracking-widest text-white/80 transition hover:bg-white/10"
                >
                  Direct
                </a>
              </div>
            ) : null}
          </div>
        </section>
      )}
      <iframe
        ref={iframeRef}
        key={reloadKey}
        title="YKN Watch Player"
        src={watchSrc}
        onLoad={() => setIsLoaded(true)}
        className={`h-dvh w-screen border-0 bg-black transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </main>
  );
};

export default Watch;
