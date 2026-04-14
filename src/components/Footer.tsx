import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SiInstagram, SiGithub, SiX, SiGmail } from 'react-icons/si';
import { Film } from 'lucide-react';
import ChangelogModal from './ChangelogModal';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [isChangelogOpen, setIsChangelogOpen] = React.useState(false);

  const socialLinks = [
    { icon: <SiInstagram size={20} />, href: 'https://www.instagram.com/', target: '_blank', label: 'Instagram' },
    { icon: <SiX size={18} />, href: 'https://x.com/', target: '_blank', label: 'Twitter' },
    { icon: <SiGithub size={20} />, href: 'https://github.com/diaz1414/KNY-movie', target: '_blank', label: 'GitHub' },
    { icon: <SiGmail size={20} />, href: 'https://mail.google.com/', target: '_blank', label: 'Email' },
  ];

  const links = [
    { name: t('about'), path: '/about' },
    { name: t('contact'), path: '/contact' },
    { name: t('privacy'), path: '/privacy' },
    { name: t('terms'), path: '/terms' },
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
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--glass-border)] pt-16 pb-8 px-[var(--container-padding)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Film className="text-netflix-red" size={32} />
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-3xl font-extrabold tracking-tighter text-netflix-red font-outfit uppercase"
            >
              {t('app_name')}
            </Link>
          </div>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-md">
            {t('footer_desc')}
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--text-primary)] hover:bg-netflix-red hover:text-white transition-all duration-300"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-outfit text-[var(--text-primary)]">
            {t('quick_links')}
          </h3>
          <ul className="space-y-4">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="text-[var(--text-secondary)] hover:text-netflix-red transition-colors duration-200"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={() => setIsChangelogOpen(true)}
                className="text-[var(--text-secondary)] hover:text-netflix-red transition-colors duration-200 cursor-pointer"
              >
                {t('changelog')}
              </button>
            </li>
          </ul>
        </div>

        {/* Genres Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-outfit text-[var(--text-primary)]">
            Genres
          </h3>
          <ul className="grid grid-cols-2 gap-4">
            {genres.map((genre) => (
              <li key={genre.name}>
                <Link
                  to={genre.path}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-[var(--text-secondary)] hover:text-netflix-red transition-colors duration-200"
                >
                  {genre.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--text-muted)] text-sm">
        <p>{t('copyright')}</p>
        <div className="flex gap-8">
          <span className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">English (US)</span>
          <span className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">Indonesia</span>
        </div>
      </div>

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
    </footer>
  );
};

export default Footer;
