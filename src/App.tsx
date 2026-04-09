import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieCard from './components/MovieCard';
import MovieRow from './components/MovieRow';
import MovieDetail from './components/MovieDetail';
import Footer from './components/Footer';
import type { UnifiedMovie } from './services/api';
import { movieService } from './services/api';
import { Search, X } from 'lucide-react';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [popularMovies, setPopularMovies] = useState<UnifiedMovie[]>([]);
  const [recentMovies, setRecentMovies] = useState<UnifiedMovie[]>([]);
  const [popularSeries, setPopularSeries] = useState<UnifiedMovie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<UnifiedMovie[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      movieService.getPopularMovies(i18n.language),
      movieService.getRecentMovies(i18n.language),
      movieService.getPopularSeries(i18n.language)
    ]).then(([popular, recent, series]) => {
      setPopularMovies(popular);
      setRecentMovies(recent);
      setPopularSeries(series);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [i18n.language]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const results = await movieService.search(searchQuery, i18n.language);
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <main className="pb-20">
        <div className="pt-24 px-[var(--container-padding)] max-w-7xl mx-auto">
          <form onSubmit={handleSearch} className="relative mb-16 group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-netflix-red to-red-800 rounded-full blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200`}></div>
            <div className="relative flex items-center">
              <Search className="absolute left-6 text-[var(--text-muted)] group-focus-within:text-netflix-red transition-colors" size={24} />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-full py-5 pl-16 pr-8 outline-none focus:ring-0 transition-all text-xl font-outfit shadow-2xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                  className="absolute right-6 text-[var(--text-muted)] hover:text-netflix-red transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </form>

          {searchResults ? (
            <div className="fade-in pb-20">
              <div className="flex justify-between items-end mb-10">
                <h2 className="text-3xl font-bold font-outfit text-[var(--text-primary)]">
                  {t('search_results')} <span className="text-netflix-red">"{searchQuery}"</span>
                </h2>
                <p className="text-[var(--text-muted)] mb-1">
                  {searchResults.length} {t('results')}
                </p>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 gap-y-12">
                  {searchResults.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovieId} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
                    <Search size={40} />
                  </div>
                  <h3 className="text-xl font-bold">{t('no_results')}</h3>
                  <p className="text-[var(--text-muted)]">Try searching for something else</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {loading ? (
                <div className="h-[80vh] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <Hero movie={popularMovies[0]} onWatch={setSelectedMovieId} />

                  <div className="relative z-10 -mt-20 md:-mt-32 space-y-8">
                    <MovieRow
                      title={t('trending')}
                      movies={popularMovies}
                      onMovieClick={setSelectedMovieId}
                    />
                    <MovieRow
                      title={t('new_releases')}
                      movies={recentMovies}
                      onMovieClick={setSelectedMovieId}
                    />
                    <MovieRow
                      title={t('popular_series')}
                      movies={popularSeries}
                      onMovieClick={setSelectedMovieId}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <MovieDetail
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />

      <Footer />
    </div>
  );
};

export default App;
