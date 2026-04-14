import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';
import { movieService, type UnifiedMovie } from '../services/api';
import { Search, X, ChevronLeft, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import NetflixLoader from '../components/NetflixLoader';
import MovieModal from '../components/MovieModal';
// import AdBanner from '../components/AdBanner';

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
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [exploreMovies, setExploreMovies] = useState<UnifiedMovie[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [exploreLoading, setExploreLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Restore state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('home_state');
    if (savedState) {
      const {
        popularMovies: savedPop,
        recentMovies: savedRecent,
        popularSeries: savedSeries,
        exploreMovies: savedExplore,
        explorePage: savedPage,
        scrollY
      } = JSON.parse(savedState);

      setPopularMovies(savedPop || []);
      setRecentMovies(savedRecent || []);
      setPopularSeries(savedSeries || []);
      setExploreMovies(savedExplore || []);
      setExplorePage(savedPage || 1);
      setLoading(false);

      setTimeout(() => {
        window.scrollTo({
          top: scrollY,
          behavior: 'instant'
        });
      }, 100);
    } else {
      fetchData();
    }
  }, [i18n.language]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      movieService.getPopularMovies(),
      movieService.getRecentMovies(),
      movieService.getPopularSeries(),
      movieService.getRecentMovies(1) // Start Explore with Latest
    ]).then(([popular, recent, series, latest]) => {
      setPopularMovies(popular);
      setRecentMovies(recent);
      setPopularSeries(series);
      setExploreMovies(latest);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const loadExploreContent = async (page: number) => {
    if (page < 1 || exploreLoading) return;
    setExploreLoading(true);
    try {
      // Pages 1-10: Latest Movies
      // Pages 11+: Top Rated Movies
      const results = page <= 10
        ? await movieService.getRecentMovies(page)
        : await movieService.getTopRatedMovies(page - 10);

      if (results.length > 0) {
        setExploreMovies(results);
        setExplorePage(page);

        // Smooth scroll to Explore Section with offset for navbar
        setTimeout(() => {
          const section = document.getElementById('explore-section');
          if (section) {
            const offset = 100; // Offset for fixed navbar + padding
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = section.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExploreLoading(false);
    }
  };

  useEffect(() => {
    // Scroll handling for state restoration only
    const handleScroll = () => {
      if (popularMovies.length > 0) {
        const current = JSON.parse(sessionStorage.getItem('home_state') || '{}');
        sessionStorage.setItem('home_state', JSON.stringify({
          ...current,
          scrollY: window.scrollY
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popularMovies, recentMovies, popularSeries]);

  // Save state
  useEffect(() => {
    const handleSaveState = () => {
      if (popularMovies.length > 0) {
        sessionStorage.setItem('home_state', JSON.stringify({
          popularMovies,
          recentMovies,
          popularSeries,
          exploreMovies,
          explorePage,
          scrollY: window.scrollY
        }));
      }
    };

    handleSaveState();

    const handleScroll = () => {
      if (popularMovies.length > 0) {
        const current = JSON.parse(sessionStorage.getItem('home_state') || '{}');
        sessionStorage.setItem('home_state', JSON.stringify({
          ...current,
          scrollY: window.scrollY
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popularMovies, recentMovies, popularSeries, exploreMovies, explorePage]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        const results = await movieService.search(searchQuery);
        setSuggestions(results.slice(0, 8));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const results = await movieService.search(searchQuery);
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <main className="pb-20">
        <div className="pt-24 px-[var(--container-padding)] max-w-7xl mx-auto" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative mb-16 group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-netflix-red to-red-800 rounded-full blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200`}></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 md:left-6 text-[var(--text-muted)] group-focus-within:text-netflix-red transition-colors" size={20} />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-full py-3 md:py-5 pl-12 md:pl-16 pr-6 md:pr-8 outline-none focus:ring-0 transition-all text-base md:text-xl font-outfit shadow-2xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchResults(null); setSuggestions([]); }}
                  className="absolute right-6 text-[var(--text-muted)] hover:text-netflix-red transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
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
                <NetflixLoader fullScreen />
              ) : (
                <>
                  <HeroCarousel
                    movies={popularMovies.slice(0, 7)}
                    onMoreInfo={(id) => setSelectedMovieId(id)}
                  />

                  {/* Movie Info Modal */}
                  <MovieModal
                    movieId={selectedMovieId}
                    onClose={() => setSelectedMovieId(null)}
                  />

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

                    {/* Native Banner Disabled for Troubleshooting
                    <AdBanner 
                      id="container-d6a7c7b01488e26dacc23a94129c76cd"
                      format="native"
                      scriptUrl="https://pl29154194.profitablecpmratenetwork.com/d6a7c7b01488e26dacc23a94129c76cd/invoke.js"
                      className="my-10 animate-in fade-in slide-in-from-bottom-5 duration-700"
                    />
                    */}

                    <MovieRow
                      id="series"
                      title={t('popular_series')}
                      movies={popularSeries}
                    />

                    {/* Explore More Section */}
                    <div id="explore-section" className="pt-20 space-y-10 px-[var(--container-padding)]">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col gap-3">
                          <span className="text-netflix-red text-xs md:text-sm font-black uppercase tracking-[4px] md:tracking-[6px] animate-pulse flex items-center gap-2">
                            {explorePage <= 10 ? <Sparkles size={16} /> : <Trophy size={16} />}
                            {explorePage <= 10 ? t('new_releases') : t('top_rated')}
                          </span>
                          <h2 className="text-3xl md:text-6xl font-black font-outfit text-white tracking-tighter leading-tight">
                            {explorePage <= 10 ? t('latest_explore') : t('explore_more')}
                          </h2>
                        </div>

                        {/* Pagination Controls Top (Optional but premium) */}
                        <div className="flex items-center self-start md:self-auto bg-[#111111]/80 backdrop-blur-md border border-white/5 p-1 rounded-full shadow-2xl">
                          <button
                            onClick={() => loadExploreContent(explorePage - 1)}
                            disabled={explorePage === 1}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                          <span className="w-10 h-10 md:w-14 h-10 flex items-center justify-center font-black font-outfit text-lg md:text-xl text-netflix-red">
                            {explorePage}
                          </span>
                          <button
                            onClick={() => loadExploreContent(explorePage + 1)}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
                          >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        </div>
                      </div>

                      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 gap-y-12 transition-all duration-500 ${exploreLoading ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>
                        {exploreMovies.map((movie, index) => (
                          <MovieCard
                            key={`${movie.id}-${index}`}
                            movie={movie}
                          />
                        ))}
                      </div>

                      {/* Pagination Controls Bottom */}
                      <div className="pt-10 flex flex-col items-center gap-8 pb-32">
                        <div className="flex items-center justify-center gap-2 md:gap-4 max-w-full px-4 py-2">
                          <button
                            onClick={() => loadExploreContent(explorePage - 1)}
                            disabled={explorePage === 1}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red hover:border-netflix-red transition-all disabled:opacity-20 shadow-xl shrink-0"
                          >
                            <ChevronLeft size={20} />
                          </button>

                          {(() => {
                            const pages = [];
                            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                            const maxVisible = isMobile ? 5 : 10;
                            const startPage = Math.max(1, explorePage - Math.floor(maxVisible / 2));
                            const endPage = startPage + maxVisible - 1;
                            for (let p = startPage; p <= endPage; p++) {
                              pages.push(p);
                            }
                            return pages.map((p) => (
                              <button
                                key={p}
                                onClick={() => loadExploreContent(p)}
                                className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl font-black font-outfit text-sm md:text-lg transition-all shadow-xl ${explorePage === p
                                  ? 'bg-netflix-red text-white scale-110 ring-4 ring-netflix-red/20'
                                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
                                  }`}
                              >
                                {p}
                              </button>
                            ));
                          })()}

                          <button
                            onClick={() => loadExploreContent(explorePage + 1)}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red hover:border-netflix-red transition-all shadow-xl shrink-0"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>

                        <p className="text-[var(--text-muted)] text-sm font-bold tracking-widest uppercase">
                          PAGE {explorePage} OF AMAZING CONTENT
                        </p>
                      </div>
                    </div>
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
