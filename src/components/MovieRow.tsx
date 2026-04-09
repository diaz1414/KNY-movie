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
    <div id={id} className="relative group/row py-4 scroll-mt-24">
      <h2 className="text-xl md:text-2xl font-bold mb-6 px-[var(--container-padding)] font-outfit text-[var(--text-primary)]">
        {title}
      </h2>
      
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 hidden md:flex items-center justify-center w-12 bg-black/60 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80 text-netflix-red cursor-pointer"
        >
          <ChevronLeft size={44} strokeWidth={3} />
        </button>

        <div 
          ref={rowRef}
          className="premium-scroll flex gap-6 overflow-x-auto px-[var(--container-padding)] pb-4 scroll-smooth no-scrollbar"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 hidden md:flex items-center justify-center w-12 bg-black/60 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80 text-netflix-red cursor-pointer"
        >
          <ChevronRight size={44} strokeWidth={3} />
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
