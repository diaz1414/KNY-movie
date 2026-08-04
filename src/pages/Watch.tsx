import React, { useEffect, useMemo, useRef, useState } from 'react';

const Watch: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const watchSrc = useMemo(() => {
    return `/watch.html${window.location.search}${window.location.hash}`;
  }, [reloadKey]);

  useEffect(() => {
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
  }, [isLoaded, reloadKey]);

  useEffect(() => {
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
  }, []);

  const retry = () => {
    setIsLoaded(false);
    setIsSlow(false);
    setReloadKey((key) => key + 1);
  };

  return (
    <main className="fixed inset-0 z-[9999] bg-black text-white">
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
