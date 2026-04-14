import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden font-outfit select-none">
      {/* Cinematic Background Ribbons */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ perspective: '1000px' }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ z: -500, opacity: 0 }}
            animate={{ 
              z: [ -500, 1000 ], 
              opacity: [ 0, 0.3, 0 ] 
            }}
            transition={{ 
              duration: 4 + Math.random() * 2, 
              delay: i * 0.2,
              ease: "linear",
              repeat: Infinity
            }}
            className="absolute w-[1px] h-full bg-red-600/40 blur-sm"
            style={{ 
              left: (i * 7) + '%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-lg">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8"
        >
          <h1 className="text-[12rem] md:text-[18rem] font-black leading-none text-red-600/20 tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <AlertCircle size={80} className="text-red-600 animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
            Lost in Space?
          </h2>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium leading-relaxed">
            The page you are looking for has drifted away. <br className="hidden md:block" /> Let's get you back to the main ship.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12"
        >
          <Link
            to="/"
            className="group relative flex items-center gap-3 px-10 py-4 bg-red-600 border border-red-500 text-white font-black uppercase tracking-widest overflow-hidden transition-all hover:bg-red-700 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <Home size={20} />
            Back to Home
          </Link>
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.1)_0%,black_80%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default NotFound;
