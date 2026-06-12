import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, X, Film, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useRegion } from '../context/RegionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { movieService, type UnifiedMovie } from '../services/api';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { countryCode } = useRegion();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UnifiedMovie[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSuggestions([]);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Autocomplete
  useEffect(() => {
    setActiveIdx(-1);
    const t = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        const res = await movieService.search(searchQuery);
        setSuggestions(res.slice(0, 7));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, i18n.language]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    setActiveIdx(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        navigate(`/?search=${encodeURIComponent(suggestions[activeIdx].title)}`);
        closeSearch();
      } else if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        closeSearch();
      }
    } else if (e.key === 'Escape') closeSearch();
  };

  const handleSuggestionClick = (movie: UnifiedMovie) => {
    if (window.location.pathname !== '/') {
      navigate(`/?movie=${movie.id}`);
    } else {
      // Dispatch custom event to Home.tsx to open modal
      window.dispatchEvent(new CustomEvent('navbar-open-movie', { detail: { id: movie.id } }));
    }
    closeSearch();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  };

  const navLinks = [
    { name: t('home'), path: '/#' },
    { name: t('news'), path: '/news' },
    { name: t('movies'), path: '/#movies' },
    { name: t('series'), path: '/#series' },
    { name: t('popular'), path: '/#popular' },
  ];

  const languages = [
    { code: 'id', name: 'Indonesia' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' },
  ];

  const genres = [
    { name: 'Action', path: '/genre/28' },
    { name: 'Comedy', path: '/genre/35' },
    { name: 'Horror', path: '/genre/27' },
    { name: 'Romance', path: '/genre/10749' },
    { name: 'Sci-Fi', path: '/genre/878' },
    { name: 'Thriller', path: '/genre/53' },
  ];

  const seriesGenres = [
    { name: 'Drama', path: '/series/genre/18' },
    { name: 'Crime', path: '/series/genre/80' },
    { name: 'Animation', path: '/series/genre/16' },
    { name: 'Reality', path: '/series/genre/10764' },
    { name: 'Sci-Fi & Fantasy', path: '/series/genre/10765' },
    { name: 'Action & Adventure', path: '/series/genre/10759' },
  ];


  return (
    <>
      <motion.nav
        initial="top"
        animate={isScrolled ? 'scrolled' : 'top'}
        variants={{
          top: {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            height: '90px',
            backdropFilter: 'blur(0px) saturate(100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0)',
          },
          scrolled: {
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            height: '70px',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-[var(--container-padding)]"
      >
        <div className="flex items-center gap-8">
          <motion.div
            animate={{ scale: isScrolled ? 0.9 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              className="text-3xl font-extrabold tracking-tighter text-netflix-red cursor-pointer font-outfit uppercase flex items-center gap-2"
              onClick={() => {
                setIsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Film className="w-8 h-8 md:w-10 md:h-10" />
              <span className="hidden sm:inline">{t('app_name')}</span>
              <span className="sm:hidden">YKN</span>
            </Link>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isAnchor = link.path.includes('#');
              const linkContent = (
                <>
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-netflix-red transition-all duration-300 group-hover:w-full" />
                </>
              );
              const className = "text-sm font-bold tracking-tight text-[var(--text-primary)] opacity-60 hover:opacity-100 hover:text-netflix-red transition-all duration-300 relative group uppercase tracking-widest";

              return isAnchor ? (
                <a key={link.name} href={link.path} className={className}>
                  {linkContent}
                </a>
              ) : (
                <Link key={link.name} to={link.path} className={className}>
                  {linkContent}
                </Link>
              );
            })}
          </div>

          {/* Navbar Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden md:flex items-center relative">
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div
                  key="search-open"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="relative overflow-visible"
                >
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Cari film, serial..."
                    className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-9 pr-8 text-sm text-white placeholder-white/40 outline-none focus:border-netflix-red/60 transition-colors"
                  />
                  <button onClick={closeSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    <X size={14} />
                  </button>

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden z-[2000] shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                      {suggestions.map((movie, idx) => (
                        <div
                          key={movie.id}
                          onClick={() => handleSuggestionClick(movie)}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-zinc-900 last:border-none transition-colors ${
                            activeIdx === idx ? 'bg-zinc-800' : 'hover:bg-zinc-800/60'
                          }`}
                        >
                          <img src={movie.poster} alt="" className="w-8 h-12 object-cover rounded shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold truncate">{movie.title}</p>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase">{movie.type} · ⭐ {movie.rating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={openSearch}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Search size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-[var(--text-primary)]">
            {/* Genres Dropdown */}
            <div className="group relative">
              <span className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1 uppercase tracking-widest">
                Genres
              </span>
              <div className="absolute right-0 top-full pt-2 w-80 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                <div className="glass rounded-2xl overflow-hidden py-3 shadow-2xl border border-white/10">
                  {/* Movies Section */}
                  <div className="px-4 pb-1">
                    <p className="text-[9px] font-black uppercase tracking-[4px] text-netflix-red/70 mb-1">🎬 Movies</p>
                  </div>
                  <div className="grid grid-cols-2">
                    {genres.map((genre) => (
                      <Link
                        key={genre.name}
                        to={genre.path}
                        className="block w-full text-left px-4 py-2 text-xs font-bold hover:bg-netflix-red hover:text-white transition-colors text-[var(--text-primary)] uppercase tracking-tighter"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="mx-4 my-2 h-px bg-white/5" />

                  {/* Series Section */}
                  <div className="px-4 pb-1">
                    <p className="text-[9px] font-black uppercase tracking-[4px] text-netflix-red/70 mb-1">📺 Series</p>
                  </div>
                  <div className="grid grid-cols-2">
                    {seriesGenres.map((genre) => (
                      <Link
                        key={genre.name}
                        to={genre.path}
                        className="block w-full text-left px-4 py-2 text-xs font-bold hover:bg-netflix-red hover:text-white transition-colors text-[var(--text-primary)] uppercase tracking-tighter"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="group relative">
              <div className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer opacity-70 hover:opacity-100 flex items-center gap-2">
                <Globe size={20} />
                {countryCode && (
                  <span className="text-[9px] font-black bg-netflix-red text-white px-1.5 py-0.5 rounded leading-none transition-all duration-300">
                    {countryCode}
                  </span>
                )}
              </div>
              <div className="absolute right-0 top-full pt-2 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                <div className="glass rounded-2xl overflow-hidden py-2 shadow-2xl border border-white/10 max-h-[60vh] overflow-y-auto premium-scroll">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full text-left px-5 py-2.5 text-xs font-bold hover:bg-netflix-red hover:text-white transition-colors text-[var(--text-primary)] uppercase tracking-tighter"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 cursor-pointer opacity-70 hover:opacity-100 hover:bg-white/10 transition-all duration-300"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Removed old select menu for a better experience in the mobile overlay */}

          {/* Mobile Burger */}
          <button
            className="md:hidden text-white cursor-pointer z-[1001] flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-netflix-red transition-all duration-300 shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div animate={isOpen ? "open" : "closed"} className="relative w-5 h-5 flex flex-col justify-center items-center">
              <motion.span
                variants={{
                  closed: { rotate: 0, y: -5 },
                  open: { rotate: 45, y: 0 }
                }}
                className="absolute w-full h-0.5 bg-current rounded-full"
              />
              <motion.span
                variants={{
                  closed: { opacity: 1, scale: 1 },
                  open: { opacity: 0, scale: 0 }
                }}
                className="absolute w-full h-0.5 bg-current rounded-full"
              />
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 5 },
                  open: { rotate: -45, y: 0 }
                }}
                className="absolute w-full h-0.5 bg-current rounded-full"
              />
            </motion.div>
          </button>
        </div>

      </motion.nav>

      {/* Mobile Menu Overlay - Moved outside nav to prevent clipping */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[10000] md:hidden overflow-y-auto"
          >
            {/* Close Button Header */}
            <div className="sticky top-0 right-0 p-8 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
              {/* Main Links */}
              <div className="flex flex-col gap-6 mb-12">
                {navLinks.map((link, i) => {
                  const isAnchor = link.path.includes('#');
                  const className = "text-4xl font-black text-white hover:text-netflix-red transition-colors font-outfit tracking-tighter uppercase";
                  
                  return isAnchor ? (
                    <motion.a
                      key={link.name}
                      href={link.path}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      onClick={() => setIsOpen(false)}
                      className={className}
                    >
                      {link.name}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={link.name}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={className}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Genres Section Mobile */}
              <div className="w-full max-w-sm mb-16 space-y-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 justify-center">
                    <div className="h-px flex-1 bg-white/10" />
                    <p className="text-[10px] font-black text-netflix-red uppercase tracking-[4px]">🎬 Movies Genres</p>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map((g) => (
                      <Link
                        key={g.name}
                        to={g.path}
                        onClick={() => setIsOpen(false)}
                        className="p-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-400 hover:bg-netflix-red hover:text-white transition-all uppercase tracking-widest"
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 justify-center">
                    <div className="h-px flex-1 bg-white/10" />
                    <p className="text-[10px] font-black text-netflix-red uppercase tracking-[4px]">📺 Series Genres</p>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {seriesGenres.map((g) => (
                      <Link
                        key={g.name}
                        to={g.path}
                        onClick={() => setIsOpen(false)}
                        className="p-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-400 hover:bg-netflix-red hover:text-white transition-all uppercase tracking-widest"
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom Controls */}
              <div className="w-full max-w-xs space-y-12">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[6px]">Appearance</p>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center gap-4 w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white active:scale-95 transition-all text-lg font-bold"
                  >
                    {theme === 'dark' ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-400" />}
                    {theme === 'dark' ? t('light_mode') : t('dark_mode')}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[6px]">
                    {t('Select Language')} {countryCode && <span className="text-netflix-red ml-2 font-bold">[{countryCode}]</span>}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {languages.slice(0, 4).map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { changeLanguage(l.code); setIsOpen(false); }}
                        className={`px-4 py-4 rounded-xl border text-xs font-black transition-all ${i18n.language === l.code
                          ? 'bg-netflix-red border-netflix-red text-white shadow-xl shadow-red-900/40'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                          }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
