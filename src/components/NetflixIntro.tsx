import React, { useEffect, useState, useRef } from 'react';

const NetflixIntro: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const audioObj = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const hasShownIntro = sessionStorage.getItem('hasShownIntro');
    
    if (!hasShownIntro) {
      setIsVisible(true);
      
      const audioUrl = `${window.location.origin}/intro.mp3`;
      audioObj.current = new Audio(audioUrl);
      audioObj.current.volume = 0.8;
      audioObj.current.preload = 'auto';

      const tryPlay = async () => {
        if (!audioObj.current) return;
        try {
          await audioObj.current.play();
          setIsAudioBlocked(false);
        } catch (err) {
          console.warn("Autoplay blocked. User interaction required.");
          setIsAudioBlocked(true);
        }
      };

      const handleInteraction = async () => {
        if (audioObj.current) {
          try {
            await audioObj.current.play();
            setIsAudioBlocked(false);
            cleanupListeners();
          } catch (e) {
            console.error("Interaction play failed:", e);
          }
        }
      };

      const cleanupListeners = () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('mousedown', handleInteraction);
      };

      window.addEventListener('click', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
      window.addEventListener('keydown', handleInteraction);
      window.addEventListener('mousedown', handleInteraction);

      setTimeout(tryPlay, 100);

      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('hasShownIntro', 'true');
        cleanupListeners();
        if (audioObj.current) {
          audioObj.current.pause();
          audioObj.current = null;
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
        cleanupListeners();
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden cursor-pointer"
    >
      <div className="relative flex flex-col items-center z-50">
        <h1 
          className="font-outfit font-black text-8xl md:text-9xl tracking-tighter animate-netflix-logo mb-2 select-none"
          style={{ 
            color: '#E50914', 
            textShadow: '0 0 40px rgba(229, 9, 20, 0.9), 0 0 80px rgba(229, 9, 20, 0.4)' 
          }}
        >
          YKN
        </h1>
        
        <p 
          className="font-outfit font-bold text-sm md:text-lg tracking-[0.8em] uppercase animate-netflix-text select-none text-white/70"
          style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.2)' }}
        >
          Yuk Kita Nonton
        </p>

        {isAudioBlocked && (
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center animate-bounce">
               <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
               </svg>
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">
              Click to Unmute
            </p>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-white/5 pointer-events-none animate-netflix-flash" />

      <style>{`
        @keyframes netflix-logo {
          0% { transform: scale(0.6); filter: blur(20px); opacity: 0; letter-spacing: 12px; }
          10% { opacity: 1; filter: blur(0); }
          20% { transform: scale(1); filter: blur(0); letter-spacing: normal; }
          85% { transform: scale(1.1); opacity: 1; filter: blur(0); }
          100% { transform: scale(40); filter: blur(60px); opacity: 0; }
        }

        @keyframes netflix-text {
          0%, 15% { opacity: 0; transform: translateY(15px); filter: blur(5px); }
          35% { opacity: 1; transform: translateY(0); filter: blur(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: scale(2); filter: blur(20px); }
        }

        @keyframes netflix-flash {
          0%, 12% { opacity: 0; }
          15% { opacity: 1; }
          22% { opacity: 0; }
          100% { opacity: 0; }
        }

        @keyframes netflix-container-fade {
          0% { background: #000000; visibility: visible; }
          90% { background: #000000; opacity: 1; }
          100% { background: transparent; opacity: 0; visibility: hidden; }
        }

        .animate-netflix-logo { animation: netflix-logo 5s cubic-bezier(0.7, 0, 0.3, 1) forwards; }
        .animate-netflix-text { animation: netflix-text 5s cubic-bezier(0.7, 0, 0.3, 1) forwards; }
        .animate-netflix-flash { animation: netflix-flash 5s ease-out forwards; }
        .animate-netflix-container { animation: netflix-container-fade 5.4s ease-in-out forwards; }
      `}</style>
    </div>
  );
};

export default NetflixIntro;
