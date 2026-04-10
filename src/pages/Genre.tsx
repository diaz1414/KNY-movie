import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { movieService, type UnifiedMovie } from '../services/api';
import { motion } from 'framer-motion';
import NetflixLoader from '../components/NetflixLoader';

const getGenreName = (id: string) => {
  const genres: Record<string, string> = {
    '28': 'Action',
    '35': 'Comedy',
    '27': 'Horror',
    '10749': 'Romance',
    '878': 'Sci-Fi',
    '53': 'Thriller',
    '18': 'Drama',
    '16': 'Animation',
  };
  return genres[id] || 'Genre';
};

const Genre: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movies, setMovies] = useState<UnifiedMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const genreName = getGenreName(id || '');

  // Restore state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(`genre_state_${id}`);
    if (savedState) {
      const { movies: savedMovies, page: savedPage, scrollY } = JSON.parse(savedState);
      setMovies(savedMovies);
      setPage(savedPage);
      
      // Delay sedikit biar render selesai baru scroll
      setTimeout(() => {
        window.scrollTo({
          top: scrollY,
          behavior: 'instant'
        });
      }, 100);
    } else {
      setMovies([]);
      setPage(1);
      loadMovies(1);
    }
  }, [id]);

  // Save state whenever movies, page, or scroll changes
  useEffect(() => {
    const handleSaveState = () => {
      if (movies.length > 0) {
        sessionStorage.setItem(`genre_state_${id}`, JSON.stringify({
          movies,
          page,
          scrollY: window.scrollY
        }));
      }
    };

    // Kita simpan tiap kali ada perubahan penting
    handleSaveState();

    // Juga dengerin event scroll biar scroll position paling update kesimpen
    const handleScroll = () => {
      if (movies.length > 0) {
        const currentState = JSON.parse(sessionStorage.getItem(`genre_state_${id}`) || '{}');
        sessionStorage.setItem(`genre_state_${id}`, JSON.stringify({
          ...currentState,
          scrollY: window.scrollY
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [movies, page, id]);

  const loadMovies = async (pageNumber: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const newMovies = await movieService.getMoviesByGenre(id, pageNumber);
      setMovies((prev) => (pageNumber === 1 ? newMovies : [...prev, ...newMovies]));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <main className="pt-32 pb-20 px-[var(--container-padding)] max-w-[1400px] mx-auto">
        <header className="mb-10 text-center md:text-left">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black font-outfit tracking-tighter mb-4 text-netflix-red"
          >
            {genreName} Movies
          </motion.h1>
          <p className="text-lg text-[var(--text-secondary)]">Explore the best movies in {genreName.toLowerCase()}.</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie, index) => (
            <MovieCard key={`${movie.id}-${index}`} movie={movie} />
          ))}
        </div>

        {loading && (
          <NetflixLoader />
        )}

        {!loading && movies.length > 0 && (
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

export default Genre;
