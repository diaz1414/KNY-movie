import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Clapperboard, Tv, Sparkles, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AndroidBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t('home', 'Home'),        path: '/',           icon: <Home size={18} /> },
    { name: t('movies', 'Movies'),    path: '/movies',     icon: <Clapperboard size={18} /> },
    { name: t('series', 'Series'),    path: '/series',     icon: <Tv size={18} /> },
    { name: t('popular', 'Popular'),  path: '/popular',    icon: <Sparkles size={18} /> },
    { name: 'Sports',                 path: '/live-sports', icon: <Trophy size={18} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-black/95 border-t border-white/8 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.8)]">
      {/* Safe area spacer for gesture nav bars */}
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 py-1 flex-1 rounded-xl transition-all duration-300 relative select-none min-w-0"
            >
              {/* Active Glow Accent Bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-netflix-red rounded-full shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
              )}

              <div className={`transition-all duration-300 mt-1 ${
                isActive
                  ? 'text-netflix-red scale-110'
                  : 'text-zinc-500'
              }`}>
                {item.icon}
              </div>

              <span className={`text-[9px] font-bold tracking-wide uppercase transition-all duration-300 truncate w-full text-center leading-tight ${
                isActive
                  ? 'text-netflix-red'
                  : 'text-zinc-500'
              }`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
      {/* Bottom safe area for gesture navigation */}
      <div className="h-safe-area-inset-bottom bg-transparent" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
};

export default AndroidBottomNav;
