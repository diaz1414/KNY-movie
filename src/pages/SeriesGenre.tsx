import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { movieService, type UnifiedMovie } from '../services/api';
import { motion } from 'framer-motion';
import NetflixLoader from '../components/NetflixLoader';

const getSeriesGenreName = (id: string) => {
  const genres: Record<string, string> = {
    '18': 'Drama',
    '80': 'Crime',
    '16': 'Animation',
    '10764': 'Reality',
    '10765': 'Sci-Fi & Fantasy',
    '10759': 'Action & Adventure',
    '35': 'Comedy',
    '99': 'Documentary',
    '10751': 'Family',
    '9648': 'Mystery',
  };
  return genres[id] || 'Series';
};

const SeriesGenre: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<UnifiedMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const genreName = getSeriesGenreName(id || '');

  // Restore state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(`series_genre_state_${id}`);
    if (savedState) {
      const { series: savedSeries, page: savedPage, scrollY } = JSON.parse(savedState);
      setSeries(savedSeries);
      setPage(savedPage);
      setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      }, 100);
    } else {
      setSeries([]);
      setPage(1);
      loadSeries(1);
    }
  }, [id]);

  // Save state on changes
  useEffect(() => {
    if (series.length > 0) {
      sessionStorage.setItem(`series_genre_state_${id}`, JSON.stringify({ series, page, scrollY: window.scrollY }));
    }

    const handleScroll = () => {
      if (series.length > 0) {
        const current = JSON.parse(sessionStorage.getItem(`series_genre_state_${id}`) || '{}');
        sessionStorage.setItem(`series_genre_state_${id}`, JSON.stringify({ ...current, scrollY: window.scrollY }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [series, page, id]);

  const loadSeries = async (pageNumber: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const newSeries = await movieService.getSeriesByGenre(id, pageNumber);
      setSeries((prev) => (pageNumber === 1 ? newSeries : [...prev, ...newSeries]));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadSeries(nextPage);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <main className="pt-32 pb-20 px-[var(--container-padding)] max-w-[1400px] mx-auto">
        <header className="mb-10 text-center md:text-left">
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-netflix-red text-xs font-black uppercase tracking-[6px] mb-3"
          >
            📺 TV Series
          </motion.p>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black font-outfit tracking-tighter mb-4 text-white"
          >
            {genreName}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            Explore the best {genreName.toLowerCase()} TV series, now streaming.
          </motion.p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {series.map((item, index) => (
            <MovieCard key={`${item.id}-${index}`} movie={item} />
          ))}
        </div>

        {loading && <NetflixLoader />}

        {!loading && series.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={loadMore}
              className="bg-netflix-red text-white px-8 py-3 rounded-full font-bold hover:brightness-110 transition-all font-outfit text-lg shadow-xl shadow-netflix-red/20 active:scale-95"
            >
              Load More
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SeriesGenre;
