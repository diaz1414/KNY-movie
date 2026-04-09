import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieDetail from './components/MovieDetail';
import type { UnifiedMovie } from './services/api';
import { movieService } from './services/api';
import { Search } from 'lucide-react';

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
          <form onSubmit={handleSearch} className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-full py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-netflix-red transition-all text-lg"
            />
          </form>

          {searchResults ? (
            <div className="fade-in">
              <h2 className="text-2xl font-bold mb-8 px-4 font-outfit">{t('search_results')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10 px-4 justify-items-center">
                {searchResults.map(movie => (
                  <div key={movie.id} className="w-full flex justify-center">
                    <Hero movie={movie} onWatch={setSelectedMovieId} />
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default App;
