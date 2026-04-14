import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaGithub, FaTelegram, FaXTwitter } from 'react-icons/fa6';
import { Film } from 'lucide-react';

const Maintenance: React.FC = () => {
  const socialLinks = [
    { icon: <FaInstagram size={24} />, href: 'https://www.instagram.com/', label: 'Instagram' },
    { icon: <FaTelegram size={24} />, href: 'https://t.me/', label: 'Telegram' },
    { icon: <FaXTwitter size={24} />, href: 'https://x.com/', label: 'Twitter' },
    { icon: <FaGithub size={24} />, href: 'https://github.com/diaz1414/', label: 'GitHub' },
  ];

  return (
    <div className="fixed inset-0 z-[11000] bg-black flex flex-col items-center justify-center overflow-hidden font-outfit select-none">
      {/* 1. CINEMATIC BACKGROUND RIBBONS */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ perspective: '1000px' }}>
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ z: -500, opacity: 0 }}
            animate={{
              z: [-500, 1000],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.3,
              ease: "linear",
              repeat: Infinity
            }}
            className="absolute w-[1px] h-full bg-red-600/50 blur-sm"
            style={{
              left: (i * 10) + '%',
            }}
          />
        ))}
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-2xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="text-red-600 w-10 h-10 md:w-16 md:h-16" />
            <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(229,9,20,0.5)]">
              YKN
            </h1>
          </div>

          <div className="h-1 w-24 bg-red-600 mx-auto rounded-full mb-8 animate-pulse" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="space-y-4"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Situs Dalam Pemeliharaan
          </h2>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto">
            Kami sedang melakukan peningkatan performa untuk memberikan pengalaman menonton yang lebih baik. Kami akan segera kembali!
          </p>
        </motion.div>

        {/* 3. SOCIAL LINKS */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 space-y-6"
        >
          <p className="text-white/40 uppercase tracking-[0.4em] text-xs font-black">
            Tetap Terhubung
          </p>
          <div className="flex gap-6 justify-center">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, color: '#E50914' }}
                whileTap={{ scale: 0.9 }}
                className="text-white/60 transition-colors duration-300"
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 4. DYNAMIC GLOW */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.15)_0%,black_70%)] pointer-events-none"
      />

      {/* Film Grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default Maintenance;
