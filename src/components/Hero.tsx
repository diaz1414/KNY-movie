import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import type { UnifiedMovie } from '../services/api';

const Hero: React.FC<{ movie?: UnifiedMovie }> = ({ movie }) => {
  const { t } = useTranslation();

  const handleWatch = () => {
    if (movie) {
      window.location.href = `/watch?id=${movie.id}`;
    }
  };

  if (!movie) return <div className="h-[80vh] w-full bg-[var(--bg-secondary)] rounded-3xl animate-pulse" />;

  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full flex items-center px-[var(--container-padding)] overflow-hidden rounded-3xl group bg-black">
      {/* Background Image with Gradients */}
      <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover brightness-[0.7] opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl flex flex-col gap-6 z-10"
      >
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold font-outfit leading-tight tracking-tight text-[var(--text-primary)]"
        >
          {movie.title}
        </motion.h1>

        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="border border-white/20 px-3 py-1 rounded-md text-xs backdrop-blur-sm text-[var(--text-secondary)]">
            {movie.quality}
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400">
            <Play fill="currentColor" size={14} className="rotate-0" />
            Rating: {movie.rating}
          </span>
        </div>

        <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none max-w-xl">
          Experience the epic journey and captivating story of {movie.title}. Now streaming on YKN with high definition quality and immersive sound.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWatch}
            className="bg-white text-black px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
          >
            <Play fill="currentColor" size={20} />
            {t('watch_now')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass text-[var(--text-primary)] px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Info size={20} />
            {t('more_info')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
