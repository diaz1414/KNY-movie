import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle, VideoOff, Captions, Info, MessageSquare } from 'lucide-react';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1515291219507286046/90JL5ZcjFFJhVQJYjO6Fz70oh4ohFDzihR3-KgQR3e-Es1CXiBqaKwBAFXOcD2N1pMu5';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMovieTitle?: string;
}

type Category = 'broken' | 'subtitle' | 'info' | 'other';

const CATEGORY_OPTIONS: {
  id: Category;
  label: string;
  sublabel: string;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: 'broken',   label: 'Video Error',   sublabel: 'Server / Player',  labelKey: 'report_cat_broken', icon: <VideoOff   size={22} strokeWidth={1.5} />, color: '#E50914' },
  { id: 'subtitle', label: 'Subtitle',       sublabel: 'Teks / Sinkron',   labelKey: 'report_cat_sub',    icon: <Captions   size={22} strokeWidth={1.5} />, color: '#F59E0B' },
  { id: 'info',     label: 'Info Salah',     sublabel: 'Judul / Poster',   labelKey: 'report_cat_info',   icon: <Info       size={22} strokeWidth={1.5} />, color: '#3B82F6' },
  { id: 'other',    label: 'Bug / Masukan',  sublabel: 'Saran / Lainnya',  labelKey: 'report_cat_other',  icon: <MessageSquare size={22} strokeWidth={1.5} />, color: '#8B5CF6' },
];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, defaultMovieTitle = '' }) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category>('broken');
  const [movieTitle, setMovieTitle] = useState(defaultMovieTitle);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => { if (!isOpen) handleReset(); }, [isOpen]);

  const activeOpt = CATEGORY_OPTIONS.find(c => c.id === category)!;

  const getDeviceOS = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Linux';
  };

  const getDeviceBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    return 'Unknown';
  };

  const getCategoryColor = (cat: Category) =>
    ({ broken: 15010068, subtitle: 16096779, info: 3900150, other: 9133302 }[cat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setStatus('submitting');
    try {
      const payload = {
        username: 'YKN Report Bot',
        avatar_url: 'https://movies.ykn.my.id/logo.png',
        embeds: [{
          title: `🚨 ${activeOpt.label}`,
          description: [
            '**Konten**',
            '```yaml',
            `Judul    : ${movieTitle.trim() || 'Tidak disebutkan'}`,
            `Kategori : ${activeOpt.label} — ${activeOpt.sublabel}`,
            '```',
            '**Perangkat**',
            '```yaml',
            `OS      : ${getDeviceOS()}`,
            `Browser : ${getDeviceBrowser()}`,
            `URL     : ${window.location.href}`,
            '```',
            '**Deskripsi**',
            '```',
            description.trim(),
            '```',
          ].join('\n'),
          color: getCategoryColor(category),
          footer: { text: 'Yuk Kita Nonton • Report System' },
          timestamp: new Date().toISOString(),
        }],
      };

      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('success');
        setDescription('');
        setMovieTitle('');
      } else throw new Error();
    } catch {
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
        <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-2xl"
          />

          {/* Sheet / Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 32, stiffness: 360 }}
            className="relative w-full sm:max-w-lg bg-[#0d0d0d] sm:rounded-2xl rounded-t-3xl overflow-hidden z-10"
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: `0 -4px 60px rgba(0,0,0,0.8), 0 0 80px ${activeOpt.color}15`,
            }}
          >
            {/* Color accent bar */}
            <motion.div
              className="h-[3px] w-full shrink-0"
              animate={{ background: `linear-gradient(90deg, ${activeOpt.color} 0%, ${activeOpt.color}40 60%, transparent 100%)` }}
              transition={{ duration: 0.3 }}
            />

            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-white/15 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/[0.06]">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  {t('report_title', 'Laporkan Masalah')}
                </h2>
                <p className="text-[11px] text-white/30 font-semibold mt-0.5">
                  Bantu kami perbaiki YKN untuk semua pengguna
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-8 py-6">
              <AnimatePresence mode="wait">

                {/* ─── Success ─── */}
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-14 flex flex-col items-center gap-6 text-center"
                  >
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-green-500/10 border border-green-500/20" />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-green-500/30"
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <CheckCircle2 size={32} className="text-green-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Laporan Terkirim!</h3>
                      <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto leading-relaxed">
                        Terima kasih. Tim kami akan segera memeriksanya.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-10 py-3 bg-white/8 hover:bg-white/12 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all cursor-pointer"
                    >
                      Tutup
                    </button>
                  </motion.div>

                ) : (
                  /* ─── Form ─── */
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-6"
                  >

                    {/* Category */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
                        Kategori
                      </p>
                      <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {CATEGORY_OPTIONS.map(opt => {
                          const isActive = category === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCategory(opt.id)}
                              className="flex flex-col items-center gap-2.5 py-4 px-1 rounded-2xl border transition-all duration-200 cursor-pointer"
                              style={{
                                background: isActive ? `${opt.color}14` : 'rgba(255,255,255,0.02)',
                                borderColor: isActive ? `${opt.color}50` : 'rgba(255,255,255,0.06)',
                                color: isActive ? opt.color : 'rgba(255,255,255,0.25)',
                                boxShadow: isActive ? `0 0 20px ${opt.color}15` : 'none',
                              }}
                            >
                              {opt.icon}
                              <div className="text-center">
                                <div className="text-[9px] font-black uppercase tracking-wide leading-none">
                                  {t(opt.labelKey, opt.label)}
                                </div>
                                <div
                                  className="text-[8px] font-semibold mt-0.5 leading-none"
                                  style={{ color: isActive ? `${opt.color}90` : 'rgba(255,255,255,0.15)' }}
                                >
                                  {opt.sublabel}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
                        Judul Film / Series
                        <span className="text-white/15 normal-case tracking-normal font-medium text-[10px]">— opsional</span>
                      </label>
                      <input
                        type="text"
                        value={movieTitle}
                        onChange={e => setMovieTitle(e.target.value)}
                        placeholder="contoh: Inception, Squid Game S2..."
                        className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-white/25 outline-none rounded-xl py-3.5 px-4 text-sm text-white placeholder-white/15 transition-all duration-200 font-medium"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 block">
                        Deskripsi Masalah
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Jelaskan secara detail... (Server berapa? Apa yang terjadi? Kapan mulai bermasalah?)"
                        className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-white/25 outline-none rounded-xl py-3.5 px-4 text-sm text-white placeholder-white/15 transition-all duration-200 leading-relaxed font-medium resize-none"
                      />
                    </div>

                    {/* Error */}
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-4 py-3.5 bg-red-500/8 border border-red-500/20 rounded-xl"
                      >
                        <AlertCircle size={15} className="text-red-400 shrink-0" />
                        <p className="text-xs text-red-400 font-bold">
                          Gagal mengirim laporan. Silakan coba lagi.
                        </p>
                      </motion.div>
                    )}

                    {/* Submit */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={status === 'submitting' || !description.trim()}
                      className="w-full py-4 rounded-xl font-black text-white text-sm flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest"
                      style={{
                        background: `linear-gradient(135deg, ${activeOpt.color} 0%, ${activeOpt.color}bb 100%)`,
                        boxShadow: !description.trim() ? 'none' : `0 8px 28px ${activeOpt.color}35`,
                      }}
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send size={15} strokeWidth={2} />
                          Kirim Laporan
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
