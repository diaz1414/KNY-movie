import React, { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Film } from 'lucide-react';
import NetflixLoader from './NetflixLoader';

interface CustomPlayerProps {
  url: string;
  type: string;
  keyId?: string;
  keyVal?: string; // Use keyVal to avoid React 'key' prop conflict
}

export const CustomPlayer: React.FC<CustomPlayerProps> = ({ url, type, keyId, keyVal }) => {
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

  // Auto-hide controls timer reference
  const controlsTimeoutRef = useRef<any>(null);

  // Initialize Shaka Player
  useEffect(() => {
    shaka.polyfill.installAll();

    const video = videoRef.current;
    if (!video) return;

    if (!shaka.Player.isBrowserSupported()) {
      console.warn('Shaka Player is not supported by this browser. Falling back to native video playback.');
      video.src = url;
      setLoading(false);
      return;
    }

    const player = new shaka.Player();
    playerRef.current = player;

    const onError = (event: any) => {
      const shakaErr = event.detail;
      // Filter out non-fatal or expected errors like LOAD_INTERRUPTED (7002)
      if (shakaErr && shakaErr.code === 7002) {
        console.log('Ignore non-fatal Shaka error 7002 (LOAD_INTERRUPTED)');
        return;
      }
      console.error('Shaka Player error:', shakaErr);
      setError(shakaErr.message || `Error playing video stream (Code ${shakaErr.code}).`);
    };
    player.addEventListener('error', onError);

    // Target a tight 3s delay from live edge to stay in sync
    player.configure({
      streaming: {
        liveSync: {
          enabled: true,
          targetLatency: 3,
        }
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

    let isCancelled = false;

    setLoading(true);
    setError(null);

    const initAndLoad = async () => {
      try {
        await player.attach(video);
        if (isCancelled) return;

        await player.load(url);
        if (isCancelled) return;

        setLoading(false);
        setIsPlaying(true);
        video.play().catch(() => {
          console.log('Autoplay blocked. User interaction required.');
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
          liveEdge = video.seekable.end(video.seekable.length - 1);
        } else {
          liveEdge = video.duration || 0;
        }
        const currentDelay = Math.max(0, Math.round(liveEdge - video.currentTime));
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

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      isCancelled = true;
      clearInterval(delayInterval);
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
        playerRef.current = null;
      }
      if (video) {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('volumechange', onVolumeChange);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.src = '';
        video.load();
      }
    };
  }, [url, type, keyId, keyVal]);

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

  // Sync fullscreen change state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
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
      video.play().catch(() => {});
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

    // Check seekable range ends
    if (video.seekable && video.seekable.length > 0) {
      video.currentTime = video.seekable.end(video.seekable.length - 1) - 0.5;
    } else {
      video.currentTime = video.duration;
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
      className="relative w-full h-full bg-[#050505] flex items-center justify-center group overflow-hidden select-none"
    >
      {/* HTML5 Video Element (without native controls to allow customized overlays) */}
      <video
        ref={videoRef}
        onClick={() => togglePlay()}
        onDoubleClick={() => toggleFullscreen()}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        autoPlay
      />

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
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/95 text-white gap-3">
          <span className="text-netflix-red font-bold uppercase tracking-wider text-xs md:text-sm">Playback Error</span>
          <p className="text-zinc-400 text-[10px] md:text-xs max-w-md">{error}</p>
        </div>
      )}

      {/* CUSTOM PREMIUM CONTROLS BAR (Overlay) */}
      {!loading && !error && (
        <div
          className={`absolute inset-x-0 bottom-0 z-10 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-3 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bottom control row */}
          <div className="flex items-center justify-between w-full">
            
            {/* Left Controls: Play/Pause and Volume */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-netflix-red transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
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
                    
                    <span className={`text-[10px] md:text-xs font-black tracking-widest uppercase transition-colors duration-300 ${
                      isLive ? 'text-white' : 'text-amber-500'
                    }`}>
                      {isLive ? 'LIVE' : `LIVE -${
                        displayDelay < 60
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

            {/* Right Controls: PiP and Fullscreen buttons */}
            <div className="flex items-center gap-3">
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
