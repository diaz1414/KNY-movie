import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Send, CheckCircle2, AlertCircle } from 'lucide-react';

// CONFIGURATION: Replace this placeholder with your actual Discord Webhook URL!
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1515291219507286046/90JL5ZcjFFJhVQJYjO6Fz70oh4ohFDzihR3-KgQR3e-Es1CXiBqaKwBAFXOcD2N1pMu5';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMovieTitle?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, defaultMovieTitle = '' }) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<'broken' | 'subtitle' | 'info' | 'other'>('broken');
  const [movieTitle, setMovieTitle] = useState(defaultMovieTitle);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const CATEGORY_OPTIONS = [
    { id: 'broken' as const, label: `🎬 ${t('report_cat_broken', 'Video Rusak / Error Server')}` },
    { id: 'subtitle' as const, label: `📝 ${t('report_cat_sub', 'Masalah Subtitle')}` },
    { id: 'info' as const, label: `ℹ️ ${t('report_cat_info', 'Informasi Film Salah')}` },
    { id: 'other' as const, label: `💬 ${t('report_cat_other', 'Bug Lain / Masukan')}` },
  ];

  const getDeviceOS = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Macintosh') || ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'OS Tidak Dikenal';
  };

  const getDeviceBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return 'Microsoft Edge';
    if (ua.includes('Chrome/')) return 'Google Chrome';
    if (ua.includes('Firefox/')) return 'Mozilla Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Apple Safari';
    return 'Browser Tidak Dikenal';
  };

  const getCategoryColor = (cat: 'broken' | 'subtitle' | 'info' | 'other') => {
    switch (cat) {
      case 'broken': return 15010068; // Red (#E50914)
      case 'subtitle': return 16096779; // Amber (#F59E0B)
      case 'info': return 3900150; // Blue (#3B82F6)
      default: return 9133302; // Purple (#8B5CF6)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setStatus('submitting');

    try {
      const selectedLabel = CATEGORY_OPTIONS.find(opt => opt.id === category)?.label || category;
      const cleanCategory = selectedLabel.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();

      const embedDescription = [
        '🎬 **DETAIL KONTEN**',
        '```yaml',
        `Judul    : ${movieTitle.trim() || 'Tidak disebutkan (General)'}`,
        `Kategori : ${cleanCategory}`,
        '```',
        '💻 **DATA PERANGKAT**',
        '```yaml',
        `Sistem   : ${getDeviceOS()}`,
        `Browser  : ${getDeviceBrowser()}`,
        '```',
        '🌐 **DATA NAVIGASI**',
        '```yaml',
        `URL      : ${window.location.href}`,
        '```',
        `🔗 **Link Aktif:** [Klik untuk Buka Halaman Laporan](${window.location.href})`,
        '',
        '💬 **DESKRIPSI MASALAH**',
        '```',
        description.trim(),
        '```'
      ].join('\n');

      const payload = {
        username: 'Yuk Kita Nonton - Report Bot',
        avatar_url: 'https://yknmovies.diaww.my.id/logo.png',
        embeds: [
          {
            author: {
              name: '🍿 Yuk Kita Nonton - Report',
              icon_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=150&h=150&q=80'
            },
            title: '🚨 NEW REPORT',
            description: embedDescription,
            color: getCategoryColor(category),
            thumbnail: {
              url: 'https://yknmovies.diaww.my.id/logo.png'
            },
            footer: {
              text: 'Yuk Kita Nonton Logs • Sistem Tiket Otomatis',
              icon_url: 'https://yknmovies.diaww.my.id/logo.png'
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatus('success');
        setDescription('');
        setMovieTitle('');
      } else {
        throw new Error('Webhook rejected payload');
      }
    } catch (error) {
      console.error('Failed to submit report to Discord:', error);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setCategory('broken');
    setMovieTitle(defaultMovieTitle);
    setDescription('');
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
            className="absolute inset-0 bg-black/85 backdrop-blur-xl pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-[#0c0c0c]/95 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(229,9,20,0.18),0_10px_50px_rgba(0,0,0,0.8)] z-10 pointer-events-auto flex flex-col"
          >
            {/* Top Gradient Border */}
            <div className="h-1.5 w-full bg-gradient-to-r from-netflix-red via-red-600 to-amber-500 shrink-0" />

            {/* Header */}
            <div className="relative p-8 pb-6 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-netflix-red/20 to-red-600/5 border border-netflix-red/30 flex items-center justify-center text-netflix-red shadow-[0_0_20px_rgba(229,9,20,0.15)] shrink-0">
                  <AlertTriangle size={22} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black font-outfit text-white tracking-tight leading-tight">
                    {t('report_title', 'Laporkan Masalah')}
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    {t('report_subtitle', 'Bantu kami meningkatkan kualitas layanan YKN 🍿')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-netflix-red hover:border-netflix-red transition-all duration-300 group cursor-pointer shrink-0"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 text-center space-y-6"
                  >
                    <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                      <CheckCircle2 size={44} className="animate-bounce" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black font-outfit text-white leading-tight">
                        {t('report_success', 'Laporan berhasil dikirim!')}
                      </h3>
                      <p className="text-sm text-zinc-400 font-bold max-w-sm mx-auto leading-relaxed">
                        {t('report_success_desc', 'Terima kasih banyak atas bantuan Anda. Tim kami akan segera memeriksanya.')}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-10 py-4 bg-white hover:bg-zinc-200 text-black font-black font-outfit rounded-2xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] cursor-pointer"
                    >
                      {t('close', 'Tutup')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Category Selector */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[3px] text-zinc-500">
                        {t('report_category', 'Kategori')}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {CATEGORY_OPTIONS.map(opt => {
                          const isSelected = category === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCategory(opt.id)}
                              className={`text-left py-3 sm:py-3.5 px-3.5 sm:px-4 rounded-2xl text-[11px] sm:text-xs leading-tight font-black font-outfit transition-all duration-300 border cursor-pointer select-none ${isSelected
                                ? 'bg-gradient-to-br from-netflix-red to-red-700 border-netflix-red text-white shadow-[0_0_25px_rgba(229,9,20,0.3)] scale-[1.02]'
                                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/15 hover:scale-[1.01]'
                                }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Movie/Series Title (Optional) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[3px] text-zinc-500 block">
                        {t('report_movie_title', 'Judul Film/Series (Opsional)')}
                      </label>
                      <input
                        type="text"
                        value={movieTitle}
                        onChange={e => setMovieTitle(e.target.value)}
                        placeholder={t('report_placeholder_movie', 'contoh: Toy Story 5')}
                        className="w-full bg-black/30 border border-white/10 focus:border-netflix-red focus:shadow-[0_0_15px_rgba(229,9,20,0.15)] focus:ring-0 outline-none rounded-2xl py-3.5 px-4 text-sm text-white placeholder-white/20 transition-all duration-300 font-bold"
                      />
                    </div>

                    {/* Description Text Area */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[3px] text-zinc-500 block">
                        {t('report_desc', 'Deskripsi Masalah')}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder={t('report_placeholder_desc', 'Jelaskan masalah secara detail (contoh: Server 1 macet, suara tidak keluar)...')}
                        className="w-full bg-black/30 border border-white/10 focus:border-netflix-red focus:shadow-[0_0_15px_rgba(229,9,20,0.15)] focus:ring-0 outline-none rounded-2xl py-3.5 px-4 text-sm text-white placeholder-white/20 transition-all duration-300 leading-relaxed font-bold resize-none animate-none"
                      />
                    </div>

                    {/* Error State */}
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500"
                      >
                        <AlertCircle size={18} className="shrink-0" />
                        <p className="text-xs font-bold">{t('report_error', 'Gagal mengirim laporan. Silakan coba lagi.')}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={status === 'submitting' || !description.trim()}
                      className="w-full py-4 bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-black font-outfit text-white text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(229,9,20,0.35)] hover:shadow-[0_12px_40px_rgba(229,9,20,0.55)] transition-all duration-300 transform active:scale-95 mt-6 cursor-pointer"
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('report_submitting', 'Mengirim...')}</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>{t('report_submit', 'Kirim Laporan')}</span>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
