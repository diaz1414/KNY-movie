import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetflixIntro2 from './NetflixIntro2';

const NetflixIntro: React.FC = () => {
  const [phase, setPhase] = useState<'popup' | 'intro1' | 'intro2' | 'none'>('none');
  const [isSkipVisible, setIsSkipVisible] = useState(false);
  const introAudioObj = useRef<HTMLAudioElement | null>(null);
  const clickAudioObj = useRef<HTMLAudioElement | null>(null);
  const introTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Storage Keys
  const STORAGE_KEY_FIRST_TIME = 'KNY_INTRO_FIRST_TIME_DONE_V1';
  const STORAGE_KEY_SESSION = 'KNY_INTRO_SESSION_SHOWN_V1';

  useEffect(() => {
    // Check if we already showed an intro in THIS browser session (tab)
    // If yes, we don't show anything (handles Refresh)
    const hasShownInSession = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (hasShownInSession) {
      setPhase('none');
      return;
    }

    // Check if it's the absolute first time
    const hasSeenFirstTime = localStorage.getItem(STORAGE_KEY_FIRST_TIME);

    if (!hasSeenFirstTime) {
      // First time ever -> Show the full cinematic sequence (Intro 1)
      setPhase('popup');
      
      clickAudioObj.current = new Audio('https://www.soundjay.com/buttons/button-16.mp3');
      clickAudioObj.current.volume = 0.5;

      introAudioObj.current = new Audio(`${window.location.origin}/Tabir_Terbuka.mp3`);
      introAudioObj.current.volume = 0.8;
      introAudioObj.current.preload = 'auto';
    } else {
      // Returning user -> Show the snappy Netflix intro (Intro 2)
      setPhase('intro2');
    }
  }, []);

  const handleStartIntro1 = async () => {
    if (clickAudioObj.current) {
      clickAudioObj.current.play().catch(e => console.warn("Click audio blocked:", e));
    }

    setPhase('intro1');

    if (introAudioObj.current) {
      try {
        await introAudioObj.current.play();
      } catch (err) {
        console.warn("Intro audio play failed:", err);
      }
    }

    // Show skip button after 2 seconds
    setTimeout(() => setIsSkipVisible(true), 2000);

    // Auto-hide when the intro finishes (approx 29.5s)
    introTimeout.current = setTimeout(() => {
      completeIntro1();
    }, 29500);
  };

  const completeIntro1 = () => {
    localStorage.setItem(STORAGE_KEY_FIRST_TIME, 'true');
    sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
    setPhase('none');
  };

  const handleSkip = () => {
    if (introAudioObj.current) {
      introAudioObj.current.pause();
      introAudioObj.current.currentTime = 0;
    }
    if (introTimeout.current) {
      clearTimeout(introTimeout.current);
    }
    completeIntro1();
  };

  const completeIntro2 = () => {
    sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
    setPhase('none');
  };

  if (phase === 'none') return null;

  if (phase === 'intro2') {
    return <NetflixIntro2 onComplete={completeIntro2} />;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-black overflow-hidden select-none font-outfit">
        {/* PHASE 1: ENTRANCE POPUP */}
        {phase === 'popup' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.1)_0%,rgba(0,0,0,1)_80%)]"
          >
            <div className="relative flex flex-col items-center gap-8 max-w-md text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="space-y-2"
              >
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                  WELCOME TO <span className="text-red-600">YKN</span>
                </h2>
                <p className="text-white/40 text-sm md:text-base font-medium tracking-widest uppercase">
                  Enable sound for the best experience
                </p>
              </motion.div>

              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <button
                  onClick={handleStartIntro1}
                  className="relative flex items-center justify-center gap-4 px-10 py-4 bg-black rounded-full border border-white/10 text-white text-lg font-bold tracking-widest transition-all duration-300"
                >
                  GO TO YKN MOVIES
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: LONG CINEMATIC INTRO */}
        {phase === 'intro1' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-20" style={{ perspective: '500px' }}>
                <div
                  className="absolute inset-0 animate-grid-move"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(229,9,20,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(229,9,20,0.2) 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                    transform: 'rotateX(60deg) translateY(0)',
                    transformOrigin: 'top'
                  }}
                />
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)] z-10" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-600/30 blur-md animate-sweep-horizontal z-0" />
              <div className="absolute top-0 left-1/2 w-[2px] h-full bg-red-600/20 blur-xl animate-sweep-vertical z-0" />

              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-red-600/10 blur-2xl animate-float-particles"
                  style={{
                    width: Math.random() * 150 + 100 + 'px',
                    height: Math.random() * 150 + 100 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    animationDelay: (Math.random() * 10) + 's',
                    animationDuration: (Math.random() * 15 + 15) + 's'
                  }}
                />
              ))}
            </div>

            <div className="relative flex flex-col items-center z-50">
              <div className="relative group">
                <motion.h1
                  className="font-black text-8xl md:text-9xl tracking-tighter text-[#E50914] animate-netflix-logo mb-2 relative overflow-hidden"
                  style={{ textShadow: '0 0 20px rgba(229, 9, 20, 0.4)' }}
                >
                  YKN
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                </motion.h1>
              </div>

              <motion.p
                className="font-bold text-sm md:text-lg tracking-[0.8em] uppercase text-white/50 animate-netflix-text"
                style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}
              >
                Yuk Kita Nonton
              </motion.p>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden z-[100]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 29, ease: "linear" }}
                className="h-full bg-red-600 shadow-[0_0_15px_rgba(229,9,20,1)]"
              />
            </div>

            <AnimatePresence>
              {isSkipVisible && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.8)' }}
                  onClick={handleSkip}
                  className="absolute bottom-12 right-8 md:right-12 px-8 py-3 bg-black/60 backdrop-blur-xl border border-white/10 hover:border-red-600/40 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all group z-[100] rounded-sm"
                >
                  <span className="flex items-center gap-4">
                    Skip Intro
                    <div className="w-2 h-2 rounded-full bg-red-600 group-hover:animate-ping" />
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-white/5 pointer-events-none animate-netflix-flash" />
          </motion.div>
        )}

        <style>{`
          @keyframes netflix-logo {
            0% { transform: scale(0.5); opacity: 0; letter-spacing: 30px; }
            4% { opacity: 1; filter: blur(0); transform: scale(1); letter-spacing: normal; }
            10% { transform: scale(1); filter: blur(0); }
            85% { transform: scale(1.05); opacity: 1; filter: blur(0); }
            92% { transform: scale(1.2); opacity: 1; filter: blur(0); }
            100% { transform: scale(100); opacity: 0; }
          }
          @keyframes netflix-text {
            0%, 6% { opacity: 0; transform: translateY(30px); filter: blur(15px); }
            15% { opacity: 1; transform: translateY(0); filter: blur(0); }
            80% { opacity: 1; transform: translateY(0); }
            90% { opacity: 0; transform: translateY(-20px) scale(0.8); filter: blur(10px); }
            100% { opacity: 0; }
          }
          @keyframes netflix-flash {
            0%, 4% { opacity: 0; }
            5% { opacity: 1; }
            12% { opacity: 0; }
            88% { opacity: 0; }
            92% { opacity: 0.8; }
            100% { opacity: 0; }
          }
          @keyframes sweep-horizontal {
            0% { transform: translateY(-50vh); opacity: 0; }
            20%, 80% { opacity: 1; }
            100% { transform: translateY(50vh); opacity: 0; }
          }
          @keyframes sweep-vertical {
            0% { transform: translateX(-50vw); opacity: 0; }
            20%, 80% { opacity: 1; }
            100% { transform: translateX(50vw); opacity: 0; }
          }
          @keyframes float-particles {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            20% { opacity: 0.15; }
            80% { opacity: 0.15; }
          }
          @keyframes grid-move {
            0% { transform: rotateX(60deg) translateY(0); }
            100% { transform: rotateX(60deg) translateY(100px); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .animate-netflix-logo { animation: netflix-logo 29s cubic-bezier(0.7, 0, 0.3, 1) forwards; }
          .animate-netflix-text { animation: netflix-text 29s cubic-bezier(0.7, 0, 0.3, 1) forwards; }
          .animate-netflix-flash { animation: netflix-flash 29s ease-out forwards; }
          .animate-sweep-horizontal { animation: sweep-horizontal 12s ease-in-out infinite; }
          .animate-sweep-vertical { animation: sweep-vertical 18s ease-in-out infinite; }
          .animate-float-particles { animation: float-particles 15s ease-in-out infinite; }
          .animate-grid-move { animation: grid-move 4s linear infinite; }
          .animate-shimmer { animation: shimmer 5s infinite linear; animation-delay: 5s; }
        `}</style>
      </div>
    </AnimatePresence>
  );
};

export default NetflixIntro;
