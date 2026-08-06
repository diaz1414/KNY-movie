import React, { useEffect, useState, useMemo, useTransition } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MatchSchedule from '../components/live/MatchSchedule';
import ChannelCard from '../components/live/ChannelCard';
import { getLiveSportsData, type PlayableStream } from '../services/streamService';
import { 
  Tv, 
  Zap, 
  Radio, 
  Search, 
  Sparkles, 
  Compass, 
  Loader2, 
  Play 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const HUB_STRIP_ITEMS = [
  'Live TV',
  'Sports',
  'News',
  'Entertainment',
  'Multi Server',
  'Mobile Ready',
  'Low Buffer',
  'Status Monitor',
];

const HUB_STRIP = [...HUB_STRIP_ITEMS, ...HUB_STRIP_ITEMS];

const HERO_FEATURES = [
  { icon: Play, label: 'Live TV 24 Jam' },
  { icon: Compass, label: 'Server Cadangan' },
  { icon: Sparkles, label: 'Jadwal Update' },
];

const LiveSports: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Detect active tab from query parameters
  const activeTab = searchParams.get('tab') || 'home';

  // Smooth scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [sportsTv, setSportsTv] = useState<PlayableStream[]>([]);
  const [liveTv, setLiveTv] = useState<PlayableStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'sports' | 'general'>('sports');
  const [viewerCounts, setViewerCounts] = useState<Record<string, number>>({});
  const [, startTransition] = useTransition();

  // Periodic fallback viewer tracking from WebSocket monitoring API
  useEffect(() => {
    const fetchFallbackViewers = async () => {
      try {
        const envVal = import.meta.env.VITE_BOT_API_URL;
        const apiBase = envVal === '/api' ? '' : (envVal || 'https://api.ykn.my.id');
        const res = await axios.get<any[]>(`${apiBase}/api/sports/monitoring`);

        const mapping: Record<string, number> = {};
        if (Array.isArray(res.data)) {
          res.data.forEach((room: any) => {
            if (room && room.roomId) {
              mapping[room.roomId] = room.viewers;
            }
          });
        }
        setViewerCounts(mapping);
      } catch (err) {
        console.warn('[Viewer Tracking Fallback] Failed to fetch websocket monitoring data:', err);
      }
    };

    fetchFallbackViewers();
    const interval = setInterval(fetchFallbackViewers, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load stream data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getLiveSportsData();
        setSportsTv(data.sportsTv);
        setLiveTv(data.liveTv);
      } catch (err) {
        console.error('Error loading live sports configs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChannelClick = (id: string) => {
    navigate(`/watch?live=${id}`);
  };

  // Filter channels based on search and selected sub tab
  const filteredChannels = useMemo(() => {
    const list = activeSubTab === 'sports' ? sportsTv : liveTv;
    if (!searchTerm.trim()) return list;
    return list.filter(ch => ch.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sportsTv, liveTv, activeSubTab, searchTerm]);

  const switchTab = (tabName: string) => {
    startTransition(() => {
      setSearchParams({ tab: tabName });
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      <Navbar />

      {/* Marquee Info Bar */}
      <div className="pt-24 select-none overflow-hidden bg-black/40 border-b border-white/5 py-3 shadow-lg">
        <div className="flex animate-marquee gap-8 items-center whitespace-nowrap">
          {HUB_STRIP.map((item, idx) => (
            <div key={`${item}-${idx}`} className="flex items-center gap-2 px-2 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-netflix-red shadow-[0_0_10px_rgba(229,9,20,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full space-y-10 px-4 md:px-8 py-10">
        
        {/* Navigation Tabs Header */}
        <div className="flex justify-center md:justify-start gap-3 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
          <button
            onClick={() => switchTab('home')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-netflix-red text-white shadow-lg shadow-red-900/30'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Radio size={14} />
            Beranda
          </button>
          <button
            onClick={() => switchTab('channels')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-netflix-red text-white shadow-lg shadow-red-900/30'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Tv size={14} />
            Saluran TV
          </button>
          <button
            onClick={() => switchTab('live')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-netflix-red text-white shadow-lg shadow-red-900/30'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Zap size={14} />
            Live Center
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Premium Hero Banner */}
              <section className="relative min-h-[300px] md:min-h-[400px] rounded-3xl overflow-hidden group shadow-2xl border border-white/5">
                {/* Background overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-[#080808]/40" />

                {/* Simulated BG banner - stylish background pattern */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 bg-radial-gradient from-netflix-red/30 to-transparent pointer-events-none" />

                <div className="relative z-20 flex min-h-[300px] md:min-h-[400px] flex-col justify-end p-8 md:p-12 select-none max-w-3xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-netflix-red/25 bg-black/60 px-3.5 py-1.5 text-netflix-red shadow-lg backdrop-blur-xl">
                    <Radio size={12} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Live TV Hub</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-outfit font-black leading-none mb-4 tracking-tighter uppercase italic text-white">
                    YKN <span className="text-netflix-red inline-block pr-2">SPORTS</span>
                  </h2>
                  <p className="text-sm md:text-base text-zinc-400 font-bold leading-relaxed">
                    Jadwal pertandingan, saluran olahraga premium, berita sepak bola, dan hiburan live terupdate di device kamu.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => switchTab('channels')}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-netflix-red hover:bg-red-700 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <Tv size={14} />
                      Buka Saluran
                    </button>
                    <button
                      onClick={() => switchTab('live')}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-6 py-3 text-xs font-black uppercase tracking-widest text-white backdrop-blur-xl transition-all hover:bg-white/[0.12] active:scale-95 cursor-pointer"
                    >
                      <Zap size={14} />
                      Live Center
                    </button>
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {HERO_FEATURES.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 backdrop-blur-md">
                          <Icon size={14} className="text-netflix-red" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Match Schedule List */}
              <MatchSchedule viewerCounts={viewerCounts} />
            </motion.div>
          )}

          {activeTab === 'channels' && (
            <motion.div
              key="tab-channels"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Category tabs and Search bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-netflix-red border border-white/5 shadow-md">
                    <Tv size={20} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-outfit font-black uppercase tracking-tighter italic leading-none">Saluran TV</h3>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Siaran Langsung 24 Jam</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Category switcher */}
                  <div className="flex p-1 bg-white/[0.02] border border-white/5 rounded-xl select-none">
                    <button
                      onClick={() => setActiveSubTab('sports')}
                      className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeSubTab === 'sports'
                          ? 'bg-netflix-red text-white shadow-md'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      Olahraga
                    </button>
                    <button
                      onClick={() => setActiveSubTab('general')}
                      className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeSubTab === 'general'
                          ? 'bg-netflix-red text-white shadow-md'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      Hiburan
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type="text"
                      placeholder="Cari saluran..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-netflix-red/60 transition-all placeholder:text-zinc-600 w-full sm:w-[220px]"
                    />
                  </div>
                </div>
              </div>

              {/* Grid content */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="text-netflix-red animate-spin" size={36} />
                  <p className="text-zinc-500 font-black uppercase tracking-[0.15em] text-[10px]">Memuat Saluran TV...</p>
                </div>
              ) : filteredChannels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredChannels.map((stream) => (
                    <ChannelCard
                      key={stream.id}
                      stream={stream}
                      onClick={() => handleChannelClick(stream.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-white/[0.01] border border-white/5 rounded-3xl">
                  <p className="text-zinc-500 text-lg font-black uppercase italic tracking-wider">Tidak Ada Saluran</p>
                  <button onClick={() => setSearchTerm('')} className="text-netflix-red font-black mt-2 text-xs uppercase tracking-wider hover:underline cursor-pointer">Bersihkan Pencarian</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div
              key="tab-live"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <section className="rounded-3xl border border-white/5 bg-zinc-950/70 p-6 md:p-8 shadow-xl backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-netflix-red/25 bg-netflix-red/10 px-3 py-1 text-netflix-red">
                      <Radio size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Live Center</span>
                    </div>
                    <h2 className="font-outfit text-3xl font-black uppercase italic tracking-tight text-white sm:text-4xl">
                      Pantau Siaran Aktif
                    </h2>
                    <p className="mt-3 text-sm font-bold leading-relaxed text-zinc-400">
                      Jadwal pertandingan live dan channels penyiaran langsung dapat dipantau di sini secara real-time.
                    </p>
                  </div>
                  <button
                    onClick={() => switchTab('channels')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/[0.12] active:scale-95 cursor-pointer"
                  >
                    <Tv size={15} />
                    Saluran TV
                  </button>
                </div>
              </section>
              <MatchSchedule viewerCounts={viewerCounts} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
};

export default LiveSports;
