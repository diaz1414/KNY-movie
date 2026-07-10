import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';
import YKNInstallBanner from '../components/YKNInstallBanner';
import { movieService, type UnifiedMovie } from '../services/api';
import { Search, ChevronLeft, ChevronRight, Sparkles, Trophy, Play, Shuffle, AlertTriangle } from 'lucide-react';
import NetflixLoader from '../components/NetflixLoader';
import MovieModal from '../components/MovieModal';
import AdBanner from '../components/AdBanner';
import RandomPickModal from '../components/RandomPickModal';
import ReportModal from '../components/ReportModal';
import { navigateWithAdRedirect } from '../utils/adRedirect';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [popularMovies, setPopularMovies] = useState<UnifiedMovie[]>([]);
  const [recentMovies, setRecentMovies] = useState<UnifiedMovie[]>([]);
  const [popularSeries, setPopularSeries] = useState<UnifiedMovie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<UnifiedMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<UnifiedMovie[]>([]);
  const [searchResults, setSearchResults] = useState<UnifiedMovie[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [exploreMovies, setExploreMovies] = useState<UnifiedMovie[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchParams] = useSearchParams();

  // Restore state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('home_state_v2');
    if (savedState) {
      const {
        popularMovies: savedPop,
        recentMovies: savedRecent,
        popularSeries: savedSeries,
        upcomingMovies: savedUpcoming,
        topRatedMovies: savedTopRated,
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

      if (savedUpcoming && savedUpcoming.length > 0) {
        setUpcomingMovies(savedUpcoming);
      } else {
        // Fallback fetch if upcoming was not stored in session previously
        movieService.getUpcomingMovies()
          .then(setUpcomingMovies)
          .catch(err => console.error("Failed to fetch upcoming fallback", err));
      }

      if (savedTopRated && savedTopRated.length > 0) {
        setTopRatedMovies(savedTopRated);
      } else {
        // Fallback fetch if top rated was not stored in session previously
        movieService.getTopRatedMovies()
          .then(setTopRatedMovies)
          .catch(err => console.error("Failed to fetch top rated fallback", err));
      }

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
      movieService.getRecentMovies(1), // Start Explore with Latest
      movieService.getUpcomingMovies(), // Fetch upcoming movies
      movieService.getTopRatedMovies() // Fetch top rated movies
    ]).then(([popular, recent, series, latest, upcoming, topRated]) => {
      setPopularMovies(popular);
      setRecentMovies(recent);
      setPopularSeries(series);
      setExploreMovies(latest);
      setUpcomingMovies(upcoming);
      setTopRatedMovies(topRated);
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
        const current = JSON.parse(sessionStorage.getItem('home_state_v2') || '{}');
        sessionStorage.setItem('home_state_v2', JSON.stringify({
          ...current,
          scrollY: window.scrollY
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popularMovies, recentMovies, popularSeries, upcomingMovies, topRatedMovies]);

  // Save state
  useEffect(() => {
    const handleSaveState = () => {
      if (popularMovies.length > 0) {
        sessionStorage.setItem('home_state_v2', JSON.stringify({
          popularMovies,
          recentMovies,
          popularSeries,
          upcomingMovies,
          topRatedMovies,
          exploreMovies,
          explorePage,
          scrollY: window.scrollY
        }));
      }
    };

    handleSaveState();

    const handleScroll = () => {
      if (popularMovies.length > 0) {
        const current = JSON.parse(sessionStorage.getItem('home_state_v2') || '{}');
        sessionStorage.setItem('home_state_v2', JSON.stringify({
          ...current,
          scrollY: window.scrollY
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popularMovies, recentMovies, popularSeries, upcomingMovies, topRatedMovies, exploreMovies, explorePage]);

  // Listen for movie open events from Navbar search
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = detail?.id;
      const type = detail?.type;
      if (id) {
        setSelectedMovieId(type ? `${type}-${id}` : id);
      }
    };
    window.addEventListener('navbar-open-movie', handler);
    return () => window.removeEventListener('navbar-open-movie', handler);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const results = await movieService.search(query);
    setSearchResults(results);
    setSearchQuery(query);
  };

  // Handle ?search= query param from navbar reactively using searchParams
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      handleSearch(q);
    } else {
      setSearchResults(null);
      setSearchQuery('');
    }
  }, [searchParams]);

  // Handle ?movie= query param from URL (e.g., from Navbar search on other pages)
  useEffect(() => {
    const movieVal = searchParams.get('movie');
    const typeVal = searchParams.get('type');
    if (movieVal) {
      setSelectedMovieId(typeVal ? `${typeVal}-${movieVal}` : movieVal);
    }
  }, [searchParams]);


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <main className="pb-20">
        {/* Fullscreen Hero — no top padding, goes behind navbar */}
        {!searchResults && !loading && (
          <div className="relative w-full" style={{ height: '100svh' }}>
            <HeroCarousel
              movies={topRatedMovies.slice(0, 7)}
              onMoreInfo={(id) => setSelectedMovieId(id)}
            />
          </div>
        )}

        {/* Movie Info Modal */}
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />

        <div className="max-w-7xl mx-auto w-full">
          {/* Search Results */}
          {searchResults ? (
            <div className="fade-in pb-20 pt-28 px-[var(--container-padding)]">
              <div className="flex justify-between items-end mb-10">
                <h2 className="text-3xl font-bold font-outfit text-[var(--text-primary)]">
                  {t('search_results')} <span className="text-netflix-red">"{searchQuery}"</span>
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-[var(--text-muted)] mb-1">{searchResults.length} {t('results')}</p>
                  <button
                    onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                    className="text-xs font-black text-zinc-500 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    ✕ Tutup
                  </button>
                </div>
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
            <div className="space-y-16 pt-12">
              {loading ? (
                <NetflixLoader fullScreen />
              ) : (
                <>
                  <MovieRow
                    id="top-rated"
                    title={t('top_rated')}
                    movies={topRatedMovies}
                  />

                  <MovieRow
                    id="popular"
                    title={t('trending')}
                    movies={popularMovies}
                  />

                  <MovieRow
                    id="upcoming"
                    title={t('upcoming')}
                    movies={upcomingMovies}
                  />

                  {/* Ad Leaderboard Top */}
                  <div className="flex justify-center py-4 px-[var(--container-padding)]">
                    <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl p-1 bg-white/[0.02] backdrop-blur-xl max-w-full">
                      <AdBanner
                        id="ad-top"
                        format="iframe"
                        height={90}
                        width={728}
                        adKey="9eb1c807951034d8d5dba6629c6bb6ed"
                      />
                    </div>
                  </div>

                  {/* NEW: Continue Watching Section */}
                  {(() => {
                    const lastWatched = localStorage.getItem('ykn_last_watched');
                    if (!lastWatched) return null;
                    const item = JSON.parse(lastWatched);
                    return (
                      <div className="px-[var(--container-padding)] animate-slide-up">
                        <div className="flex items-center gap-2.5 mb-6">
                          <div className="w-1.5 h-6 bg-netflix-red rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)]"></div>
                          <h2 className="text-2xl font-black font-outfit text-white tracking-tight uppercase">
                            Lanjutkan Menonton
                          </h2>
                        </div>

                        <div
                          onClick={() => navigateWithAdRedirect(`/watch?id=${item.id}${item.type === 'tv' ? `&s=${item.season}&e=${item.episode}` : ''}`)}
                          className="group relative w-full md:w-[450px] aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-netflix-red transition-all duration-500 shadow-2xl"
                        >
                          <img src={item.poster} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-netflix-red flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500">
                              <Play fill="white" size={24} className="ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-xl font-black text-white mb-1 group-hover:text-netflix-red transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black bg-netflix-red text-white px-2 py-0.5 rounded shadow-lg uppercase">
                                {item.type}
                              </span>
                              {item.type === 'tv' && (
                                <span className="text-xs font-bold text-white/60">
                                  Season {item.season} • Episode {item.episode}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 h-1 bg-netflix-red w-[70%] shadow-[0_0_10px_rgba(229,9,20,0.8)]" />
                        </div>
                      </div>
                    );
                  })()}


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

                  {/* Ad Rectangle Middle */}
                  <div className="flex justify-center py-6 px-[var(--container-padding)]">
                    <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl p-1 bg-white/[0.02] backdrop-blur-xl">
                      <AdBanner
                        id="ad-middle"
                        format="iframe"
                        height={250}
                        width={300}
                        adKey="7416c14407226b70dfe1c1a8ef1ed288"
                      />
                    </div>
                  </div>

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
                    <div className="pt-10 flex flex-col items-center gap-6 pb-32">
                      <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-full bg-[#111111]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)] max-w-full overflow-x-auto no-scrollbar">
                        <button
                          onClick={() => loadExploreContent(explorePage - 1)}
                          disabled={explorePage === 1}
                          className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-all duration-300 shrink-0 cursor-pointer"
                        >
                          <ChevronLeft size={18} strokeWidth={2.5} />
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
                              className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full font-black font-outfit text-sm transition-all duration-300 cursor-pointer ${explorePage === p
                                ? 'bg-netflix-red text-white shadow-[0_0_15px_rgba(229,9,20,0.4)] scale-105'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              {p}
                            </button>
                          ));
                        })()}

                        <button
                          onClick={() => loadExploreContent(explorePage + 1)}
                          className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 shrink-0 cursor-pointer"
                        >
                          <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                      </div>

                      <p className="text-[10px] font-black tracking-[0.25em] text-[var(--text-muted)] uppercase">
                        PAGE {explorePage} OF AMAZING CONTENT
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <YKNInstallBanner />
      <Footer />

      {/* Floating Report Button */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-[5.5rem] right-6 z-[990] flex items-center justify-center sm:justify-start w-12 sm:hover:w-48 h-12 bg-zinc-950/90 hover:bg-netflix-red border border-white/10 hover:border-netflix-red/50 text-zinc-300 hover:text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ease-out group cursor-pointer overflow-hidden"
        title={t('report_title', 'Laporkan Masalah')}
      >
        <div className="flex items-center gap-2.5 px-3.5 whitespace-nowrap">
          <AlertTriangle size={18} className="shrink-0 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t('report_title', 'Laporkan Masalah')}
          </span>
        </div>
      </button>

      {/* Floating Random Pick Button */}
      <button
        onClick={() => setShowRandomModal(true)}
        className="fixed bottom-6 right-6 z-[990] flex items-center gap-2.5 px-5 py-3.5 bg-netflix-red hover:bg-red-600 text-white font-black rounded-full shadow-[0_8px_30px_rgba(229,9,20,0.5)] hover:shadow-[0_12px_40px_rgba(229,9,20,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        title={t('random_pick_title', 'Pilihkan Aku!')}
      >
        <Shuffle size={18} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-sm uppercase tracking-wider hidden sm:inline">{t('random_pick_title', 'Pilihkan Aku!')}</span>
      </button>

      {/* Random Pick Modal */}
      <RandomPickModal
        isOpen={showRandomModal}
        onClose={() => setShowRandomModal(false)}
        onSelectMovie={(id, type) => {
          setShowRandomModal(false);
          setSelectedMovieId(type ? `${type}-${id}` : id);
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default Home;
