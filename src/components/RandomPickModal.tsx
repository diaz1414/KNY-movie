import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shuffle, Play, Star, ChevronRight, Sparkles } from 'lucide-react';
import { movieService, type UnifiedMovie } from '../services/api';

interface RandomPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (id: string, type?: 'movie' | 'series') => void;
}

const RandomPickModal: React.FC<RandomPickModalProps> = ({ isOpen, onClose, onSelectMovie }) => {
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedType, setSelectedType] = useState<'movie' | 'series' | 'both'>('both');
  const [result, setResult] = useState<UnifiedMovie | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinText, setSpinText] = useState('');
  const [phase, setPhase] = useState<'pick' | 'result'>('pick');

  const GENRE_OPTIONS = [
    { id: '', label: `🎲 ${t('random_genre_all', 'Bebas (Semua Genre)')}` },
    { id: '28', label: `💥 ${t('genre_action', 'Action')}` },
    { id: '35', label: `😂 ${t('genre_comedy', 'Comedy')}` },
    { id: '27', label: `👻 ${t('genre_horror', 'Horror')}` },
    { id: '10749', label: `💕 ${t('genre_romance', 'Romance')}` },
    { id: '878', label: `🚀 ${t('genre_scifi', 'Sci-Fi')}` },
    { id: '53', label: `😱 ${t('genre_thriller', 'Thriller')}` },
    { id: '18', label: `🎭 ${t('genre_drama', 'Drama')}` },
    { id: '14', label: `🧙 ${t('genre_fantasy', 'Fantasy')}` },
    { id: '16', label: `✨ ${t('genre_animation', 'Animation')}` },
    { id: '80', label: `🔫 ${t('genre_crime', 'Crime')}` },
    { id: '12', label: `🗺️ ${t('genre_adventure', 'Adventure')}` },
  ];

  const TYPE_OPTIONS = [
    { id: 'both' as const, label: `🎬 ${t('random_type_all', 'Semua')}` },
    { id: 'movie' as const, label: `🎥 ${t('movies', 'Film')}` },
    { id: 'series' as const, label: `📺 ${t('series', 'Series')}` },
  ];

  const SPIN_MESSAGES = [
    t('random_spin_1', '🎲 Mengocok pilihan...'),
    t('random_spin_2', '🎬 Memilih dari ribuan film...'),
    t('random_spin_3', '✨ Menemukan yang terbaik...'),
    t('random_spin_4', '🍿 Hampir selesai...'),
  ];

  const handlePick = async () => {
    setIsSpinning(true);
    setPhase('pick');
    setResult(null);

    // Animated spin messages
    let msgIdx = 0;
    setSpinText(SPIN_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % SPIN_MESSAGES.length;
      setSpinText(SPIN_MESSAGES[msgIdx]);
    }, 500);

    try {
      const movie = await movieService.getRandomByGenre(
        selectedGenre || undefined,
        selectedType
      );

      // Minimum spin time for drama 😄
      await new Promise(r => setTimeout(r, 1800));
      clearInterval(msgInterval);

      if (movie) {
        setResult(movie);
        setPhase('result');
      } else {
        setSpinText(t('random_no_match', 'Hmm, tidak ketemu. Coba lagi!'));
      }
    } catch {
      clearInterval(msgInterval);
      setSpinText(t('random_error', 'Terjadi kesalahan. Coba lagi!'));
    } finally {
      setIsSpinning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPhase('pick');
    setSpinText('');
  };

  const handleWatch = () => {
    if (result) {
      onSelectMovie(result.id, result.type);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(229,9,20,0.15)] z-10"
          >
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-netflix-red/20 border border-netflix-red/30 flex items-center justify-center">
                  <Sparkles size={20} className="text-netflix-red" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{t('random_pick_title', 'Pilihkan Aku!')}</h2>
                  <p className="text-xs text-white/40 font-bold">{t('random_pick_desc', 'Biar kami yang pilihkan untukmu 🍿')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-6">
              <AnimatePresence mode="wait">
                {phase === 'pick' ? (
                  <motion.div
                    key="pick"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Type Selector */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[4px] text-white/40">{t('random_content_type', 'Tipe Konten')}</p>
                      <div className="flex gap-2">
                        {TYPE_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedType(opt.id)}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all border ${
                              selectedType === opt.id
                                ? 'bg-netflix-red border-netflix-red text-white shadow-lg shadow-red-900/30'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Genre Selector */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[4px] text-white/40">{t('random_genre', 'Genre')}</p>
                      <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto premium-scroll pr-1">
                        {GENRE_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedGenre(opt.id)}
                            className={`text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                              selectedGenre === opt.id
                                ? 'bg-netflix-red/20 border-netflix-red/50 text-white'
                                : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spin Status */}
                    {isSpinning && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-3 px-4 py-3 bg-netflix-red/10 border border-netflix-red/20 rounded-2xl"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        >
                          <Shuffle size={18} className="text-netflix-red" />
                        </motion.div>
                        <p className="text-sm font-bold text-white/80">{spinText}</p>
                      </motion.div>
                    )}

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePick}
                      disabled={isSpinning}
                      className="w-full py-5 bg-netflix-red hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-white text-base uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(229,9,20,0.4)] transition-all"
                    >
                      <Shuffle size={20} className={isSpinning ? 'animate-spin' : ''} />
                      {isSpinning ? t('random_spinning', 'Memilih...') : t('random_pick_title', 'Pilihkan Aku!')}
                    </motion.button>
                  </motion.div>
                ) : (
                  /* Result Phase */
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="space-y-5"
                  >
                    {result && (
                      <>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-black uppercase tracking-[5px] text-netflix-red animate-pulse">
                            {t('random_result_title', '✨ Pilihan Untukmu!')}
                          </p>
                        </div>

                        {/* Result Card */}
                        <div className="flex gap-5 items-start p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <div className="relative w-20 shrink-0">
                            <img
                              src={result.poster}
                              alt={result.title}
                              className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg"
                            />
                            <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-black/80 px-1.5 py-0.5 rounded text-yellow-400 text-[9px] font-black">
                              <Star size={8} fill="currentColor" />
                              {result.rating}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 space-y-2 pt-1">
                            <h3 className="font-black text-white text-lg leading-tight">{result.title}</h3>
                            <span className="inline-block text-[10px] font-black bg-netflix-red/20 border border-netflix-red/30 text-netflix-red px-2.5 py-1 rounded-lg uppercase tracking-wider">
                              {result.type}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleWatch}
                            className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg"
                          >
                            <div className="w-7 h-7 rounded-full bg-netflix-red flex items-center justify-center">
                              <Play size={14} className="ml-0.5 fill-white text-white" />
                            </div>
                            {t('random_watch_detail', 'Lihat Detail Film')}
                            <ChevronRight size={18} />
                          </motion.button>

                          <button
                            onClick={handleReset}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white/60 hover:text-white flex items-center justify-center gap-2 transition-all text-sm"
                          >
                            <Shuffle size={16} />
                            {t('random_reshuffle', 'Acak Lagi')}
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scrollbar Style */}
            <style dangerouslySetInnerHTML={{ __html: `
              .premium-scroll::-webkit-scrollbar { width: 4px; }
              .premium-scroll::-webkit-scrollbar-track { background: transparent; }
              .premium-scroll::-webkit-scrollbar-thumb { background: rgba(229,9,20,0.3); border-radius: 10px; }
            `}} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RandomPickModal;
