import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, ShieldCheck, Zap, Share, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const YKNInstallBanner: React.FC = () => {
  const { t } = useTranslation();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  if (isInstalled) return null;

  return (
    <section className="relative py-24 px-[var(--container-padding)] overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-netflix-red/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Left Side: Cinematic IG-Style Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative w-full lg:w-1/2 aspect-square rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(229,9,20,0.3)] group"
        >
          <img
            src="/ykn-app-promo.png"
            alt="Official YKN App"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

          {/* Floating Feature Badges */}
          <div className="absolute top-10 right-10 flex flex-col gap-4">
            <div className="px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-3">
              <ShieldCheck size={18} className="text-netflix-red" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest">{t('badge_safe_secure', { defaultValue: 'Safe & Secure' })}</span>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-3">
              <Zap size={18} className="text-yellow-400" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest">{t('badge_ultra_fast', { defaultValue: 'Ultra Fast' })}</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Persuasive Copy */}
        <div className="w-full lg:w-1/2 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-netflix-red/20 text-netflix-red text-xs font-black uppercase tracking-[4px] border border-netflix-red/30"
          >
            <Smartphone size={14} /> {t('app_promo_badge')}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black font-outfit text-white leading-[1.1] tracking-tighter"
          >
            {t('app_promo_title_1')} <br />
            {t('app_promo_title_2').includes('Kini') ? (
              <>Kini <span className="text-netflix-red">Tersedia.</span></>
            ) : (
              <><span className="text-netflix-red">Now</span> Available.</>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium"
          >
            {t('app_promo_desc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            {isIOS ? (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-12 py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-4 hover:bg-netflix-red hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-white/5 uppercase tracking-widest text-sm w-full sm:w-auto"
              >
                <Share size={20} /> {t('app_promo_btn_iphone')}
              </button>
            ) : (
              <a
                href="/ykn-app5.apk"
                download="YKN-Movie.apk"
                className="px-12 py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-4 hover:bg-netflix-red hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-white/5 uppercase tracking-widest text-sm"
              >
                <Download size={20} /> {t('app_promo_btn_apk')}
              </a>
            )}
          </motion.div>

          {/* iOS Special Guide */}
          <AnimatePresence>
            {showIOSGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Info size={16} /> {t('app_promo_ios_title')}
                  </h4>
                  <button onClick={() => setShowIOSGuide(false)} className="text-zinc-500 hover:text-white">{t('close', { defaultValue: 'Close' })}</button>
                </div>
                <div className="space-y-3 text-sm text-zinc-300 font-medium">
                  <p className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">1</span>
                    {t('app_promo_ios_step1')} <Share size={14} className="inline mx-1" />
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">2</span>
                    {t('app_promo_ios_step2')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-10 border-t border-white/5">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[3px]">
              {t('app_promo_footer')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YKNInstallBanner;
