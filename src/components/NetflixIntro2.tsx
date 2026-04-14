import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NetflixIntro2: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ta-dum sound
    audioRef.current = new Audio('/intro.mp3');
    audioRef.current.volume = 0.7;
    audioRef.current.play().catch(e => console.warn("Intro 2 sound blocked:", e));

    // The sequence logic: 
    // 0s: Start
    // 3.5s: Start final zoom-out
    // 4.2s: Complete
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); 
    }, 3800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden font-outfit"
        >
          {/* 1. INITIAL VERTICAL LINE REVEAL */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, times: [0, 0.5, 1], ease: "easeOut" }}
            className="absolute w-1 h-32 bg-red-600 z-[101]"
          />

          {/* 2. CINEMATIC RIBBONS (Zooming past camera) */}
          <div className="absolute inset-0 pointer-events-none" style={{ perspective: '1000px' }}>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ z: -500, opacity: 0 }}
                animate={{ 
                  z: [ -500, 1000 ], 
                  opacity: [ 0, 0.3, 0 ] 
                }}
                transition={{ 
                  duration: 2 + Math.random(), 
                  delay: 0.5 + (i * 0.1),
                  ease: "circIn",
                  repeat: Infinity,
                  repeatDelay: Math.random()
                }}
                className="absolute w-[2px] h-full bg-red-600/40 blur-sm"
                style={{ 
                  left: (Math.random() * 100) + '%',
                  transformOrigin: 'center'
                }}
              />
            ))}
          </div>

          {/* 3. MAIN LOGO ANIMATION */}
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
              animate={{ 
                scale: [0.5, 1.1, 1, 30], // Majestic zoom at the end
                opacity: [0, 1, 1, 0],
                filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(5px)']
              }}
              transition={{ 
                duration: 4, 
                times: [0, 0.2, 0.8, 1],
                ease: [0.7, 0, 0.3, 1] 
              }}
              className="relative"
            >
              <h1 
                className="text-8xl md:text-9xl font-black text-[#E50914] tracking-tighter"
                style={{ 
                  textShadow: '0 0 40px rgba(229, 9, 20, 0.6)',
                  WebkitTextStroke: '1px rgba(255,255,255,0.1)'
                }}
              >
                YKN
              </h1>

              {/* Shimmer Effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                animate={{ translateX: ["-100%", "200%"] }}
                transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
              />
            </motion.div>

            {/* 4. TAGLINE REVEAL */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 0], y: [20, 0, -10] }}
              transition={{ 
                delay: 1.5, 
                duration: 2,
                times: [0, 0.5, 1] 
              }}
              className="mt-6 text-white/40 font-bold uppercase tracking-[0.8em] text-xs md:text-sm"
            >
              Yuk Kita Nonton
            </motion.p>
          </div>

          {/* 5. DYNAMIC GLOW PULSE */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.2)_0%,black_80%)] pointer-events-none"
          />

          {/* Film Grain for texture */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetflixIntro2;
