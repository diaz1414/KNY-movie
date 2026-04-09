import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sun, Moon, Globe, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 flex items-center justify-between px-[var(--container-padding)] ${isScrolled ? 'glass h-[70px]' : 'bg-transparent h-[90px]'
          }`}
      >
        {/* ... logo section omitted ... */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-tighter text-netflix-red cursor-pointer font-outfit"
            onClick={() => setIsOpen(false)}
          >
            KNY
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-sm font-medium text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-[var(--text-primary)]">
            {/* Language Selector */}
            <div className="group relative">
              <Globe size={20} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
              <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block transition-all duration-300">
                <div className="glass rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-netflix-red hover:text-white transition-colors text-[var(--text-primary)]"
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
              className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity p-1"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Burger */}
          <button
            className="md:hidden text-[var(--text-primary)] cursor-pointer z-[1001] flex items-center justify-center w-10 h-10 rounded-full bg-white/10 glass border border-white/10 hover:bg-netflix-red transition-all duration-300 shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div animate={isOpen ? "open" : "closed"} className="relative w-6 h-6 flex flex-col justify-center items-center">
              <motion.span
                variants={{
                  closed: { rotate: 0, y: -6 },
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
                  closed: { rotate: 0, y: 6 },
                  open: { rotate: -45, y: 0 }
                }}
                className="absolute w-full h-0.5 bg-current rounded-full"
              />
            </motion.div>
          </button>
        </div>

      </nav>

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
