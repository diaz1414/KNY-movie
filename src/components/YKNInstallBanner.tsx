import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, ShieldCheck, Zap, Share, Info } from 'lucide-react';

const YKNInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    // Logic for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert("Browser Anda belum mendukung instalasi otomatis ini. Silakan gunakan menu browser 'Instal Aplikasi' atau 'Add to Home Screen'.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
    }
  };

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
                <span className="text-white font-black text-[10px] uppercase tracking-widest">Safe & Secure</span>
             </div>
             <div className="px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-3">
                <Zap size={18} className="text-yellow-400" />
                <span className="text-white font-black text-[10px] uppercase tracking-widest">Ultra Fast</span>
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
             <Smartphone size={14} /> Official Mobile App
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black font-outfit text-white leading-[1.1] tracking-tighter"
          >
            Streaming Premium <br/>
            Kini Dalam <span className="text-netflix-red">Genggaman.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium"
          >
            Nikmati akses instan ke seluruh library film dan serial YKN langsung dari layar utama HP Anda. Lebih cepat, lebih ringan, dan pengalaman layar penuh tanpa gangguan bar browser.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <button 
              onClick={handleInstallClick}
              className="px-12 py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-4 hover:bg-netflix-red hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-white/5 uppercase tracking-widest text-sm"
            >
              <Download size={20} /> Pasang Sekarang
            </button>
            
            <div className="flex items-center gap-4 px-2">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-black">U{i}</div>
                ))}
              </div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                <span className="text-white">10K+</span> Users Installed<br/>
                This Week Alone
              </p>
            </div>
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
                    <Info size={16} /> Khusus Pengguna iPhone (iOS)
                  </h4>
                  <button onClick={() => setShowIOSGuide(false)} className="text-zinc-500 hover:text-white">utup</button>
                </div>
                <div className="space-y-3 text-sm text-zinc-300 font-medium">
                  <p className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">1</span>
                    Klik tombol <b>Share</b> <Share size={14} className="inline mx-1" /> di bar bawah Safari.
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">2</span>
                    Cari dan pilih menu <b>'Add to Home Screen'</b>.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-10 border-t border-white/5">
             <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[3px]">
               Optimized for Android & iOS Global Version
             </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YKNInstallBanner;
