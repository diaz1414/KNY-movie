import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieDetail from './components/MovieDetail';
import type { UnifiedMovie } from './services/api';
import { movieService } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';
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
  }, []);

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
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      <Navbar />

      <main style={{ paddingTop: 'var(--navbar-height)' }}>
        {loading && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--bg-primary)',
            zIndex: 100 
          }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-primary)]"></div>
          </div>
        )}
        {/* Search Bar - Premium Sticky */}
        <div style={{ padding: '2rem 4%', display: 'flex', justifyContent: 'center' }}>
          <form 
            onSubmit={handleSearch}
            className="glass"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0.5rem 1.5rem', 
              borderRadius: '50px', 
              width: '100%', 
              maxWidth: '600px',
              gap: '1rem'
            }}
          >
            <Search size={20} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'var(--text-primary)', 
                width: '100%',
                fontSize: '1rem'
              }}
            />
          </form>
        </div>

        <AnimatePresence mode="wait">
          {searchResults ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ paddingBottom: '4rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4%', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>{t('search_results')}</h2>
                <button 
                  onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '2rem', 
                  padding: '0 4%' 
                }}>
                  {searchResults.map(movie => (
                    <div key={movie.id} className="flex justify-center">
                      <Hero movie={movie} onWatch={setSelectedMovieId} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>{t('no_results')}</div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero movie={popularMovies[0]} onWatch={setSelectedMovieId} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '-10vh', position: 'relative', zIndex: 10 }}>
                <MovieRow 
                  title={t('trending')} 
                  movies={popularMovies} 
                  onMovieClick={setSelectedMovieId} 
                />
                <MovieRow 
                  title={t('recommended')} 
                  movies={recentMovies} 
                  onMovieClick={setSelectedMovieId} 
                />
                <MovieRow 
                  title={t('series')} 
                  movies={popularSeries} 
                  onMovieClick={setSelectedMovieId} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Detail Modal */}
      <MovieDetail 
        movieId={selectedMovieId} 
        onClose={() => setSelectedMovieId(null)} 
      />

      {/* Footer */}
      <footer style={{ padding: '4rem 4%', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', color: 'var(--text-muted)' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>KNY</h2>
        <p>&copy; 2026 Kita Nonton Yuk. Premium Movie Streaming.</p>
      </footer>

      <style>{`
        .min-h-screen { min-height: 100vh; }
        .justify-center { justify-content: center; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
