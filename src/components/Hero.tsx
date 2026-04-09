import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import type { UnifiedMovie } from '../services/api';

interface HeroProps {
  movie?: UnifiedMovie;
  onWatch: (id: string) => void;
}

const Hero: React.FC<HeroProps> = ({ movie, onWatch }) => {
  const { t } = useTranslation();

  if (!movie) return <div style={{ height: '80vh', background: 'var(--bg-secondary)' }} />;

  return (
    <div style={{ 
      position: 'relative', 
      height: '90vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 var(--container-padding)',
      overflow: 'hidden'
    }}>
      {/* Background Image with Gradients */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: -1
      }}>
        <img 
          src={movie.backdrop} 
          alt={movie.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 50%), linear-gradient(to right, var(--bg-primary) 0%, transparent 100%)' 
        }} />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 1 }}
      >
        <motion.h1 
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1, letterSpacing: '-2px' }}
        >
          {movie.title}
        </motion.h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <span style={{ border: '1px solid var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
            {movie.quality}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFD700' }}>
            Rating: {movie.rating}
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }} className="md-block hidden">
          Experience the epic journey and captivating story of {movie.title}. Now streaming on KNY.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onWatch(movie.id)}
            style={{ 
              background: '#fff', 
              color: '#000', 
              padding: '0.8rem clamp(1.5rem, 4vw, 2.5rem)', 
              borderRadius: '8px', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}
          >
            <Play fill="#000" size={20} />
            {t('watch_now')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass"
            style={{ 
              color: '#fff', 
              padding: '0.8rem 2.5rem', 
              borderRadius: '8px', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <Info size={20} />
            {t('more_info')}
          </motion.button>
        </div>
      </motion.div>
      <style>{`
        @media (max-width: 768px) {
          .md-block { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Hero;
