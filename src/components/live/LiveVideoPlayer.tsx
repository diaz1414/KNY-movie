import React, { useEffect, useRef, useState, useCallback } from 'react';
import shaka from 'shaka-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Server, AlertTriangle, ShieldAlert, Settings, Radio } from 'lucide-react';
import { getProxiedUrl, getCdnBackupUrl, type StreamServer } from '../../services/streamService';

interface LiveVideoPlayerProps {
  servers: StreamServer[];
}

export const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({ servers }) => {
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  // Quality selector
  const [qualityTracks, setQualityTracks] = useState<Array<{ id: number; height: number; label: string }>>([]);
  const [selectedQuality, setSelectedQuality] = useState<number | 'auto'>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  // Live indicator
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [isBehindLive, setIsBehindLive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<shaka.Player | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Ref to cancel an in-progress load when server changes
  const loadingCancelledRef = useRef(false);
  // Track which server index is currently being tried (ref = no re-render)
  const activeServerIdxRef = useRef(0);
  const serversRef = useRef(servers);
  serversRef.current = servers;
  // Cursor/controls idle timer
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentServer = servers[activeServerIdx] || servers[0];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const getDrmKeys = (server: StreamServer): Record<string, string> | null => {
    if (server.keys && Object.keys(server.keys).length > 0) return server.keys;
    if (server.keyId && server.key) return { [server.keyId.trim()]: server.key.trim() };

    const [, drmString] = server.url.split('|');
    if (!drmString) return null;

    const keys: Record<string, string> = {};
    drmString.split('&').forEach(pair => {
      const [id, key] = pair.split('=');
      if (id && key) keys[id.replace(/.*=/, '').trim()] = key.trim();
    });
    return Object.keys(keys).length > 0 ? keys : null;
  };

  const cleanStreamUrl = (url: string) => url.split('|')[0].trim();

  const resolveDynamicStreamUrl = async (server: StreamServer): Promise<string> => {
    const rawUrl = cleanStreamUrl(server.url);
    if (!server.tokenChannelId || !server.tokenEndpoint) return rawUrl;

    const tokenRes = await fetch(getProxiedUrl(server.tokenEndpoint, true), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: server.tokenChannelId }),
      cache: 'no-store',
    });
    if (!tokenRes.ok) throw new Error(`SBS token request failed: ${tokenRes.status}`);

    const tokenData = (await tokenRes.json()) as { playUrl?: string };
    if (!tokenData.playUrl) throw new Error('SBS token response missing playUrl');

    return new URL(tokenData.playUrl, server.tokenBaseUrl || window.location.origin).toString();
  };

  // ---------------------------------------------------------------------------
  // Load a stream into the already-attached player
  // ---------------------------------------------------------------------------

  const loadStream = useCallback(async (server: StreamServer, serverIdx: number) => {
    const player = playerRef.current;
    const video = videoRef.current;
    if (!player || !video) return;

    setLoading(true);
    setError(null);
    loadingCancelledRef.current = false;

    try {
      let resolvedUrl = await resolveDynamicStreamUrl(server);
      if (loadingCancelledRef.current) return;

      if (server.forceProxy) {
        resolvedUrl = getProxiedUrl(resolvedUrl, true);
      } else if (server.cdnBackup) {
        resolvedUrl = getCdnBackupUrl(resolvedUrl, true);
      }

      // Clear stale request filters from previous load
      player.getNetworkingEngine()?.clearAllRequestFilters();

      // DRM clearKeys (untuk DASH MPD atau HLS + DRM)
      const drmKeys = getDrmKeys(server);
      if (drmKeys) {
        player.configure({ drm: { clearKeys: drmKeys } });
      } else {
        player.configure({ drm: { clearKeys: {} } });
      }

      // ABR: mulai dari resolusi terendah dulu, naikkan bertahap
      // Identik dengan YKN TV agar tidak buffering panjang di awal
      player.configure({
        abr: {
          defaultBandwidthEstimate: 300_000,
          bandwidthUpgradeTarget: 0.7,
          bandwidthDowngradeTarget: 0.95,
          switchInterval: 8,
          restrictions: { maxHeight: 240 },
        },
        streaming: {
          rebufferingGoal: 8,
          bufferingGoal: 30,
          bufferBehind: 30,
          retryParameters: {
            maxAttempts: 5,
            baseDelay: 700,
            backoffFactor: 2,
            timeout: 15000,
          },
        },
        manifest: {
          retryParameters: {
            maxAttempts: 4,
            baseDelay: 500,
            backoffFactor: 2,
            timeout: 10000,
          },
        },
      });

      await player.load(resolvedUrl);
      if (loadingCancelledRef.current) return;

      // Setelah 8 detik berjalan, lepas batasan resolusi agar ABR bisa naik bebas
      setTimeout(() => {
        if (!loadingCancelledRef.current && playerRef.current) {
          playerRef.current.configure({ abr: { restrictions: { maxHeight: Infinity } } });
        }
      }, 8000);
      if (loadingCancelledRef.current) return;

      setLoading(false);
      setIsPlaying(true);

      // Detect live stream and populate quality tracks after load
      const isLive = player.isLive?.() ?? false;
      setIsLiveStream(isLive);
      setIsBehindLive(false);
      setSelectedQuality('auto');
      setShowQualityMenu(false);

      // Get unique quality tracks sorted descending by height
      const tracks = player.getVariantTracks?.() ?? [];
      const seen = new Set<number>();
      const unique = tracks
        .filter((t: any) => t.height && !seen.has(t.height) && seen.add(t.height))
        .sort((a: any, b: any) => b.height - a.height)
        .map((t: any) => ({
          id: t.id,
          height: t.height as number,
          label: t.height >= 1080 ? '1080p HD' : t.height >= 720 ? '720p HD' : t.height >= 480 ? '480p' : t.height >= 360 ? '360p' : `${t.height}p`,
        }));
      setQualityTracks(unique);

      // Poll to detect if user has seeked behind live edge
      if (isLive) {
        const liveCheckInterval = setInterval(() => {
          if (loadingCancelledRef.current) { clearInterval(liveCheckInterval); return; }
          try {
            const p = playerRef.current;
            if (!p) { clearInterval(liveCheckInterval); return; }
            const range = p.seekRange?.();
            const v = videoRef.current;
            if (range && v) {
              setIsBehindLive(range.end - v.currentTime > 15);
            }
          } catch { clearInterval(liveCheckInterval); }
        }, 3000);
      }

      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => setIsPlaying(false));
      });
    } catch (err: any) {
      if (loadingCancelledRef.current) return;
      if (err?.code === 7000) return; // LOAD_INTERRUPTED — intentional cancel

      console.warn(`Server ${serverIdx + 1} gagal:`, err?.message || err);

      // Auto-switch: try next non-iframe server automatically
      const allServers = serversRef.current;
      const nextIdx = allServers.findIndex(
        (s, i) => i > serverIdx && s.type !== 'iframe'
      );

      if (nextIdx !== -1) {
        console.log(`Auto-switch ke server ${nextIdx + 1}: ${allServers[nextIdx].name}`);
        activeServerIdxRef.current = nextIdx;
        setActiveServerIdx(nextIdx);
        // loadStream will be triggered by the useEffect watching activeServerIdx
        return;
      }

      // All servers exhausted
      setError('Gagal memuat video stream. Silakan coba server cadangan.');
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // ONE-TIME: init Shaka Player and attach to <video> on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    shaka.polyfill.installAll();

    const player = new shaka.Player();
    playerRef.current = player;

    player.addEventListener('error', (event: any) => {
      const detail = event.detail;
      if (!detail) return;
      // Suppress LOAD_INTERRUPTED — those are expected when switching servers
      if (detail.code === 7000) return;
      if (detail.severity === 2) {
        setError('Gagal memuat video stream. Silakan coba server cadangan.');
        setLoading(false);
      }
    });

    // Attach once and keep the player alive for the component lifetime
    player.attach(video).then(() => {
      const initial = servers[0];
      if (initial && initial.type !== 'iframe') {
        loadStream(initial, 0);
      } else if (initial?.type === 'iframe') {
        setLoading(false);
        setError(null);
      }
    }).catch(err => {
      console.error('Shaka attach failed:', err);
      setError('Player gagal diinisialisasi.');
      setLoading(false);
    });

    return () => {
      loadingCancelledRef.current = true;
      player.destroy().catch(() => {});
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // When active server changes, just call load() — no new Player needed
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!currentServer) return;

    if (currentServer.type === 'iframe') {
      loadingCancelledRef.current = true;
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous in-flight load
    loadingCancelledRef.current = true;

    const idxToLoad = activeServerIdx;
    const serverToLoad = currentServer;

    // Small delay so Shaka can acknowledge the cancellation before we start a new load
    const timer = setTimeout(() => {
      loadStream(serverToLoad, idxToLoad);
    }, 80);

    return () => clearTimeout(timer);
  }, [currentServer, loadStream]);

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------

  // Quality selection
  const selectQuality = useCallback((trackId: number | 'auto') => {
    const player = playerRef.current;
    if (!player) return;
    setSelectedQuality(trackId);
    setShowQualityMenu(false);
    if (trackId === 'auto') {
      player.configure({ abr: { enabled: true } });
    } else {
      player.configure({ abr: { enabled: false } });
      const tracks = player.getVariantTracks?.() ?? [];
      const track = tracks.find((t: any) => t.id === trackId);
      if (track) player.selectVariantTrack(track, true);
    }
  }, []);

  // Sync to live edge
  const syncToLive = useCallback(() => {
    const player = playerRef.current;
    const video = videoRef.current;
    if (player && video) {
      try {
        const range = player.seekRange();
        if (range) {
          video.currentTime = range.end;
          setIsBehindLive(false);
        }
      } catch (e) {
        console.warn('Failed to sync to live edge:', e);
      }
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); setIsPlaying(false); }
    else { video.play().catch(() => {}); setIsPlaying(true); }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else container.requestFullscreen().catch(() => {});
  };

  // Fullscreen change listener — removes rounded corners when in fullscreen
  useEffect(() => {
    const onFsChange = () => {
      const fs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(fs);
      if (fs) setShowControls(true);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // Show controls + cursor on mouse move, hide after 3s idle (fullscreen) or always show non-fullscreen
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    const container = containerRef.current;
    if (container) container.style.cursor = 'default';
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isFullscreen) {
      idleTimerRef.current = setTimeout(() => {
        setShowControls(false);
        const c = containerRef.current;
        if (c) c.style.cursor = 'none';
      }, 3000);
    }
  }, [isFullscreen]);

  // Clean up idle timer on unmount
  useEffect(() => () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!currentServer) {
    return (
      <div className="aspect-video w-full bg-zinc-950 flex flex-col items-center justify-center border border-white/5 rounded-3xl p-6 text-center">
        <ShieldAlert className="text-zinc-600 mb-3" size={40} />
        <p className="text-zinc-400 font-black uppercase text-sm">Tidak ada server streaming tersedia</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isFullscreen && setShowControls(false)}
        className={`relative w-full bg-black shadow-2xl ${
          isFullscreen
            ? 'fixed inset-0 z-[9999] aspect-auto h-full'
            : 'aspect-video rounded-3xl overflow-hidden border border-white/10'
        }`}
      >
        {currentServer.type === 'iframe' ? (
          <iframe
            src={currentServer.url}
            title={currentServer.name}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              onClick={togglePlay}
            />

            {/* Overlay controls — visible on mouse move or non-fullscreen hover */}
            <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
              showControls || !isFullscreen ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Top gradient */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />
              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />

              {/* Controls bar */}
              <div className="relative z-10 flex items-center justify-between px-4 pb-4">
                {/* Left: Play + Mute + LIVE badge */}
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="text-white hover:text-netflix-red transition-colors active:scale-90">
                    {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                  </button>
                  <button onClick={toggleMute} className="text-white hover:text-netflix-red transition-colors active:scale-90">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>

                  {/* LIVE sync button */}
                  {isLiveStream && (
                    <button
                      onClick={syncToLive}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 ${
                        isBehindLive
                          ? 'bg-zinc-700/80 text-zinc-300 hover:bg-netflix-red hover:text-white'
                          : 'bg-netflix-red text-white shadow-lg shadow-red-900/40'
                      }`}
                    >
                      <Radio size={10} className={isBehindLive ? '' : 'animate-pulse'} />
                      LIVE
                    </button>
                  )}
                </div>

                {/* Right: Quality selector + Fullscreen */}
                <div className="flex items-center gap-2">
                  {/* Quality dropdown */}
                  {qualityTracks.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowQualityMenu(m => !m)}
                        className="flex items-center gap-1.5 text-white hover:text-netflix-red transition-colors active:scale-90"
                      >
                        <Settings size={18} />
                        <span className="text-[10px] font-black hidden sm:inline">
                          {selectedQuality === 'auto' ? 'AUTO' : qualityTracks.find(q => q.id === selectedQuality)?.label ?? 'AUTO'}
                        </span>
                      </button>

                      {showQualityMenu && (
                        <div className="absolute bottom-8 right-0 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-w-[110px] z-50">
                          <button
                            onClick={() => selectQuality('auto')}
                            className={`w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                              selectedQuality === 'auto' ? 'text-netflix-red bg-netflix-red/10' : 'text-zinc-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            Auto
                          </button>
                          {qualityTracks.map(q => (
                            <button
                              key={q.id}
                              onClick={() => selectQuality(q.id)}
                              className={`w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                                selectedQuality === q.id ? 'text-netflix-red bg-netflix-red/10' : 'text-zinc-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {q.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={handleFullscreen} className="text-white hover:text-netflix-red transition-colors active:scale-90">
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="text-netflix-red mb-3" size={36} />
                <p className="text-sm text-zinc-300 font-bold max-w-xs">{error}</p>
                <button
                  onClick={() => setActiveServerIdx((idx) => (idx + 1) % servers.length)}
                  className="mt-4 px-4 py-2 bg-netflix-red hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Coba Server Lain
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Server Selector Bar */}
      {servers.length > 1 && (
        <div className="flex flex-col gap-2.5">
          <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
            <Server size={12} />
            Pilih Server Siaran
          </p>
          <div className="flex flex-wrap gap-2">
            {servers.map((srv, idx) => (
              <button
                key={idx}
                onClick={() => setActiveServerIdx(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeServerIdx === idx
                    ? 'bg-netflix-red text-white shadow-lg shadow-red-900/30 border border-netflix-red'
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {srv.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
