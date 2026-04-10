import React, { useEffect, useState, useRef } from 'react';

const NetflixIntro: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if the intro has already been shown in this session
    const hasShownIntro = sessionStorage.getItem('hasShownIntro');
    
    if (!hasShownIntro) {
      setIsVisible(true);
      
      // Attempt to play sound
      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.volume = 0.6;
          audioRef.current.play().catch(err => {
            console.log("Autoplay blocked, waiting for interaction", err);
          });
        }
      };

      // Play as soon as mounted
      setTimeout(playAudio, 100);

      // Hide the intro after the animation and audio tail completes (approx 4.5 seconds)
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Mark as shown so it doesn't appear again on refresh
        sessionStorage.setItem('hasShownIntro', 'true');
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden cursor-pointer animate-netflix-container"
      onClick={() => audioRef.current?.play()}
    >
      <audio ref={audioRef} src="/intro.mp3" preload="auto" />
      
      <div className="relative flex flex-col items-center z-50">
        {/* The Big YKN Logo */}
        <h1 
          className="font-outfit font-black text-8xl md:text-9xl tracking-tighter animate-netflix-logo mb-2 select-none"
          style={{ 
            color: '#E50914', 
            textShadow: '0 0 40px rgba(229, 9, 20, 0.9), 0 0 80px rgba(229, 9, 20, 0.4)' 
          }}
        >
          YKN
        </h1>
        
        {/* The Subtext */}
        <p 
          className="font-outfit font-bold text-sm md:text-lg tracking-[0.8em] uppercase animate-netflix-text select-none text-white/70"
          style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.2)' }}
        >
          Yuk Kita Nonton
        </p>
      </div>

      {/* Cinematic Flash Overlay */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none animate-netflix-flash" />

      <style>{`
        @keyframes netflix-logo {
          0% {
            transform: scale(0.6);
            filter: blur(20px);
            opacity: 0;
            letter-spacing: 12px;
          }
          10% {
            opacity: 1;
            filter: blur(0);
          }
          20% {
            transform: scale(1);
            filter: blur(0);
            letter-spacing: normal;
          }
          85% {
            transform: scale(1.1);
            opacity: 1;
            filter: blur(0);
          }
          100% {
            transform: scale(40);
            filter: blur(60px);
            opacity: 0;
          }
        }

        @keyframes netflix-text {
          0%, 15% {
            opacity: 0;
            transform: translateY(15px);
            filter: blur(5px);
          }
          35% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(2);
            filter: blur(20px);
          }
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

        .animate-netflix-logo {
          animation: netflix-logo 4.5s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }

        .animate-netflix-text {
          animation: netflix-text 4.5s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }

        .animate-netflix-flash {
          animation: netflix-flash 4.5s ease-out forwards;
        }

        .animate-netflix-container {
          animation: netflix-container-fade 4.8s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NetflixIntro;
