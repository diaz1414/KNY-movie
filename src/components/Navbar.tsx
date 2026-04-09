import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center justify-between px-[var(--container-padding)] ${
        isScrolled ? 'glass h-[70px]' : 'bg-transparent h-[90px]'
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
          className="md:hidden text-[var(--text-primary)] cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 glass z-40 flex flex-col p-24 px-[var(--container-padding)] gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="text-3xl font-bold text-[var(--text-primary)] font-outfit"
              >
                {link.name}
              </a>
            ))}
            
            <div className="mt-auto border-t border-[var(--glass-border)] pt-8 flex flex-col gap-6">
               <button 
                 onClick={toggleTheme} 
                 className="flex items-center gap-3 text-xl font-medium text-[var(--text-primary)]"
               >
                 {theme === 'dark' ? <Sun /> : <Moon />}
                 {theme === 'dark' ? t('light_mode') : t('dark_mode')}
               </button>
               
               <div className="flex gap-3 flex-wrap">
                 {languages.map(l => (
                   <button 
                     key={l.code} 
                     onClick={() => { changeLanguage(l.code); setIsOpen(false); }} 
                     className="px-3 py-1 rounded-full border border-[var(--glass-border)] text-xs font-bold text-[var(--text-muted)] hover:text-netflix-red hover:border-netflix-red transition-all"
                   >
                     {l.code.toUpperCase()}
                   </button>
                 ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
