import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Clock, Film } from 'lucide-react';
import { movieService } from '../services/api';
import type { UnifiedMovieDetail as MovieDetailType } from '../services/api';
interface MovieDetailProps {
  movieId: string | null;
  onClose: () => void;
}

const MovieDetail: React.FC<MovieDetailProps> = ({ movieId, onClose }) => {
  const { i18n } = useTranslation();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    if (movieId) {
      setLoading(true);
      movieService.getMovieDetail(movieId, i18n.language).then((detail) => {
        if (detail) {
          setMovie(detail);
          setStreamUrl(detail.streamSources?.[0]?.url || null);
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [movieId]);

  if (!movieId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(0.5rem, 5vw, 2rem)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass premium-scroll"
          style={{
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            borderRadius: '24px',
            overflowY: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              top: '1.5rem', 
              right: '1.5rem', 
              zIndex: 10,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              padding: '8px',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <X size={24} />
          </button>

          {loading ? (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : movie ? (
            <div>
              {movie.streamSources && movie.streamSources.length > 0 && (
                <div style={{ padding: '0 2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {movie.streamSources.map((source, index) => (
                      <button
                        key={index}
                        onClick={() => setStreamUrl(source.url)}
                        className={streamUrl === source.url ? 'glass' : ''}
                        style={{
                          padding: '0.5rem 1.5rem',
                          borderRadius: '30px',
                          border: streamUrl === source.url ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                          background: streamUrl === source.url ? 'rgba(255,255,255,0.1)' : 'transparent',
                          color: streamUrl === source.url ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {source.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Tips for users */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-primary)' }}>💡 Tips:</span>
                      <span>Jika "terkunci" atau tidak berputar, klik sekali di player untuk membuka (mungkin ada iklan muncul sekali), lalu tutup iklannya dan klik play lagi.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-primary)' }}>🇮🇩 Subtitle:</span>
                      <span>Klik ikon <b>CC</b> atau roda gigi di dalam player untuk mengaktifkan <b>Subtitle Indonesia</b>. Jika tidak ada, coba ganti Server lain di atas.</span>
                    </div>
                  </div>
                </div>
              )}

              {streamUrl && (
                <div 
                  className="glass"
                  style={{ 
                    width: 'calc(100% - 4rem)', 
                    margin: '0 2rem',
                    aspectRatio: '16/9', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    background: '#000',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <iframe
                    src={streamUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                    title="Movie Player"
                  />
                </div>
              )}

              {/* Info Section */}
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ fontSize: '2rem' }}>{movie.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFD700' }}>
                    <Star fill="#FFD700" size={20} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{movie.rating}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {movie.releaseDate}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {movie.duration}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Film size={16} /> {movie.genres.join(', ')}</div>
                </div>

                <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                  {movie.synopsis}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Director</div>
                  <div style={{ fontSize: '1rem' }}>{movie.director}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Cast</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {movie.cast.map(c => (
                      <span key={c} className="glass" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieDetail;
