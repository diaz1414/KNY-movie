import React from 'react';
import { motion } from 'framer-motion';
import { Star, Play } from 'lucide-react';
import type { UnifiedMovie } from '../services/api';

const MovieCard: React.FC<{ movie: UnifiedMovie; inRow?: boolean }> = ({ movie, inRow = false }) => {
  const handleClick = () => {
    window.location.href = `/watch.html?id=${movie.id}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -6 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', damping: 18, stiffness: 220 }}
      className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl bg-[var(--bg-tertiary)] border border-white/5 transition-all duration-300 ${
        inRow 
          ? 'w-[var(--card-width)] h-[var(--card-height)] shrink-0' 
          : 'w-full aspect-[2/3]'
      }`}
      onClick={handleClick}
    >
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />

      {/* Mobile Title View (Always visible on mobile) */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:hidden">
        <h4 className="text-white text-xs font-bold leading-tight line-clamp-2 drop-shadow-lg">
          {movie.title}
        </h4>
        <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-[10px] mt-1">
          <Star size={10} fill="currentColor" />
          <span>{movie.rating}</span>
        </div>
      </div>

      {/* Desktop Hover Overlay (Hidden on mobile via group-hover logic) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-500 hidden md:flex flex-col justify-end p-5 gap-3">
        <h4 className="text-white text-base font-black leading-tight font-outfit drop-shadow-md transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
          {movie.title}
        </h4>

        <div className="flex justify-between items-center transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out delay-75">
          <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
            <Star size={14} fill="currentColor" />
            <span>{movie.rating}</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-netflix-red text-white px-2 py-0.5 rounded-sm tracking-widest shadow-lg">
            {movie.quality}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out delay-150">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shadow-lg">
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">{movie.type}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
