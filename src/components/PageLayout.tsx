import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <Navbar />
      
      {/* Immersive Background Elements (Apple TV+ / Disney+ style) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-netflix-red/10 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[140px] opacity-30" />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-[var(--container-padding)] max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-16 text-center md:text-left">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-black font-outfit tracking-tighter mb-4"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-2xl"
            >
              {subtitle}
            </motion.p>
          )}
        </header>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass rounded-3xl border border-[var(--glass-border)] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-20"
        >
          {/* Internal Glow Effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="relative z-10 prose prose-invert prose-lg max-w-none">
            {children}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PageLayout;
