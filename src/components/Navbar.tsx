import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe } from 'lucide-react';
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
    { name: t('home'), path: '#' },
    { name: t('movies'), path: '#movies' },
    { name: t('series'), path: '#series' },
    { name: t('popular'), path: '#popular' },
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center justify-between px-[var(--container-padding)] ${isScrolled ? 'glass h-[70px]' : 'bg-transparent h-[90px]'
        }`}
    >
      {/* Logo Container */}
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-extrabold tracking-tighter text-netflix-red cursor-pointer font-outfit">
          KNY
        </h1>

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
            <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="py-2">
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
          className="md:hidden text-[var(--text-primary)] cursor-pointer z-[60] flex items-center justify-center w-10 h-10 rounded-full glass hover:bg-netflix-red transition-all duration-300"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[var(--bg-secondary)] border-l border-[var(--glass-border)] shadow-2xl flex flex-col p-8 pt-24 gap-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.path}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-bold text-[var(--text-primary)] font-outfit hover:text-netflix-red transition-colors"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto border-t border-[var(--glass-border)] pt-8 flex flex-col gap-6">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={toggleTheme}
                  className="flex items-center gap-4 text-xl font-medium text-[var(--text-primary)] glass p-4 rounded-xl hover:bg-netflix-red hover:text-white transition-all"
                >
                  {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                  {theme === 'dark' ? t('light_mode') : t('dark_mode')}
                </motion.button>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('Select Language')}</p>
                  <div className="flex gap-3 flex-wrap">
                    {languages.map((l, i) => (
                      <motion.button
                        key={l.code}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.05) }}
                        onClick={() => { changeLanguage(l.code); setIsOpen(false); }}
                        className={`px-4 py-2 rounded-xl border border-[var(--glass-border)] text-sm font-bold transition-all ${i18n.language === l.code ? 'bg-netflix-red border-netflix-red text-white' : 'text-[var(--text-secondary)] hover:border-netflix-red'
                          }`}
                      >
                        {l.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
