import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Clapperboard, Tv, Sparkles, Trophy } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const AndroidBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t('home', 'Home'), path: '/', icon: <Home size={20} /> },
    { name: t('movies', 'Movies'), path: '/movies', icon: <Clapperboard size={20} /> },
    { name: t('series', 'Series'), path: '/series', icon: <Tv size={20} /> },
    { name: t('popular', 'Popular'), path: '/popular', icon: <Sparkles size={20} /> },
    { name: t('live_sports', 'Live Sports'), path: '/live-sports', icon: <Trophy size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-black/90 border-t border-white/5 backdrop-blur-2xl px-6 py-2 pb-safe flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 relative select-none w-16"
          >
            {/* Active Glow Accent Bar */}
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-netflix-red rounded-full shadow-[0_0_12px_rgba(229,9,20,0.8)]" />
            )}

            <div className={`transition-all duration-300 ${
              isActive 
                ? 'text-netflix-red scale-110 shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}>
              {item.icon}
            </div>

            <span className={`text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
              isActive 
                ? 'text-netflix-red font-black scale-100' 
                : 'text-zinc-500 font-bold'
            }`}>
              {item.name}
            </span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default AndroidBottomNav;
