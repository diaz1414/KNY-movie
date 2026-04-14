import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

const OfflineOverlay: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[20000] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 font-outfit select-none"
        >
          <div className="flex flex-col items-center text-center max-w-sm">
            {/* Animated Icon Container */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-red-600 blur-3xl opacity-30 animate-pulse rounded-full" />
              <div className="relative w-24 h-24 bg-red-900/40 border border-red-500/50 rounded-3xl flex items-center justify-center shadow-2xl">
                <WifiOff size={48} className="text-red-500" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
              Connection Lost
            </h2>
            <p className="text-[var(--text-secondary)] text-lg font-medium leading-relaxed mb-8">
              Oops! It looks like you've been disconnected. Please check your internet settings to continue streaming.
            </p>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border-4 border-red-600/20 border-t-red-600"
            />
          </div>

          {/* Background Glitch Effects */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
             {[...Array(5)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "linear" }}
                 className="h-[1px] w-full bg-red-600/30 my-32 rotate-12"
               />
             ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineOverlay;
