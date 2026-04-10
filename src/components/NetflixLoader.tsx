import React from 'react';
import { useTranslation } from 'react-i18next';

interface NetflixLoaderProps {
  fullScreen?: boolean;
}

const NetflixLoader: React.FC<NetflixLoaderProps> = ({ fullScreen = false }) => {
  const { t } = useTranslation();

  return (
    <div className={`${fullScreen ? 'h-[80vh]' : 'py-10'} w-full flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500`}>
      <div className="relative w-16 h-16">
        {/* The Outer Ring */}
        <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>

        {/* The Spinning Segment */}
        <div className="absolute inset-0 border-4 border-transparent border-t-netflix-red rounded-full animate-spin"></div>

        {/* Inner Glow */}
        <div className="absolute inset-2 border-2 border-netflix-red/20 rounded-full blur-sm"></div>
      </div>

      <p className="text-netflix-red font-outfit font-black tracking-[0.3em] uppercase text-sm animate-pulse">
        {t('loading')}
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NetflixLoader;
