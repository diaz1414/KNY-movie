import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NewsArticleCardProps {
  title: string;
  description: string;
  image: string;
  date: string;
  category: 'upcoming' | 'trending' | 'news';
  onClick: () => void;
}

const NewsArticleCard: React.FC<NewsArticleCardProps> = ({ 
  title, 
  description, 
  image, 
  date, 
  category, 
  onClick 
}) => {
  const { t } = useTranslation();

  const getCategoryTheme = () => {
    switch (category) {
      case 'upcoming': 
        return {
          bg: 'bg-blue-600',
          text: 'text-blue-500',
          indicator: 'bg-blue-500',
          label: t('upcoming')
        };
      case 'trending': 
        return {
          bg: 'bg-netflix-red',
          text: 'text-netflix-red',
          indicator: 'bg-netflix-red',
          label: t('trending')
        };
      default: 
        return {
          bg: 'bg-zinc-600',
          text: 'text-zinc-400',
          indicator: 'bg-zinc-500',
          label: t('news')
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group relative flex flex-col bg-[#0f0f0f] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/10 transition-all duration-500 w-full"
    >
      {/* Image Container - Mobile First: Responsive Aspect Ratios */}
      <div className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />
        
        {/* Floating Category Tag */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className={`w-1.5 h-1.5 rounded-full ${theme.indicator} animate-pulse`} />
          <span className="text-[10px] font-black uppercase tracking-[2px] text-white">
            {theme.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all">
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-5 text-[10px] font-black uppercase tracking-[3px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className={theme.text} />
            {date}
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock size={12} />
            5 MIN READ
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black font-outfit text-white leading-tight mb-4 group-hover:text-netflix-red transition-colors duration-300 antialiased">
          {title}
        </h3>

        <p className="text-zinc-400 text-sm font-medium leading-relaxed line-clamp-3 mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
          {description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/40 text-[9px] font-black tracking-[2px] uppercase">
            <span>By YKN Team</span>
          </div>
          
          <div className="flex items-center gap-2 text-netflix-red text-xs font-black uppercase tracking-[2px] group-hover:gap-4 transition-all duration-300">
            {t('read_article')}
            <ArrowRight size={18} />
          </div>
        </div>
      </div>

      {/* Hover Reveal Glow */}
      <div className="absolute inset-0 bg-netflix-red/20 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500" />
    </motion.div>
  );
};

export default NewsArticleCard;
