import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Clock } from 'lucide-react';
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
  }, [movieId, i18n.language]);

  if (!movieId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-y-auto relative no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors backdrop-blur-md text-white border border-white/10 cursor-pointer"
          >
            <X size={24} />
          </button>

          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : movie ? (
            <div className="flex flex-col">
              {/* Desktop Header Backdrop */}
              <div className="relative w-full aspect-[21/9] hidden md:block">
                 <img src={movie.backdrop} className="w-full h-full object-cover brightness-50" alt={movie.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent" />
                 <div className="absolute bottom-8 left-10">
                    <h2 className="text-5xl font-black font-outfit mb-2">{movie.title}</h2>
                    <div className="flex items-center gap-4 text-yellow-400 font-bold">
                       <Star fill="currentColor" size={20} />
                       <span className="text-2xl">{movie.rating}</span>
                    </div>
                 </div>
              </div>

              {/* Player and Controls */}
              <div className="p-6 md:p-10 space-y-8">
                {movie.streamSources && movie.streamSources.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {movie.streamSources.map((source, index) => (
                        <button
                          key={index}
                          onClick={() => setStreamUrl(source.url)}
                          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border shrink-0 cursor-pointer ${
                            streamUrl === source.url 
                            ? 'bg-netflix-red border-netflix-red text-white shadow-lg shadow-red-600/20' 
                            : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10'
                          }`}
                        >
                          {source.name}
                        </button>
                      ))}
                    </div>
                    
                    {/* Tips */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col gap-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex gap-3">
                        <span className="text-netflix-red font-bold shrink-0">💡 Tips:</span>
                        <p>Jika video macet, klik sekali di dalam player untuk menutup iklan rahasia, lalu klik play lagi.</p>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-netflix-red font-bold shrink-0">🇮🇩 Subtitle:</span>
                        <p>Klik ikon <b>CC</b> di pojok kanan bawah player untuk menyalakan Bahasa Indonesia.</p>
                      </div>
                    </div>

                    {streamUrl && (
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 group/player">
                        <iframe
                          src={streamUrl}
                          className="w-full h-full"
                          allowFullScreen
                          title={movie.title}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Info Text */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-6 text-sm text-[var(--text-muted)] font-medium">
                      <div className="flex items-center gap-2"><Calendar size={18} /> {movie.releaseDate}</div>
                      <div className="flex items-center gap-2"><Clock size={18} /> {movie.duration}</div>
                      <div className="flex items-center gap-2 font-bold text-netflix-red uppercase tracking-wider">{movie.type}</div>
                    </div>

                    <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
                      {movie.synopsis}
                    </p>

                    <div className="flex flex-wrap gap-2">
                       {movie.genres.map(g => (
                         <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[var(--text-muted)]">{g}</span>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[3px] text-netflix-red font-black mb-2">Director</h4>
                      <p className="text-lg font-bold">{movie.director}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[3px] text-netflix-red font-black mb-2">Top Cast</h4>
                      <div className="flex flex-col gap-2">
                        {movie.cast.map(c => (
                          <p key={c} className="text-[var(--text-secondary)] font-medium">• {c}</p>
                        ))}
                      </div>
                    </div>
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
