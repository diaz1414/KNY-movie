import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Mail, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <PageLayout
      title="Contact Support"
      subtitle="Need help? Our team is ready to assist you at any time through our official channels below."
    >
      <div className="max-w-4xl mx-auto py-10">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter">Talk to Us</h2>
          <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto">
            We value every piece of feedback and every question. Choose the communication channel that's most convenient for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Email Card */}
          <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-netflix-red/10 blur-[60px] rounded-full group-hover:bg-netflix-red/20 transition-all" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-netflix-red/10 flex items-center justify-center text-netflix-red shadow-2xl shadow-red-900/20">
                <Mail size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[6px] text-netflix-red">Official Email</p>
                <p className="text-2xl font-bold font-outfit">support@diaww.my.id</p>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Send technical questions or partnership inquiries to our official email.
              </p>
            </div>
          </div>

          {/* Telegram Card */}
          <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-blue-600/5 hover:scale-[1.02] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full group-hover:bg-blue-600/20 transition-all" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-900/20">
                <MessageCircle size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[6px] text-blue-400">Live Chat</p>
                <p className="text-2xl font-bold font-outfit">@KNYMovies</p>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Faster response via Telegram. Our admin team is active 24/7 for you.
              </p>
              <a
                href="https://t.me/KNYMovies"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-blue-900/40"
              >
                Chat Now
              </a>
            </div>
          </div>
        </div>

        {/* Global Support info */}
        <div className="mt-20 p-8 rounded-3xl border border-dashed border-white/10 text-center">
          <p className="text-[var(--text-muted)] text-sm italic">
            "We are committed to providing the best streaming experience. Our average response time is under 6 hours."
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
