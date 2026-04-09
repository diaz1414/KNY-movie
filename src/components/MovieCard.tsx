import React from 'react';
import { motion } from 'framer-motion';
import { Star, Play } from 'lucide-react';
import type { UnifiedMovie } from '../services/api';

const MovieCard: React.FC<{ movie: UnifiedMovie }> = ({ movie }) => {
  const handleClick = () => {
    window.location.href = `/watch?id=${movie.id}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -8 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      className="relative group shrink-0 cursor-pointer rounded-xl overflow-hidden shadow-2xl bg-[var(--bg-tertiary)]"
      style={{
        width: 'var(--card-width)',
        height: 'var(--card-height)',
      }}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-300 hidden md:flex flex-col justify-end p-5 gap-3">
        <h4 className="text-white text-base font-bold leading-tight font-outfit drop-shadow-md">
          {movie.title}
        </h4>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
            <Star size={14} fill="currentColor" />
            <span>{movie.rating}</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-netflix-red text-white px-2 py-0.5 rounded-sm tracking-widest shadow-lg">
            {movie.quality}
          </span>
        </div>
        
        <div className="flex items-center gap-2 pt-1">
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
