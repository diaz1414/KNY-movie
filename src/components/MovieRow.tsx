import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import type { UnifiedMovie } from '../services/api';

interface MovieRowProps {
  title: string;
  movies: UnifiedMovie[];
  onMovieClick: (id: string) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, onMovieClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="movie-row-container relative group">
      <h2 className="movie-row-title">{title}</h2>
      
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 flex items-center"
          style={{ border: 'none', cursor: 'pointer', color: '#fff' }}
        >
          <ChevronLeft size={40} />
        </button>

        <div 
          ref={rowRef}
          className="premium-scroll"
          style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            overflowX: 'auto', 
            padding: '1rem 4%',
            scrollBehavior: 'smooth'
          }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 flex items-center"
          style={{ border: 'none', cursor: 'pointer', color: '#fff' }}
        >
          <ChevronRight size={40} />
        </button>
      </div>

      <style>{`
        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .z-10 { z-index: 10; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default MovieRow;
