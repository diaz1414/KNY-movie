import React, { useEffect, useState, useRef } from 'react';

const NetflixIntro: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
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
        } catch (err) {
          console.warn("Autoplay blocked. User interaction required.");
        }
      };

      const handleInteraction = async () => {
        if (audioObj.current) {
          try {
            await audioObj.current.play();
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
