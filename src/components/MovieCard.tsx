import React from 'react';
import { motion } from 'framer-motion';
import { Star, Play } from 'lucide-react';
import type { UnifiedMovie } from '../services/api';

interface MovieCardProps {
  movie: UnifiedMovie;
  onClick: (id: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={{
        position: 'relative',
        minWidth: 'var(--card-width)',
        width: 'var(--card-width)',
        height: 'var(--card-height)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: 'var(--card-shadow)',
        background: 'var(--bg-tertiary)'
      }}
      onClick={() => onClick(movie.id)}
      className="group"
    >
      <img
        src={movie.poster}
        alt={movie.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      
      {/* Overlay */}
      <div 
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1rem',
          gap: '0.5rem'
        }}
      >
        <h4 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{movie.title}</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#FFD700' }}>
            <Star size={12} fill="#FFD700" />
            <span>{movie.rating}</span>
          </div>
          <span style={{ 
            fontSize: '0.7rem', 
            background: 'var(--accent-primary)', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            color: '#fff' 
          }}>
            {movie.quality}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          style={{
            marginTop: '0.5rem',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Play size={16} fill="currentColor" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MovieCard;
