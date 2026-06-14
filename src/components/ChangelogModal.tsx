import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Calendar, Settings, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const updates = [
    {
      date: 'June 14, 2026',
      title: 'Live Sports Hub & FIFA World Cup 2026 Cinematic Experience',
      items: [
        'Launched the dedicated Live Sports Streaming Hub featuring real-time tournament matches and premium sports television channels.',
        'Designed an immersive cinematic backdrop powered by custom high-definition football stadium visualizations and official tournament branding elements.',
        'Implemented a smart-focus viewport hook that automatically centers and scrolls the video player to the top of the screen upon channel selection.',
        'Integrated a high-efficiency stream decoder for low-latency live HLS sports broadcasts.',
        'Designed premium glassmorphic dark widgets for real-time match scheduling, dates, and live-channel categories.',
        'Optimized responsive layout scaling and component grids across desktop, tablet, and mobile device viewports.'
      ]
    },
    {
      date: 'June 13, 2026',
      title: 'User Reporting, Mobile Navigation & Timezone Patches',
      items: [
        'Implemented a premium floating report button with responsive width expansion on desktop and minimal touch sizing on mobile.',
        'Developed a beautiful glassmorphic Report Modal featuring responsive input scaling and Netflix-themed gradient glows.',
        'Integrated Discord Webhook system with custom logo branding and dynamic color indicators.',
        'Formatted Discord alert embeds with professional aligned-colon structures (design by diaww), device OS/browser details, and active navigation links.',
        'Added a search button next to the burger menu on mobile layout for better accessibility.',
        'Refactored the mobile search overlay with a solid black background, preventing overlay collisions with logo and burger button.',
        'Fixed overlapping TMDB ID routing where TV series and movies sharing the same ID would load incorrect content.',
        'Patched a timezone offset bug that incorrectly labeled recently released titles as "Coming Soon" due to UTC midnight mismatch.'
      ]
    },
    {
      date: 'June 12, 2026',
      title: 'Upcoming Releases, Discovery & Exploration System',
      items: [
        'Added a dedicated "Akan Datang" / "Coming Soon" movies row directly under Trending Now on the Home page.',
        'Implemented dynamic "Coming Soon" badging with a pulsing amber indicator on upcoming movie cards.',
        'Refactored the watch page player to display a beautiful unreleased/coming soon splash screen with the official release date instead of broken video streams.',
        'Disabled direct streaming for upcoming movies in details modals, transforming the watch action into an inactive "Coming Soon" calendar indicator.',
        'Integrated language translation keys and fallback fetch mechanisms for seamless state restoration of upcoming movies.',
        'Added YouTube trailer embed inside the movie detail modal — watch trailers without leaving the page.',
        'Movie modal now shows similar/related titles in a horizontal scroll at the bottom.',
        'Added original language badge and vote count display in movie details.',
        'Cast and director cards are now clickable — navigate to a dedicated actor/director profile page.',
        'New Actor Profile page (/person/:id) with biography, filmography grid split by movies and series.',
        'Actor cards in the watch page are also now clickable links to their profile.',
        'Search autocomplete now supports keyboard navigation (↑↓ to navigate, Enter to open, Esc to close).',
        'Search suggestions now highlight the matching text in red.',
        'Clicking a suggestion now opens the movie detail modal directly.',
        'New "Pilihkan Aku!" random movie picker — choose genre & type, get a quality recommendation instantly.',
        'Floating action button added for quick access to the random picker from any scroll position.'
      ]
    },
    {
      date: 'April 17, 2026',
      title: 'Analytics & Monetization Infrastructure',

      items: [
        'Integrated Google Analytics 4 (GA4) for comprehensive visitor and event tracking.',
        'Implemented responsive advertising units with strategic banner placement.',
        'Developed a robust AdBanner system using isolated iframes to ensure UI stability.',
        'Optimized component lifecycle for seamless ad rendering across SPA transitions.',
        'Enhanced overall platform performance and script execution reliability.'
      ]
    },
    {
      date: 'April 11, 2026',
      title: 'Cinematic Intro & Branding Polish',
      items: [
        'Implemented a premium, Net***x-style cinematic intro sequence.',
        'Added "Welcome to YKN" interactive entry popup with an immersive sound experience.',
        'Refined branding logo with improved sharpness and reduced visual noise.',
        'Added Skip Intro functionality with session-based persistence.',
        'Optimized system-wide TypeScript types for better environment compatibility.',
        'Full English localization for all intro UI components.'
      ]
    },
    {
      date: 'April 10, 2026',
      title: 'Cinematic Experience & UI Upgrades',
      items: [
        'Implemented "More Info" context modal with detailed synopsis and cast info.',
        'Added dynamic Hero Carousel featuring trending titles with auto-play.',
        'Redesigned watch page navigation (Back button now returns to Home correctly).',
        'Enhanced UI with premium thin scrollbars and glassmorphic elements.',
        'Added smooth staggered entrance animations for better interactivity.'
      ]
    },
    {
      date: 'April 09, 2026',
      title: 'Core Engine & History Fixes',
      items: [
        'Added "Continue Watching" persistence (saves server and episode progress).',
        'Optimized iframe history to prevent browser back-button bloat.',
        'Implemented TV Series season and episode state restoration.',
        'Rebranded platform to Yuk Kita Nonton (YKN) with a new premium logo.'
      ]
    },
    {
      date: 'April 08, 2026',
      title: 'Language & Content Reach',
      items: [
        'Added multi-language support (i18n) for Indonesian and English.',
        'Integrated TMDB API for high-quality movie metadata and images.',
        'Added mobile-responsive movie grid and navigation menu.'
      ]
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300, delayChildren: 0.2, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-2xl bg-[#0c0c0c] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 pointer-events-auto flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0 bg-[#0c0c0c] z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-netflix-red/10 flex items-center justify-center text-netflix-red group">
                  <Settings size={24} className="hover:rotate-90 transition-transform duration-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black font-outfit text-white tracking-tight">{t('changelog')}</h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Platform Updates</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red transition-all group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto premium-scroll p-8 md:p-10 space-y-12">
              {updates.map((update, idx) => (
                <motion.div key={idx} variants={itemVariants} className="relative pl-8 border-l border-white/10">
                  {/* Dot */}
                  <div className="absolute top-1 -left-[5px] w-2 h-2 rounded-full bg-netflix-red shadow-[0_0_10px_rgba(229,9,20,0.8)]" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-black text-netflix-red/60 uppercase tracking-widest">
                      <Calendar size={14} />
                      <span>{update.date}</span>
                    </div>
                    <h3 className="text-xl font-black font-outfit text-white">{update.title}</h3>
                    <ul className="space-y-3">
                      {update.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3 group">
                          <CheckCircle2 size={16} className="text-green-500/60 mt-0.5 shrink-0 group-hover:text-green-500 transition-colors" />
                          <p className="text-zinc-400 text-sm font-bold leading-relaxed group-hover:text-zinc-200 transition-colors">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}

              <div className="pt-4 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[4px]">More updates coming soon</p>
              </div>
            </div>

            {/* Local Scrollbar Correction */}
            <style dangerouslySetInnerHTML={{
              __html: `
              .premium-scroll::-webkit-scrollbar {
                width: 4px;
              }
              .premium-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .premium-scroll::-webkit-scrollbar-thumb {
                background: rgba(229, 9, 20, 0.3);
                border-radius: 10px;
              }
              .premium-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(229, 9, 20, 0.6);
              }
            `}} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChangelogModal;
