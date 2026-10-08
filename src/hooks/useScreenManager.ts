import { useEffect } from 'react';

/**
 * useScreenManager:
 * 1. Automatically locks screen orientation to landscape when entering fullscreen
 *    on mobile web, and unlocks back to normal when exiting fullscreen.
 * 2. Manages Screen Wake Lock API to prevent mobile/desktop screens from sleeping
 *    during active user sessions and video streaming.
 */
export const useScreenManager = () => {
  useEffect(() => {
    // --- 1. FULLSCREEN AUTO-ROTATE TO LANDSCAPE ---
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      const orientation = (
        screen.orientation ||
        (screen as any).mozOrientation ||
        (screen as any).msOrientation
      ) as any;

      if (isFullscreen) {
        if ((window as any).AndroidApp?.lockLandscape) {
          (window as any).AndroidApp.lockLandscape();
        } else if (orientation && typeof orientation.lock === 'function') {
          orientation.lock('landscape').catch(() => {
            // Silently handled: some browsers or devices may restrict orientation lock
          });
        }
      } else {
        if ((window as any).AndroidApp?.unlockOrientation) {
          (window as any).AndroidApp.unlockOrientation();
        } else if (orientation && typeof orientation.unlock === 'function') {
          try {
            orientation.unlock();
          } catch (e) {
            // Silently handled
          }
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // --- 2. SCREEN WAKE LOCK API (KEEP SCREEN ALWAYS ON) ---
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && typeof (navigator as any).wakeLock?.request === 'function') {
        try {
          if (!wakeLockSentinel || wakeLockSentinel.released) {
            wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
          }
        } catch (e) {
          // Silently handled: browser may reject if tab is backgrounded or battery saver is active
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (wakeLockSentinel) {
        try {
          wakeLockSentinel.release();
        } catch (e) {
          // Silently handled
        }
        wakeLockSentinel = null;
      }
    };
  }, []);
};
