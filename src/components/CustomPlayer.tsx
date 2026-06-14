import React, { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Film, Settings } from 'lucide-react';
import NetflixLoader from './NetflixLoader';
import { useTranslation } from 'react-i18next';

interface CustomPlayerProps {
  url: string;
  type: string;
  keyId?: string;
  keyVal?: string; // Use keyVal to avoid React 'key' prop conflict
}

export const CustomPlayer: React.FC<CustomPlayerProps> = ({ url, type, keyId, keyVal }) => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<shaka.Player | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPip, setIsPip] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [liveDelay, setLiveDelay] = useState(0);
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [abrEnabled, setAbrEnabled] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [buffering, setBuffering] = useState(false);

  // Auto-hide controls timer reference
  const controlsTimeoutRef = useRef<any>(null);

  // 1. Initialize and attach Shaka Player instance once on mount
  useEffect(() => {
    shaka.polyfill.installAll();

    const video = videoRef.current;
    if (!video) return;

    if (!shaka.Player.isBrowserSupported()) {
      console.warn('Shaka Player is not supported by this browser. Falling back to native video playback.');
      return;
    }

    const player = new shaka.Player();
    playerRef.current = player;

    const onError = (event: any) => {
      const shakaErr = event.detail;
      if (shakaErr && shakaErr.code === 7002) return;
      console.error('Shaka Player error:', shakaErr);
      setError(shakaErr.message || `Error playing video stream (Code ${shakaErr.code}).`);
    };
    player.addEventListener('error', onError);

    const onBuffering = (event: any) => {
      setBuffering(event.buffering);
    };
    player.addEventListener('buffering', onBuffering);

    // Track detection and quality resolution listeners
    const updateTracks = () => {
      if (playerRef.current) {
        const variantTracks = playerRef.current.getVariantTracks();
        const uniqueTracks: any[] = [];
        const seenHeights = new Set<number>();
        // Sort quality heights descending (e.g., 1080p, 720p, etc.)
        const sorted = [...variantTracks].sort((a, b) => (b.height || 0) - (a.height || 0));
        for (const track of sorted) {
          if (track.height && !seenHeights.has(track.height)) {
            seenHeights.add(track.height);
            uniqueTracks.push(track);
          }
        }
        setTracks(uniqueTracks);

        const activeTrack = variantTracks.find(t => t.active);
        setCurrentTrack(activeTrack || null);

        const config = playerRef.current.getConfiguration();
        setAbrEnabled(config.abr.enabled);
      }
    };

    player.addEventListener('trackschanged', updateTracks);
    player.addEventListener('adaptation', () => {
      if (playerRef.current) {
        const activeTrack = playerRef.current.getVariantTracks().find(t => t.active);
        setCurrentTrack(activeTrack || null);
      }
    });

    player.attach(video).catch((err) => {
      console.error('Failed to attach video to Shaka Player:', err);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.removeEventListener('buffering', onBuffering);
        playerRef.current.destroy().catch(() => { });
        playerRef.current = null;
      }
      if (video) {
        video.src = '';
        video.load();
      }
    };
  }, [refreshKey]);

  // 2. Load and play stream whenever url, type, keyId, or keyVal changes
  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (!video) return;

    let isCancelled = false;

    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setTracks([]);
    setCurrentTrack(null);
    setShowQualityMenu(false);
    setBuffering(false);

    const initAndLoad = async () => {
      try {
        if (!player) {
          // Fallback to native HTML5 video player direct src assignment if Shaka is unavailable
          video.src = url;
          setLoading(false);
          setIsPlaying(true);
          video.play().catch(() => { });
          return;
        }

        // Reset any previous ClearKey config to clean state
        player.configure({
          drm: {
            clearKeys: {}
          }
        });

        // Configure general streaming parameters optimized for resilience on slow connections
        player.configure({
          streaming: {
            bufferingGoal: 15,      // Keep a robust 15 seconds of buffer ahead of the playhead (previously 8)
            rebufferingGoal: 4,    // Start playing as soon as we have 4 seconds of buffer (previously 2) to prevent rapid start/stop stuttering
            liveSync: {
              enabled: true,
              targetLatency: 10,   // Stable 10s latency provides a larger buffer for network variance
            },
            retryParameters: {
              maxAttempts: 6,      // Retry media segment fetches up to 6 times (previously 3)
              baseDelay: 1000,
              backoffFactor: 1.5,
              timeout: 15000       // Give requests up to 15s timeout before declaring error
            }
          },
          manifest: {
            retryParameters: {
              maxAttempts: 6,      // Retry manifest updates up to 6 times
              baseDelay: 1000,
              backoffFactor: 1.5,
              timeout: 15000       // Give manifest fetches up to 15s timeout before declaring error
            }
          },
          abr: {
            enabled: true,
            defaultBandwidthEstimate: 500000 // Start with a safe 500kbps estimate to play low quality quickly on slow connections
          }
        });

        if (type === 'dash-clearkey' && keyId && keyVal) {
          player.configure({
            drm: {
              clearKeys: {
                [keyId.trim()]: keyVal.trim()
              }
            }
          });
        }

        // Load new stream URL (Shaka automatically unloads the previous source cleanly)
        await player.load(url);
        if (isCancelled) return;

        setLoading(false);
        setIsPlaying(true);
        video.play().catch((err) => {
          console.log('Autoplay blocked. User interaction required.', err);
          setIsPlaying(false);
        });
      } catch (err: any) {
        if (isCancelled) return;
        if (err.code === 7002) { // LOAD_INTERRUPTED
          console.log('Load interrupted (normal behavior during source switch).');
          return;
        }
        console.error('Failed to load stream:', err);
        if (url.includes('.m3u8')) {
          console.log('Shaka load failed for HLS. Trying native playback fallback...');
          video.src = url;
          setLoading(false);
          setIsPlaying(true);
          video.play().catch(() => { });
        } else {
          setError('Failed to load stream: ' + (err.message || err.code));
          setLoading(false);
        }
      }
    };

    initAndLoad();

    // Function to calculate and update current live delay
    const updateDelay = () => {
      if (video) {
        let liveEdge = 0;
        if (video.seekable && video.seekable.length > 0) {
          const end = video.seekable.end(video.seekable.length - 1);
          liveEdge = isFinite(end) ? end : 0;
        } else {
          liveEdge = isFinite(video.duration) ? video.duration : 0;
        }
        const curTime = isFinite(video.currentTime) ? video.currentTime : 0;
        const diff = liveEdge - curTime;
        const currentDelay = isFinite(diff) && diff >= 0 ? Math.round(diff) : 0;
        setLiveDelay(currentDelay);
      }
    };

    // Keep live delay updated in real-time (ticking up even when video is paused)
    const delayInterval = setInterval(updateDelay, 1000);

    // Handle Native Video Playback Events to sync custom controls state
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      if (video) {
        setIsMuted(video.muted);
        setVolume(video.volume);
      }
    };

    const onTimeUpdate = () => {
      updateDelay();
    };

    const onVideoError = () => {
      if (video && video.error) {
        console.error('Native video error:', video.error);
        setError(`Native playback error (Code ${video.error.code}): ${video.error.message || 'Failed to load or locate media stream.'}`);
        setLoading(false);
      }
    };

    const onWaiting = () => setBuffering(true);
    const onPlaying = () => {
      setIsPlaying(true);
      setBuffering(false);
    };
    const onCanPlay = () => setBuffering(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('error', onVideoError);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      isCancelled = true;
      clearInterval(delayInterval);
      if (video) {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('volumechange', onVolumeChange);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('error', onVideoError);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('canplay', onCanPlay);
      }
    };
  }, [url, type, keyId, keyVal, refreshKey]);

  // Synchronize controls visibility auto-hide on mouse movement
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Close quality menu if user clicks outside of it
  useEffect(() => {
    if (!showQualityMenu) return;
    const closeMenu = () => setShowQualityMenu(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [showQualityMenu]);

  // Sync fullscreen change state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (isCurrentlyFullscreen) {
        // Lock screen orientation to landscape on mobile devices when entering fullscreen
        const orientation = screen.orientation as any;
        if (orientation && typeof orientation.lock === 'function') {
          orientation.lock('landscape').catch((err: any) => {
            console.log('Screen orientation lock is not supported or was rejected:', err);
          });
        }
      } else {
        // Unlock orientation on exiting fullscreen
        const orientation = screen.orientation as any;
        if (orientation && typeof orientation.unlock === 'function') {
          try {
            orientation.unlock();
          } catch (err) {
            console.log('Screen orientation unlock failed:', err);
          }
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Sync Picture-in-Picture state and check support
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsPipSupported(
      document.pictureInPictureEnabled &&
      typeof video.requestPictureInPicture === 'function'
    );

    const onEnterPip = () => setIsPip(true);
    const onLeavePip = () => setIsPip(false);

    video.addEventListener('enterpictureinpicture', onEnterPip);
    video.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPip);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, [loading]);

  // Control Handlers
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => { });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = parseFloat(e.target.value);
    video.volume = val;
    video.muted = val === 0;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen mode:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const togglePip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('Failed to toggle Picture-in-Picture:', err);
    }
  };

  // Click on "LIVE" jumps player immediately to the real-time live edge
  const jumpToLiveEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    let targetTime = 0;
    if (video.seekable && video.seekable.length > 0) {
      const end = video.seekable.end(video.seekable.length - 1);
      if (isFinite(end)) {
        targetTime = end - 0.5;
      }
    } else if (isFinite(video.duration)) {
      targetTime = video.duration;
    }

    if (isFinite(targetTime) && targetTime > 0) {
      video.currentTime = targetTime;
    }

    // Automatically resume playback if paused
    if (video.paused) {
      video.play().catch((err) => {
        console.error('Failed to auto-play after jumping to live edge:', err);
      });
    }
    console.log('Jumping player to real-time live edge.');
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full h-full bg-[#050505] flex items-center justify-center group overflow-hidden select-none ${
        !showControls && isPlaying ? 'cursor-none' : ''
      }`}
    >
      {/* HTML5 Video Element (without native controls to allow customized overlays) */}
      <video
        ref={videoRef}
        onDoubleClick={() => toggleFullscreen()}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
      />

      {/* Top-Right Watermark Logo */}
      {!loading && !error && (
        <div
          className={`absolute z-10 flex items-center bg-black/75 backdrop-blur-md border border-white/10 text-white select-none pointer-events-none transition-all duration-300 ${
            isFullscreen
              ? 'top-6 right-6 md:top-8 md:right-8 gap-2 md:gap-2.5 px-3 py-2 md:px-4 md:py-2.5 rounded-2xl'
              : 'top-4 right-4 gap-1.5 px-2.5 py-1.5 rounded-xl'
          } ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <Film
            className={`text-netflix-red transition-all duration-300 ${
              isFullscreen ? 'w-4 h-4 md:w-5 md:h-5' : 'w-3.5 h-3.5'
            }`}
          />
          <span
            className={`font-black tracking-widest uppercase font-outfit transition-all duration-300 ${
              isFullscreen ? 'text-xs md:text-sm' : 'text-[10px]'
            }`}
          >
            YKN TV
          </span>
          <span
            className={`rounded-full bg-netflix-red animate-pulse transition-all duration-300 ${
              isFullscreen ? 'w-2 h-2' : 'w-1.5 h-1.5'
            }`}
          />
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070707] overflow-hidden">
          {/* Subtle Stadium Pitch Background (Full Cover) */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-20">
            <img
              src="/stadium_pitch_bg.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Faint YKN Logo Watermark */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
            <div className="flex items-center gap-3 text-white">
              <Film className="w-24 h-24 text-netflix-red" />
              <span className="text-7xl font-black tracking-tighter uppercase">YKN</span>
            </div>
          </div>

          {/* Foreground Loader content */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <NetflixLoader />
            <span className="text-zinc-500 text-[10px] md:text-xs font-bold tracking-widest uppercase animate-pulse">
              Loading Stream...
            </span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070707]/95 text-white gap-4 backdrop-blur-sm">
          {/* Subtle Stadium Pitch Background (Full Cover) */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-10">
            <img
              src="/stadium_pitch_bg.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <span className="text-netflix-red font-extrabold uppercase tracking-widest text-xs md:text-sm">
              {t('playback_error')}
            </span>
            <p className="text-zinc-400 text-[10px] md:text-xs max-w-md font-medium px-4">{error}</p>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-netflix-red hover:bg-red-700 text-white font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(229,9,20,0.4)] cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>{t('retry_button')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Central Play/Pause overlay button */}
      {!loading && !error && !buffering && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-15 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <button
            onClick={togglePlay}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/30 hover:bg-netflix-red/80 hover:border-netflix-red/80 border border-white/10 flex items-center justify-center text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.4)] cursor-pointer pointer-events-auto"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="ml-1" />
            )}
          </button>
        </div>
      )}

      {/* Buffering Overlay */}
      {buffering && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-15 bg-black/10 pointer-events-none">
          <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
            {/* The Outer Ring */}
            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
            {/* The Spinning Segment */}
            <div className="absolute inset-0 border-4 border-transparent border-t-netflix-red rounded-full animate-spin"></div>
            {/* Inner Glow */}
            <div className="absolute inset-2 border-2 border-netflix-red/20 rounded-full blur-sm"></div>
          </div>
        </div>
      )}

      {/* CUSTOM PREMIUM CONTROLS BAR (Overlay) */}
      {!loading && !error && (
        <div
          className={`absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bottom control row */}
          <div className="flex items-center justify-between w-full">

            {/* Left Controls: Play/Pause, Refresh and Volume */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-netflix-red transition-colors cursor-pointer flex items-center justify-center"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>

              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="text-white hover:text-netflix-red transition-all duration-500 hover:rotate-180 active:scale-90 cursor-pointer flex items-center justify-center"
                title={t('refresh_player')}
              >
                <RotateCcw size={18} />
              </button>

              {/* Volume block */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-netflix-red transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-24 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-netflix-red focus:outline-none opacity-0 group-hover/volume:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>

            {/* Middle Controls: PREMIUM CLICKABLE REALTIME "LIVE" BADGE */}
            {(() => {
              const isLive = liveDelay <= 10;
              const displayDelay = liveDelay - 10;
              return (
                <div className="flex items-center justify-center">
                  <button
                    onClick={jumpToLiveEdge}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-white/10 border border-white/15 active:scale-95 transition-all text-white cursor-pointer"
                    title={isLive ? "You are watching live" : `Behind by ${displayDelay}s (Click to sync to live)`}
                  >
                    <span className="relative flex h-2 w-2">
                      {isLive ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-netflix-red opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-netflix-red"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse"></span>
                      )}
                    </span>

                    <span className={`text-[10px] md:text-xs font-black tracking-widest uppercase transition-colors duration-300 ${isLive ? 'text-white' : 'text-amber-500'
                      }`}>
                      {isLive ? 'LIVE' : `LIVE -${displayDelay < 60
                        ? `${displayDelay}s`
                        : `${Math.floor(displayDelay / 60)}:${(displayDelay % 60).toString().padStart(2, '0')}`
                        }`}
                    </span>

                    {!isLive && (
                      <RotateCcw size={10} className="text-amber-500 animate-spin" />
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Right Controls: Quality, PiP and Fullscreen buttons */}
            <div className="flex items-center gap-3">

              {/* Quality Selector (DASH/HLS via Shaka) */}
              {tracks.length > 1 && (
                <div className="relative flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQualityMenu(!showQualityMenu);
                    }}
                    className={`text-white hover:text-netflix-red transition-all cursor-pointer flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider select-none ${showQualityMenu ? 'text-netflix-red' : ''
                      }`}
                    title="Change Resolution"
                  >
                    <Settings size={20} className={showQualityMenu ? 'animate-spin-slow' : ''} />
                    <span className="hidden sm:inline">
                      {abrEnabled ? `Auto (${currentTrack?.height ? `${currentTrack.height}p` : ''})` : (currentTrack?.height ? `${currentTrack.height}p` : 'Quality')}
                    </span>
                  </button>

                  {/* Quality Dropdown Popup */}
                  {showQualityMenu && (
                    <div className="absolute bottom-10 right-0 z-30 w-32 bg-black/95 border border-white/10 rounded-xl p-2 flex flex-col gap-1 backdrop-blur-md shadow-2xl animate-fade-in pointer-events-auto">
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-[2px] px-2.5 py-1.5 select-none">
                        Resolution
                      </span>
                      {/* Auto Option */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playerRef.current) {
                            playerRef.current.configure({ abr: { enabled: true } });
                            setAbrEnabled(true);
                            const active = playerRef.current.getVariantTracks().find(t => t.active);
                            setCurrentTrack(active || null);
                          }
                          setShowQualityMenu(false);
                        }}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${abrEnabled ? 'bg-netflix-red text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        <span>Auto</span>
                        {abrEnabled && <span className="text-[8px] font-black bg-white/20 px-1 rounded-sm">ACT</span>}
                      </button>

                      {/* Track Options */}
                      {tracks.map((track) => {
                        const isCurrent = !abrEnabled && currentTrack?.id === track.id;
                        return (
                          <button
                            key={track.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (playerRef.current) {
                                playerRef.current.configure({ abr: { enabled: false } });
                                playerRef.current.selectVariantTrack(track, true);
                                setAbrEnabled(false);
                                setCurrentTrack(track);
                              }
                              setShowQualityMenu(false);
                            }}
                            className={`text-left px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${isCurrent ? 'bg-netflix-red text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            <span>{track.height}p</span>
                            {isCurrent && <span className="text-[8px] font-black bg-white/20 px-1 rounded-sm">ACT</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {isPipSupported && (
                <button
                  onClick={togglePip}
                  className="text-white hover:text-netflix-red transition-colors cursor-pointer"
                  title="Picture-in-Picture"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 4.5H4a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 4 19.5h16a1.5 1.5 0 0 0 1.5-1.5v-4" />
                    <rect x="13" y="4.5" width="8" height="6" rx="1" fill={isPip ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-netflix-red transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
