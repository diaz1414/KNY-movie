import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Globe, ArrowLeft } from 'lucide-react';

const Restricted: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[11000] bg-black flex flex-col items-center justify-center overflow-hidden font-outfit select-none">
      {/* 1. CINEMATIC BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.2)_0%,black_70%)]" />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -100 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              y: [0, 1000],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
            className="absolute w-px h-20 bg-gradient-to-b from-red-600 to-transparent"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* 2. MAIN CONTENT CARD */}
      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-3xl">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="mb-10"
        >
          <div className="relative flex items-center justify-center">
            <Globe className="text-white/5 w-40 h-40 md:w-56 md:h-56 animate-spin-slow" />
            <ShieldAlert className="absolute text-red-600 w-20 h-20 md:w-32 md:h-32 drop-shadow-[0_0_35px_rgba(229,9,20,0.9)]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 mb-2">
            <p className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px]">
              Geographical Restriction Active
            </p>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight">
            Region <span className="text-red-600">Locked</span>
          </h1>
          
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
              Maaf, akses ke region ini dibatasi secara geografis. Konten tidak tersedia untuk lokasi Anda saat ini.
            </p>
            <p className="text-zinc-500 text-sm font-semibold italic">
              (Gunakan VPN dengan lokasi yang sesuai atau kembali ke wilayah asal Anda)
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-14"
        >
          <a 
            href="https://yknmovies.diaww.my.id"
            className="group flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-500 hover:shadow-[0_0_50px_rgba(229,9,20,0.4)] active:scale-95"
          >
            <ArrowLeft className="group-hover:-translate-x-2 transition-transform duration-300" size={24} />
            Back to Home
          </a>
        </motion.div>
      </div>

      {/* 3. SUBTLE OVERLAYS */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Restricted;
