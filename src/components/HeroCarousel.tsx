import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import type { UnifiedMovie } from '../services/api';

interface HeroCarouselProps {
  movies: UnifiedMovie[];
  onMoreInfo: (movieId: string) => void;
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

const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies, onMoreInfo }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  }, [movies.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused || movies.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, movies.length]);

  if (!movies || movies.length === 0) {
    return <div className="h-screen w-full bg-zinc-900 animate-pulse" />;
  }

  const currentMovie = movies[currentIndex];

  const handleWatch = () => {
    window.location.href = `/watch.html?id=${currentMovie.id}&type=${currentMovie.type}`;
  };

  const { scrollY } = useScroll();

  // Background transform: translate slowly, scale up slightly, fade, blur
  const yBg = useTransform(scrollY, [0, 800], [0, 320]);
  const scaleBg = useTransform(scrollY, [0, 800], [1.05, 1.25]);
  const opacityBg = useTransform(scrollY, [0, 600], [1, 0]);
  const blurValue = useTransform(scrollY, [0, 600], [0, 16]);
  const filterBg = useTransform(blurValue, (v) => `blur(${v}px)`);

  // Content transform: translate faster, fade out sooner
  const yContent = useTransform(scrollY, [0, 400], [0, 120]);
  const opacityContent = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Backdrop Image */}
          <motion.div
            className="absolute inset-0 z-0 origin-center"
            style={{
              y: yBg,
              scale: scaleBg,
              opacity: opacityBg,
              filter: filterBg
            }}
          >
            <img
              src={currentMovie.backdrop}
              alt={currentMovie.title}
              className="w-full h-full object-cover brightness-[0.6]"
            />
            {/* Multi-layered Gradients for Cinematic Look */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/40 to-transparent opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-black/20" />
          </motion.div>

          {/* Content Wrapper */}
          <motion.div
            className="relative h-full w-full flex items-end px-[var(--container-padding)] z-10 pb-28 md:pb-32 pt-24"
            style={{
              y: yContent,
              opacity: opacityContent
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="max-w-3xl flex flex-col gap-4 md:gap-7"
            >
              <div className="flex items-center gap-3">
                <span className="bg-netflix-red text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded tracking-tighter uppercase">
                  Trending
                </span>
                <span className="text-white/60 text-xs md:text-sm font-bold flex items-center gap-1.5">
                  <Play size={14} fill="white" className="opacity-60" />
                  Now Showing
                </span>
              </div>

              <motion.h1
                className="text-4xl md:text-6xl lg:text-8xl font-black font-outfit leading-[0.9] tracking-tighter text-white"
                layoutId="hero-title"
              >
                {currentMovie.title}
              </motion.h1>

              <div className="flex items-center gap-4 text-sm font-black">
                <span className="border-2 border-white/20 px-3 py-1 rounded text-[10px] md:text-xs text-white bg-white/5 uppercase tracking-widest">
                  {currentMovie.quality}
                </span>
                <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {currentMovie.rating}
                </span>
                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  {currentMovie.type === 'series' ? 'TV SERIES' : 'MOVIE'}
                </span>
              </div>

              <p className="text-zinc-300 text-sm md:text-xl leading-relaxed line-clamp-2 md:line-clamp-3 max-w-2xl font-medium antialiased">
                Experience the epic journey of <span className="text-white font-bold">{currentMovie.title}</span>. Now streaming on <span className="text-netflix-red font-black">YKN</span> with crystal clear quality and premium sound. Join millions of viewers in this cinematic experience.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <motion.button
                  whileHover={isComingSoon(currentMovie.releaseDate) ? {} : { scale: 1.05, backgroundColor: '#f3f4f6' }}
                  whileTap={isComingSoon(currentMovie.releaseDate) ? {} : { scale: 0.95 }}
                  onClick={isComingSoon(currentMovie.releaseDate) ? undefined : handleWatch}
                  disabled={isComingSoon(currentMovie.releaseDate)}
                  className={`px-6 md:px-10 py-3.5 md:py-4 rounded-xl font-black flex items-center gap-3 transition-colors shadow-[0_15px_30px_rgba(255,255,255,0.1)] group/btn ${
                    isComingSoon(currentMovie.releaseDate)
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5 shadow-none'
                      : 'bg-white text-black'
                  }`}
                >
                  {isComingSoon(currentMovie.releaseDate) ? (
                    <>
                      <Info size={24} />
                      <span className="uppercase tracking-tighter text-base md:text-lg">{t('upcoming')}</span>
                    </>
                  ) : (
                    <>
                      <Play fill="black" size={24} className="group-hover/btn:scale-110 transition-transform" />
                      <span className="uppercase tracking-tighter text-base md:text-lg">{t('watch_now')}</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onMoreInfo(`${currentMovie.type}-${currentMovie.id}`)}
                  className="bg-zinc-800/60 backdrop-blur-xl text-white border border-white/10 px-6 md:px-10 py-3.5 md:py-4 rounded-xl font-black flex items-center gap-3 transition-colors"
                >
                  <Info size={24} />
                  <span className="uppercase tracking-tighter text-base md:text-lg">{t('more_info')}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Static deep bottom gradient overlay for seamless dark transition */}
      <div className="absolute inset-x-0 bottom-0 h-[25vh] bg-gradient-to-t from-black via-black/85 to-transparent z-[5] pointer-events-none" />

      {/* Manual Navigation Controls - Hidden on mobile, visible on hover desktop */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red transition-all pointer-events-auto shadow-2xl"
        >
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red transition-all pointer-events-auto shadow-2xl"
        >
          <ChevronRight size={32} strokeWidth={3} />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="group relative py-2"
          >
            <div className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-netflix-red' : 'w-4 bg-white/30 group-hover:bg-white/50'}`} />
            {idx === currentIndex && (
              <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-netflix-red/20 blur-md rounded-full -z-10"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
