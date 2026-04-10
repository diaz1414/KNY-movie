import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, X, Film } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  };

  const navLinks = [
    { name: t('home'), path: '/#' },
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
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-sm font-bold tracking-tight text-[var(--text-primary)] opacity-60 hover:opacity-100 hover:text-netflix-red transition-all duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-netflix-red transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
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
              <div className="absolute right-0 top-full pt-2 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                <div className="glass rounded-2xl overflow-hidden py-2 shadow-2xl border border-white/10">
                  {genres.map((genre) => (
                    <Link
                      key={genre.name}
                      to={genre.path}
                      className="block w-full text-left px-5 py-2.5 text-xs font-bold hover:bg-netflix-red hover:text-white transition-colors text-[var(--text-primary)] uppercase tracking-tighter"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="group relative">
              <div className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer opacity-70 hover:opacity-100">
                <Globe size={20} />
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

          {/* Genre Selector Mobile (Next to Burger) */}
          <div className="md:hidden relative z-[1001]">
            <select
              className="appearance-none bg-black/40 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black py-2 pl-4 pr-8 rounded-full outline-none shadow-lg cursor-pointer uppercase tracking-widest"
              onChange={(e) => {
                if(e.target.value) navigate(e.target.value);
              }}
              value=""
            >
              <option value="" disabled>Genres</option>
              {genres.map((g) => (
                <option key={g.name} value={g.path} className="text-black">
                  {g.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
               <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

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
              <div className="flex flex-col gap-10 mb-16">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.path}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    onClick={() => setIsOpen(false)}
                    className="text-5xl font-black text-white hover:text-netflix-red transition-colors font-outfit tracking-tighter"
                  >
                    {link.name}
                  </motion.a>
                ))}
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
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[6px]">{t('Select Language')}</p>
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
