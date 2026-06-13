import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Play, Star, Calendar, Clock, Film, Globe, Clapperboard, ChevronRight } from 'lucide-react';
import { movieService, type UnifiedMovieDetail, type UnifiedMovie, getLanguageName } from '../services/api';
import { useTranslation } from 'react-i18next';
import NetflixLoader from './NetflixLoader';
import { useNavigate } from 'react-router-dom';

interface MovieModalProps {
  movieId: string | null;
  movieType?: 'movie' | 'series';
  onClose: () => void;
}

const parseLocalDate = (dateStr: string): Date | null => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const isComingSoon = (releaseDate?: string) => {
  if (!releaseDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = parseLocalDate(releaseDate);
  if (!release) return false;
  return release > today;
};

const MovieModal: React.FC<MovieModalProps> = ({ movieId, movieType, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<UnifiedMovieDetail | null>(null);
  const [similarMovies, setSimilarMovies] = useState<UnifiedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeMovieId, setActiveMovieId] = useState<string | null>(movieId);

  useEffect(() => {
    setActiveMovieId(movieId);
  }, [movieId]);

  useEffect(() => {
    if (activeMovieId) {
      setLoading(true);
      setShowTrailer(false);
      setSimilarMovies([]);
      setMovie(null);

      movieService.getMovieDetail(activeMovieId, movieType)
        .then(async (detail) => {
          setMovie(detail);
          setLoading(false);
          if (detail) {
            const similar = await movieService.getSimilarMovies(activeMovieId, detail.type);
            setSimilarMovies(similar);
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });

      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeMovieId, movieType]);

  if (!movieId) return null;

  const handleWatch = () => {
    const cleanId = activeMovieId ? activeMovieId.replace(/^(movie|series|tv)-/, '') : '';
    const type = movie?.type || movieType || (activeMovieId?.startsWith('tv-') || activeMovieId?.startsWith('series-') ? 'series' : 'movie');
    window.location.href = `/watch.html?id=${cleanId}&type=${type}`;
  };

  const handlePersonClick = (personId: number) => {
    onClose();
    navigate(`/person/${personId}`);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.95, y: 40, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-10 pointer-events-none overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto"
        />

        {/* Modal Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-[#0c0c0c] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] border-0 sm:border border-white/10 pointer-events-auto flex flex-col md:flex-row"
        >
          {loading ? (
            <div className="w-full h-[60vh] flex items-center justify-center">
              <NetflixLoader />
            </div>
          ) : movie ? (
            <>
              {/* Close Button (Universal) */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[110] w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red hover:scale-110 active:scale-90 transition-all shadow-2xl group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Poster/Hero Section */}
              <div className="relative w-full md:w-[38%] h-[40vh] md:h-auto overflow-hidden shrink-0">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Integration Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/20 to-transparent md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0c0c0c]/10 to-[#0c0c0c] hidden md:block" />

                {/* Mobile Floating Meta (Rating) */}
                <div className="absolute bottom-6 left-6 md:hidden flex items-center gap-2 bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 px-3 py-1.5 rounded-xl text-yellow-500 font-black">
                  <Star size={16} fill="currentColor" />
                  <span>{movie.rating}</span>
                </div>
              </div>

              {/* Details Content Area */}
              <div className="flex-1 overflow-y-auto premium-scroll px-6 py-10 md:px-14 md:py-16 flex flex-col gap-8">

                {/* Header Info */}
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-netflix-red text-white text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-tighter shadow-lg shadow-red-600/20">
                      {movie.type.toUpperCase()}
                    </span>
                    <span className="text-white/40 text-[10px] font-black tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded">
                      {movie.quality}
                    </span>
                    {/* Language Badge */}
                    {movie.originalLanguage && (
                      <span className="flex items-center gap-1 text-white/40 text-[10px] font-black tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded">
                        <Globe size={10} />
                        {getLanguageName(movie.originalLanguage)}
                      </span>
                    )}
                    <div className="hidden md:flex items-center gap-1.5 text-yellow-500 font-black ml-2">
                      <Star size={18} fill="currentColor" />
                      <span className="text-lg">{movie.rating}</span>
                      {movie.voteCount > 0 && (
                        <span className="text-white/30 text-xs font-bold ml-1">
                          ({movie.voteCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-6xl font-black font-outfit text-white leading-[1.1] tracking-tighter antialiased">
                    {movie.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-zinc-400 font-bold text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-netflix-red/60" />
                      <span>{movie.releaseDate.split('-')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-netflix-red/60" />
                      <span>{movie.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Film size={18} className="text-netflix-red/60" />
                      <span className="truncate max-w-[200px]">{movie.genres.join(', ')}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Trailer Button */}
                {movie.trailerKey && (
                  <motion.div variants={itemVariants} transition={{ delay: 0.15 }}>
                    {!showTrailer ? (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-3 px-5 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/60 rounded-2xl text-white transition-all duration-300 group w-full md:w-auto"
                      >
                        <div className="w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Clapperboard size={16} className="text-white" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-wider">Tonton Trailer</span>
                      </button>
                    ) : (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                        <iframe
                          src={`https://www.youtube.com/embed/${movie.trailerKey}?rel=0&modestbranding=1&enablejsapi=1`}
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                          referrerPolicy="origin"
                          className="absolute inset-0 w-full h-full"
                          title={`${movie.title} Trailer`}
                        />
                        <button
                          onClick={() => setShowTrailer(false)}
                          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/80 flex items-center justify-center text-white hover:bg-netflix-red transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Synopsis */}
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h4 className="text-netflix-red text-[10px] font-black uppercase tracking-[5px] flex items-center gap-3">
                    {t('synopsis')} <div className="h-px flex-1 bg-white/5" />
                  </h4>
                  <p className="text-zinc-300 text-base md:text-xl leading-relaxed font-outfit font-medium opacity-90 italic">
                    "{movie.synopsis}"
                  </p>
                </motion.div>

                {/* Team & Cast Section */}
                <div className="space-y-8">
                  {/* Director Info (Compact) */}
                  <motion.div
                    variants={itemVariants}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10 border-l-2 border-netflix-red/30 pl-6"
                  >
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-[4px] text-netflix-red/80">{t('director')}</h4>
                      {movie.directorId ? (
                        <button
                          onClick={() => handlePersonClick(movie.directorId!)}
                          className="text-white font-black text-xl md:text-2xl font-outfit hover:text-netflix-red transition-colors text-left group flex items-center gap-2"
                        >
                          {movie.director}
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <p className="text-white font-black text-xl md:text-2xl font-outfit">{movie.director}</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Visual Cast Gallery */}
                  <motion.div
                    variants={itemVariants}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] md:text-[12px] font-black uppercase tracking-[5px] text-white/60">
                        {t('cast')} Spotlight
                      </h4>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 premium-scroll snap-x">
                      {movie.castMembers.map((member, idx) => (
                        <motion.button
                          key={member.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          onClick={() => handlePersonClick(member.id)}
                          className="snap-start shrink-0 group/cast w-24 md:w-28 text-center cursor-pointer"
                        >
                          <div className="relative aspect-square rounded-full overflow-hidden mb-3 border-2 border-white/5 group-hover/cast:border-netflix-red/50 transition-all duration-300 shadow-xl">
                            <img
                              src={member.profilePath || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=111&color=E50914&bold=true`}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover/cast:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/cast:opacity-100 transition-opacity" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-white font-black text-[10px] md:text-xs truncate group-hover/cast:text-netflix-red transition-colors">{member.name}</p>
                            <p className="text-white/40 font-bold text-[8px] md:text-[9px] truncate tracking-tighter uppercase">{member.character}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Similar Movies */}
                {similarMovies.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <h4 className="text-[10px] md:text-[12px] font-black uppercase tracking-[5px] text-white/60">
                        Film Serupa
                      </h4>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 premium-scroll snap-x">
                      {similarMovies.map((sim, idx) => (
                        <motion.button
                          key={sim.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.04 * idx }}
                          onClick={() => setActiveMovieId(`${sim.type}-${sim.id}`)}
                          className="snap-start shrink-0 w-28 md:w-36 group/sim text-left"
                        >
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/5 group-hover/sim:border-netflix-red/50 transition-all duration-300 shadow-lg">
                            <img
                              src={sim.poster}
                              alt={sim.title}
                              className="w-full h-full object-cover group-hover/sim:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover/sim:opacity-100 transition-opacity flex items-end p-2">
                              <div className="w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center mx-auto">
                                <Play fill="white" size={12} className="ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-yellow-400 text-[9px] font-black">
                              <Star size={8} fill="currentColor" />
                              {sim.rating}
                            </div>
                          </div>
                          <p className="text-white/80 font-bold text-[10px] md:text-xs truncate group-hover/sim:text-netflix-red transition-colors">{sim.title}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: 0.4 }}
                  className="pt-4 mt-auto"
                >
                  <motion.button
                    whileHover={movie && isComingSoon(movie.releaseDate) ? {} : { scale: 1.05 }}
                    whileTap={movie && isComingSoon(movie.releaseDate) ? {} : { scale: 0.95 }}
                    onClick={movie && isComingSoon(movie.releaseDate) ? undefined : handleWatch}
                    disabled={movie && isComingSoon(movie.releaseDate)}
                    className={`w-full md:w-max px-12 py-5 rounded-2xl font-black flex items-center justify-center gap-4 group/btn transition-all ${
                      movie && isComingSoon(movie.releaseDate)
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5 shadow-none'
                        : 'bg-white text-black shadow-[0_25px_50px_rgba(255,255,255,0.15)]'
                    }`}
                  >
                    {movie && isComingSoon(movie.releaseDate) ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-500">
                          <Calendar size={20} />
                        </div>
                        <span className="uppercase tracking-tighter text-xl">{t('upcoming')}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-netflix-red flex items-center justify-center text-white group-hover/btn:scale-110 transition-transform">
                          <Play fill="white" size={20} className="ml-0.5" />
                        </div>
                        <span className="uppercase tracking-tighter text-xl">{t('watch_now')}</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>

              </div>
            </>
          ) : (
            <div className="w-full h-[60vh] flex items-center justify-center text-white font-bold">
              ERROR: CONTENT UNAVAILABLE
            </div>
          )}
        </motion.div>

        {/* Local Scrollbar Correction for Tailwind */}
        <style dangerouslySetInnerHTML={{
          __html: `
          .premium-scroll::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          .premium-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .premium-scroll::-webkit-scrollbar-thumb {
            background: rgba(229, 9, 20, 0.4);
            border-radius: 10px;
          }
          .premium-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(229, 9, 20, 0.8);
          }
        `}} />
      </div>
    </AnimatePresence>
  );
};

export default MovieModal;
