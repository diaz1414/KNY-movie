import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { movieService } from '../services/api';
import type { UnifiedMovieDetail as MovieDetailType } from '../services/api';

interface MovieDetailProps {
  movieId: string | null;
  onClose: () => void;
}

const MovieDetail: React.FC<MovieDetailProps> = ({ movieId, onClose }) => {
  const { i18n, t } = useTranslation();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="max-w-7xl mx-auto px-[var(--container-padding)] fade-in">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-wider text-sm">{t('back_to_home')}</span>
      </button>

      <div className="flex flex-col space-y-12 pb-20">
        {/* Header Backdrop */}
        <div className="relative w-full aspect-[21/7] rounded-3xl overflow-hidden hidden md:block group">
          <img src={movie.backdrop} className="w-full h-full object-cover brightness-50" alt={movie.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
          <div className="absolute bottom-8 left-10">
            <h2 className="text-5xl font-black font-outfit mb-2">{movie.title}</h2>
            <div className="flex items-center gap-4 text-yellow-400 font-bold">
              <Star fill="currentColor" size={24} />
              <span className="text-3xl">{movie.rating}</span>
            </div>
          </div>
        </div>

        {/* Player Section */}
        <div className="space-y-8">
          {movie.streamSources && movie.streamSources.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {movie.streamSources.map((source, index) => (
                  <button
                    key={index}
                    onClick={() => setStreamUrl(source.url)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${streamUrl === source.url
                      ? 'bg-netflix-red border-netflix-red text-white shadow-lg shadow-red-600/20'
                      : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10'
                      }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>

              {/* Tips Container */}
              <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--glass-border)] flex flex-col md:flex-row gap-8 text-sm text-[var(--text-secondary)]">
                <div className="flex gap-3 flex-1">
                  <span className="text-netflix-red font-bold shrink-0">💡 Tips:</span>
                  <p>Jika video macet, klik sekali di dalam player untuk menutup iklan rahasia, lalu klik play lagi.</p>
                </div>
                <div className="flex gap-3 flex-1">
                  <span className="text-netflix-red font-bold shrink-0">🇮🇩 Subtitle:</span>
                  <p>Klik ikon <b>CC</b> di pojok kanan bawah player untuk menyalakan Bahasa Indonesia.</p>
                </div>
              </div>

              {streamUrl && (
                <div className="aspect-video w-full bg-black shadow-2xl ring-1 ring-white/10 rounded-2xl overflow-hidden">
                  <iframe
                    src={streamUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope"
                    title={movie.title}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-8 text-[var(--text-muted)] font-medium">
              <div className="flex items-center gap-2"><Calendar size={20} /> {movie.releaseDate}</div>
              <div className="flex items-center gap-2"><Clock size={20} /> {movie.duration}</div>
              <div className="flex items-center gap-2 font-bold text-netflix-red uppercase tracking-wider">{movie.type}</div>
            </div>

            <p className="text-xl leading-relaxed text-[var(--text-secondary)]">
              {movie.synopsis}
            </p>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map(g => (
                <span key={g} className="px-5 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-sm font-bold text-[var(--text-muted)] hover:border-netflix-red transition-colors cursor-default">{g}</span>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div className="p-8 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-3xl space-y-8">
              <div>
                <h4 className="text-xs uppercase tracking-[4px] text-netflix-red font-black mb-3">Director</h4>
                <p className="text-xl font-bold">{movie.director}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[4px] text-netflix-red font-black mb-3">Top Cast</h4>
                <div className="flex flex-col gap-3">
                  {movie.cast.map(c => (
                    <p key={c} className="text-[var(--text-secondary)] font-medium text-lg">• {c}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default MovieDetail;
