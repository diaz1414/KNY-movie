import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import type { UnifiedMovie } from '../services/api';

interface MovieRowProps {
  id?: string;
  title: string;
  movies: UnifiedMovie[];
}

const MovieRow: React.FC<MovieRowProps> = ({ id, title, movies }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div id={id} className="relative group/row py-6 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6 px-[var(--container-padding)]">
        <div className="w-1.5 h-6 bg-netflix-red rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)]" />
        <h2 className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight uppercase">
          {title}
        </h2>
      </div>
      
      <div className="relative px-0">
        <button
          onClick={() => scroll('left')}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#111111]/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-netflix-red hover:border-netflix-red hover:scale-110 opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <div 
          ref={rowRef}
          className="premium-scroll flex gap-6 overflow-x-auto px-[var(--container-padding)] pb-4 scroll-smooth no-scrollbar"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} inRow />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#111111]/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-netflix-red hover:border-netflix-red hover:scale-110 opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MovieRow;
