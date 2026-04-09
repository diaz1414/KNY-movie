import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaGithub, FaXTwitter, FaEnvelope } from 'react-icons/fa6';
import { Film } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: <FaInstagram size={20} />, href: '#', label: 'Instagram' },
    { icon: <FaXTwitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <FaGithub size={20} />, href: '#', label: 'GitHub' },
    { icon: <FaEnvelope size={20} />, href: '#', label: 'Email' },
  ];

  const links = [
    { name: t('about'), path: '/about' },
    { name: t('contact'), path: '/contact' },
    { name: t('privacy'), path: '/privacy' },
    { name: t('terms'), path: '/terms' },
  ];

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--glass-border)] pt-16 pb-8 px-[var(--container-padding)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Film className="text-netflix-red" size={32} />
            <Link to="/" className="text-3xl font-extrabold tracking-tighter text-netflix-red font-outfit uppercase">
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
          </ul>
        </div>

        {/* Newsletter/Action Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-outfit text-[var(--text-primary)]">
            {t('follow_us')}
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            Stay updated with the latest releases and news from KNY Movie.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="your@email.com"
              className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red w-full"
            />
            <button className="bg-netflix-red text-white p-2 rounded-lg hover:brightness-110 transition-all">
              <FaEnvelope size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--text-muted)] text-sm">
        <p>{t('copyright')}</p>
        <div className="flex gap-8">
          <span className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">English (US)</span>
          <span className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">Indonesia</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
