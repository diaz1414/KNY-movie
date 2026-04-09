import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';
import type { UnifiedMovie } from '../services/api';
import { movieService } from '../services/api';
import { Search, X } from 'lucide-react';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [popularMovies, setPopularMovies] = useState<UnifiedMovie[]>([]);
  const [recentMovies, setRecentMovies] = useState<UnifiedMovie[]>([]);
  const [popularSeries, setPopularSeries] = useState<UnifiedMovie[]>([]);
  const [searchResults, setSearchResults] = useState<UnifiedMovie[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UnifiedMovie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        const results = await movieService.search(searchQuery, i18n.language);
        setSuggestions(results.slice(0, 8));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, i18n.language]);

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
                  onClick={() => { setSearchQuery(''); setSearchResults(null); setSuggestions([]); }}
                  className="absolute right-6 text-[var(--text-muted)] hover:text-netflix-red transition-colors"
                >
                  <X size={24} />
                </button>
              )}
              {/* Suggestions Dropdown - Simple Solid UI */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                    {suggestions.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => {
                          setSearchQuery(movie.title);
                          setSearchResults([movie]);
                          setShowSuggestions(false);
                        }}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-900 last:border-none cursor-pointer group"
                      >
                        <div className="relative shrink-0">
                          <img src={movie.poster} alt="" className="w-12 h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-base truncate group-hover:text-netflix-red transition-colors">{movie.title}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-black bg-netflix-red text-white px-2 py-0.5 rounded-sm tracking-tighter">{movie.type.toUpperCase()}</span>
                            <span className="text-xs text-zinc-500 font-bold flex items-center gap-1">
                              <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 text-sm font-black text-center text-zinc-400 hover:text-white hover:bg-zinc-800 border-t border-zinc-800 bg-zinc-900/50 transition-all"
                  >
                    SEARCH FOR "{searchQuery.toUpperCase()}"
                  </button>
                </div>
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
                    <MovieCard key={movie.id} movie={movie} />
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
                  <Hero movie={popularMovies[0]} />

                  <div className="relative z-10 -mt-20 md:-mt-32 space-y-8">
                    <MovieRow
                      id="popular"
                      title={t('trending')}
                      movies={popularMovies}
                    />
                    <MovieRow
                      id="movies"
                      title={t('new_releases')}
                      movies={recentMovies}
                    />
                    <MovieRow
                      id="series"
                      title={t('popular_series')}
                      movies={popularSeries}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
