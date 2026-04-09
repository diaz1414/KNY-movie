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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass h-[70px]' : 'bg-transparent h-[90px]'
      }`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 var(--container-padding)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none'
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          letterSpacing: '-1px',
          color: 'var(--accent-primary)',
          cursor: 'pointer'
        }}>
          KNY
        </h1>

        {/* Desktop Links */}
        <div className="hidden md-flex" style={{ gap: '1.5rem' }}>
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.path}
              style={{ 
                textDecoration: 'none', 
                color: 'var(--text-primary)', 
                fontSize: '0.9rem',
                opacity: 0.8,
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="hidden md-flex" style={{ alignItems: 'center', gap: '1rem' }}>
          {/* Language Selector */}
          <div className="group relative">
            <Globe size={20} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden hidden group-hover:block fade-in">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                  style={{ background: 'transparent', border: 'none', color: 'inherit' }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            {theme === 'dark' ? <Sun size={20} className="opacity-70 hover:opacity-100" /> : <Moon size={20} className="opacity-70 hover:opacity-100" />}
          </button>
        </div>

        {/* Mobile Burger */}
        <button 
          className="md-hidden"
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 glass z-40 md-hidden"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '6rem 4% 2rem',
              gap: '2rem'
            }}
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.path}
                onClick={() => setIsOpen(false)}
                style={{ 
                  textDecoration: 'none', 
                  color: 'var(--text-primary)', 
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                {link.name}
              </a>
            ))}
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
               <button onClick={toggleTheme} className="flex items-center gap-2">
                 {theme === 'dark' ? <Sun /> : <Moon />}
                 {theme === 'dark' ? t('light_mode') : t('dark_mode')}
               </button>
               <div className="flex gap-2 flex-wrap max-w-[200px]">
                 {languages.slice(0, 5).map(l => (
                   <button key={l.code} onClick={() => changeLanguage(l.code)} className="text-xs opacity-50">{l.code.toUpperCase()}</button>
                 ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hidden { display: none !important; }
        .flex { display: flex !important; }
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
          .md-hidden { display: none !important; }
        }
        .group:hover .group-hover\\:block { display: block !important; }
      `}</style>
    </nav>
  );
};

export default Navbar;
