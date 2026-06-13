import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import HeroCarousel from '../components/HeroCarousel';
import MovieModal from '../components/MovieModal';
import { movieService, type UnifiedMovie } from '../services/api';
import { useTranslation } from 'react-i18next';
import NetflixLoader from '../components/NetflixLoader';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const Popular: React.FC = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<UnifiedMovie[]>([]);
  const [heroMovies, setHeroMovies] = useState<UnifiedMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Handle URL query parameters for popular detail
  useEffect(() => {
    const movieVal = searchParams.get('movie');
    const typeVal = searchParams.get('type');
    if (movieVal) {
      setSelectedMovieId(typeVal ? `${typeVal}-${movieVal}` : movieVal);
    }
  }, [searchParams]);

  // Restore state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('popular_page_state_v2');
    if (savedState) {
      const {
        movies: savedMovies,
        heroMovies: savedHero,
        page: savedPage,
        hasMore: savedHasMore,
        scrollY
      } = JSON.parse(savedState);

      setMovies(savedMovies || []);
      setHeroMovies(savedHero || []);
      setPage(savedPage || 1);
      setHasMore(savedHasMore !== undefined ? savedHasMore : true);
      setLoading(false);

      setTimeout(() => {
        window.scrollTo({
          top: scrollY,
          behavior: 'instant'
        });
      }, 100);
    } else {
      fetchInitialData();
    }
  }, []);

  // Save state on scroll and changes
  useEffect(() => {
    const handleSaveState = () => {
      if (movies.length > 0) {
        sessionStorage.setItem('popular_page_state_v2', JSON.stringify({
          movies,
          heroMovies,
          page,
          hasMore,
          scrollY: window.scrollY
        }));
      }
    };

    handleSaveState();

    const handleScroll = () => {
      if (movies.length > 0) {
        const current = JSON.parse(sessionStorage.getItem('popular_page_state_v2') || '{}');
        sessionStorage.setItem('popular_page_state_v2', JSON.stringify({
          ...current,
          scrollY: window.scrollY
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [movies, heroMovies, page, hasMore]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const popular = await movieService.getTopRatedMovies(1);
      setHeroMovies(popular.slice(0, 7));
      setMovies(popular);
      setPage(1);
      setHasMore(popular.length > 0);
    } catch (err) {
      console.error('Failed to load popular movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const nextPopular = await movieService.getTopRatedMovies(nextPage);
      if (nextPopular.length > 0) {
        setMovies((prev) => [...prev, ...nextPopular]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more popular movies:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Listen to window scroll for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        if (!loading && !loadingMore && hasMore) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, page]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pb-20"
      >
        {/* Fullscreen Hero */}
        {!loading && heroMovies.length > 0 && (
          <div className="relative w-full" style={{ height: '100svh' }}>
            <HeroCarousel
              movies={heroMovies}
              onMoreInfo={(id) => setSelectedMovieId(id)}
            />
          </div>
        )}

        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />

        <div className="max-w-7xl mx-auto w-full px-[var(--container-padding)] pt-12">
          <header className="mb-10">
            <h2 className="text-3xl font-black font-outfit text-white uppercase tracking-wider">
              {t('popular', 'Trending')}
            </h2>
            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-1">
              Check out what everyone is talking about
            </p>
          </header>

          {loading ? (
            <div className="py-20">
              <NetflixLoader />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 gap-y-12">
              {movies.map((movie, index) => (
                <MovieCard key={`${movie.id}-${index}`} movie={movie} />
              ))}
            </div>
          )}

          {loadingMore && (
            <div className="py-10 text-center">
              <NetflixLoader />
            </div>
          )}
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default Popular;
