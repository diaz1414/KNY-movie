import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Mail, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <PageLayout 
      title="Contact Support" 
      subtitle="Have questions about your account or experiencing technical issues? Our team is here to help you 24/7."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Contact Information */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-black font-outfit tracking-tighter">Get in Touch</h2>
            <p className="text-[var(--text-secondary)]">
              Choose your preferred way to contact us. Whether it's a quick question or a technical deep-dive, we're ready to assist.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-netflix-red/10 flex items-center justify-center text-netflix-red group-hover:scale-110 transition-transform">
                <Mail size={28} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-netflix-red mb-1">Email us</p>
                <p className="text-xl font-bold">support@kny-movie.com</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <MessageCircle size={28} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">Live Chat</p>
                <p className="text-xl font-bold">Telegram @KNYSupport</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <MapPin size={28} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-1">Location</p>
                <p className="text-xl font-bold">Global / Remote Support</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <p className="relative z-10 text-sm font-medium text-[var(--text-muted)] italic">
               "Our average response time for support tickets is under 6 hours. We value your time."
             </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="relative">
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/20 backdrop-blur-xl rounded-3xl text-center space-y-4 p-8 border border-white/10"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                <Send size={40} />
              </div>
              <h3 className="text-2xl font-bold">Message Sent!</h3>
              <p className="text-[var(--text-secondary)]">Thank you for reaching out. We'll get back to you shortly.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-netflix-red font-bold text-sm hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">First Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-netflix-red outline-none transition-all"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Last Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-netflix-red outline-none transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-netflix-red outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Message</label>
              <textarea 
                required
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-1 focus:ring-netflix-red outline-none transition-all resize-none"
                placeholder="How can we help you today?"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-netflix-red hover:bg-red-700 text-white font-bold py-5 rounded-xl shadow-xl shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Send size={20} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
