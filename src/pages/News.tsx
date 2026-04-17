import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { movieService, type UnifiedMovie } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NewsArticleCard from '../components/NewsArticleCard';
import NetflixLoader from '../components/NetflixLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ArrowRight, Play, TrendingUp, Sparkles } from 'lucide-react';
import MovieModal from '../components/MovieModal';

const News: React.FC = () => {
  const { t } = useTranslation();
  const [upcoming, setUpcoming] = useState<UnifiedMovie[]>([]);
  const [trending, setTrending] = useState<UnifiedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [upcomingData, trendingData] = await Promise.all([
          movieService.getUpcomingMovies(1),
          movieService.getTrendingMovies(1)
        ]);
        setUpcoming(upcomingData);
        setTrending(trendingData);
      } catch (error) {
        console.error("Failed to fetch news data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <NetflixLoader fullScreen />;

  const topNews = trending[0];
  const otherNews = [...trending.slice(1, 4), ...upcoming.slice(0, 9)];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      {/* Hero Section - Fullscreen Experience */}
      <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden flex items-center">
        {topNews && (
          <>
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={topNews.backdrop} 
                alt={topNews.title}
                className="w-full h-full object-cover animate-image-reveal"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 px-[var(--container-padding)] w-full max-w-5xl space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-netflix-red/20 backdrop-blur-xl border border-netflix-red/30 text-netflix-red text-xs font-black uppercase tracking-[4px]"
              >
                <TrendingUp size={16} />
                {t('article_hero')}
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-8xl font-black font-outfit text-white tracking-[ -0.05em] leading-[0.9] antialiased"
              >
                {topNews.title}<br/>
                <span className="text-netflix-red">Headline Report</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-2xl text-zinc-300 font-medium max-w-2xl leading-relaxed opacity-80"
              >
                Explore why this title is shattering records worldwide. Get exclusive insights into the production, cast, and the hype surrounding {topNews.title}.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6"
              >
                <button 
                  onClick={() => setSelectedMovieId(topNews.id)}
                  className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-netflix-red hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl flex items-center gap-3 shadow-white/5"
                >
                  <Play size={18} fill="currentColor" />
                  {t('read_article')}
                </button>
                
                <div className="flex items-center gap-4 text-zinc-500 text-xs font-black uppercase tracking-widest">
                  <div className="w-12 h-px bg-zinc-800" />
                  YKN Spotlight
                </div>
              </motion.div>
            </div>
          </>
        )}
      </section>

      {/* Main Content Grid - Full Width container */}
      <main className="px-[var(--container-padding)] py-20 md:py-32">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-16 md:mb-24">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-outfit text-white tracking-tighter flex items-center gap-4">
              <Sparkles className="text-netflix-red" size={32} />
              {t('explore_news')}
            </h2>
            <div className="h-1.5 w-32 bg-netflix-red rounded-full" />
          </div>
          <div className="hidden md:flex items-center gap-3 text-zinc-500 font-black text-[10px] uppercase tracking-[6px]">
            <Newspaper size={18} />
            Daily Cinema Feed
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-12 md:gap-y-20">
          {otherNews.map((movie, idx) => (
            <NewsArticleCard
              key={`${movie.id}-${idx}`}
              title={movie.title}
              description={`Industry experts analyze the global impact of ${movie.title}. From early production secrets to the massive box office predictions, stay tuned for the full story.`}
              image={movie.backdrop || movie.poster}
              date="APRIL 17, 2026"
              category={idx < 3 ? 'trending' : 'upcoming'}
              onClick={() => setSelectedMovieId(movie.id)}
            />
          ))}
        </div>

        {/* Footer Teaser - Full Width Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 md:mt-48 p-12 md:p-32 rounded-[4rem] bg-gradient-to-br from-zinc-900 via-zinc-900/40 to-black border border-white/5 flex flex-col items-center text-center space-y-12 relative overflow-hidden"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-netflix-red/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-netflix-red border border-white/10">
            <Newspaper size={48} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-7xl font-black font-outfit text-white leading-tight tracking-tighter max-w-4xl">
              More cinematic breakthroughs are coming your way.
            </h2>
            <p className="text-zinc-500 text-lg md:text-xl font-medium tracking-wide">
              Powering the future of movie news through the TMDB Global Network.
            </p>
          </div>

          <button className="relative z-10 flex items-center gap-4 px-12 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[4px] hover:bg-white/10 transition-all hover:gap-8 group">
            Stay Connected
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </main>

      <Footer />

      {/* Modal Integration */}
      <AnimatePresence>
        {selectedMovieId && (
          <MovieModal 
            movieId={selectedMovieId} 
            onClose={() => setSelectedMovieId(null)} 
          />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes image-reveal {
          from { opacity: 0; scale: 1.1; filter: blur(20px); }
          to { opacity: 1; scale: 1; filter: blur(0px); }
        }
        .animate-image-reveal {
          animation: image-reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default News;
