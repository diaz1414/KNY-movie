import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { Trophy, Play, AlertCircle, ArrowLeft, Tv, ShieldAlert, Radio, Calendar, Clock, Film, Share2, Check } from 'lucide-react';
import NetflixLoader from '../components/NetflixLoader';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface StreamServer {
  name: string;
  url: string;
  type: string;
  keyId?: string;
  key?: string;
}

interface PlayableStream {
  id: string;
  name: string;
  subName?: string;
  logo?: string;
  isBase64Logo?: boolean;
  servers: StreamServer[];
  isChannel?: boolean;
  player1?: string;
  player2?: string;
  jadwal_event?: string;
  jadwal_stop?: string;
  deskripsi?: string;
  deskripsi_en?: string;
}

interface MatchEvent {
  id_event: string;
  nama_event: string;
  player_1: string;
  player_2: string;
  logo_1?: string;
  logo_2?: string;
  jadwal_event?: string;
  jadwal_stop?: string;
  url_iptv: string;
  url_license?: string;
  jenis: string;
  deskripsi?: string;
  deskripsi_en?: string;
}

interface ChannelEvent {
  id_iptv: string;
  nama_channel: string;
  url_iptv: string;
  url_license?: string;
  jenis: string;
  gbr_base64?: string;
  tagline?: string;
  premium?: string;
  aktif?: string;
}

const XOR_KEY = '90_NiwmsdfhgjQw';

// Helper to format slug from name
const getSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

// XOR decryption logic reconstructed from the site's library
const decryptLicense = (ciphertext: string): string => {
  try {
    const binary = atob(ciphertext);
    let result = '';
    for (let i = 0; i < binary.length; i++) {
      result += String.fromCharCode(binary.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return result;
  } catch (e) {
    console.error('Decryption failed', e);
    return '';
  }
};

// Obfuscate the DASH URL/DRM Keys for the blogspot player
const encodeV = (url: string, keyId: string, key: string): string => {
  const inner = btoa(url) + ":" + btoa(keyId) + ":" + btoa(key);
  return btoa(btoa(inner));
};

const buildServers = (urlIptv: string, urlLicense: string | undefined, jenis: string): StreamServer[] => {
  const decryptedLicense = urlLicense ? decryptLicense(urlLicense) : '';
  const servers: StreamServer[] = [];

  servers.push({
    name: 'Server 1',
    url: urlIptv,
    type: jenis
  });

  if (decryptedLicense) {
    if (decryptedLicense.includes(':') && !decryptedLicense.startsWith('http')) {
      // It's a DRM key pair (KeyID:Key) -> Update Server 1 with keys
      const [keyId, key] = decryptedLicense.split(':');
      servers[0].keyId = keyId;
      servers[0].key = key;
    } else if (decryptedLicense.startsWith('http')) {
      // It's a second HLS stream URL -> Add as Server 2
      servers.push({
        name: 'Server 2 (Alt)',
        url: decryptedLicense,
        type: 'hls'
      });
    }
  }
  return servers;
};

const getFlagUrl = (countryName: string): string => {
  const countryCodes: Record<string, string> = {
    'Brazil': 'br',
    'Morocco': 'ma',
    'Haiti': 'ht',
    'Scotland': 'gb-sct',
    'Australia': 'au',
    'Turkiye': 'tr',
    'Germany': 'de',
    'Curacao': 'cw',
    'Netherlands': 'nl',
    'Japan': 'jp',
    'Cote d`Ivoire': 'ci',
    'Cote d\'Ivoire': 'ci',
    'Ecuador': 'ec',
    'Sweden': 'se',
    'Tunisia': 'tn',
    'Spain': 'es',
    'Cabo Verde': 'cv',
    'Belgium': 'be',
    'Egypt': 'eg',
    'Saudi Arabia': 'sa',
    'Uruguay': 'uy',
    'IR Iran': 'ir',
    'New Zealand': 'nz',
    'France': 'fr',
    'Senegal': 'sn',
    'Iraq': 'iq',
    'Norway': 'no',
    'Argentina': 'ar',
    'Algeria': 'dz',
    'Austria': 'at',
    'Jordan': 'jo',
    'Portugal': 'pt',
    'DR Congo': 'cd',
    'England': 'gb-eng',
    'Croatia': 'hr',
    'Ghana': 'gh',
    'Panama': 'pa',
    'Uzbekistan': 'uz',
    'Colombia': 'co'
  };

  const code = countryCodes[countryName.trim()];
  if (code) {
    return `https://flagcdn.com/w80/${code}.png`;
  }
  return '';
};

const FlagImage: React.FC<{ countryName: string; className?: string }> = ({ countryName, className = '' }) => {
  const url = getFlagUrl(countryName);
  const sizeClasses = className.includes('w-') ? '' : 'w-14 h-10';
  if (url) {
    return (
      <img
        src={url}
        alt={countryName}
        className={`${sizeClasses} object-cover rounded shadow-md border border-white/10 ${className}`}
      />
    );
  }
  return (
    <div className={`${sizeClasses} bg-white/5 rounded flex items-center justify-center border border-white/10 text-xl select-none ${className}`}>
      ⚽
    </div>
  );
};

const formatJadwal = (jadwalStr?: string, locale: string = 'id'): string => {
  if (!jadwalStr) return '';
  try {
    let safeStr = jadwalStr.trim();
    if (safeStr.includes(' ')) {
      safeStr = safeStr.replace(' ', 'T');
    }
    const match = safeStr.match(/([+-])(\d{2})$/);
    if (match) {
      safeStr = safeStr + ':00';
    }
    const date = new Date(safeStr);
    if (isNaN(date.getTime())) {
      return jadwalStr;
    }
    const localeCode = locale.startsWith('id') ? 'id-ID' : 'en-US';
    return date.toLocaleDateString(localeCode, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (e) {
    return jadwalStr;
  }
};

const getPlayableStatus = (stream: PlayableStream, t: any): { isPlayable: boolean; buttonText: string; status: 'live' | 'upcoming' | 'ended' } => {
  if (stream.isChannel) return { isPlayable: true, buttonText: t('play_now'), status: 'live' };
  if (!stream.jadwal_event) return { isPlayable: true, buttonText: t('play_now'), status: 'live' };

  try {
    let safeStartStr = stream.jadwal_event.trim();
    if (safeStartStr.includes(' ')) {
      safeStartStr = safeStartStr.replace(' ', 'T');
    }
    const startMatch = safeStartStr.match(/([+-])(\d{2})$/);
    if (startMatch) {
      safeStartStr = safeStartStr + ':00';
    }
    const startTime = new Date(safeStartStr).getTime();
    if (isNaN(startTime)) return { isPlayable: true, buttonText: t('play_now'), status: 'live' };

    const now = Date.now();
    const leadTimeMs = 20 * 60 * 1000; // 20 minutes in milliseconds
    const startsIn = startTime - now;

    // 1. Check if the match is in the future and starting in > 20 minutes
    if (startsIn > leadTimeMs) {
      const minsLeft = Math.ceil(startsIn / (60 * 1000));
      if (minsLeft < 60) {
        return {
          isPlayable: false,
          buttonText: t('starts_in_mins', { count: minsLeft }),
          status: 'upcoming'
        };
      } else {
        const hoursLeft = Math.floor(minsLeft / 60);
        return {
          isPlayable: false,
          buttonText: t('starts_in_hours', { count: hoursLeft }),
          status: 'upcoming'
        };
      }
    }

    // 2. Check if the match has ended
    if (stream.jadwal_stop) {
      let safeStopStr = stream.jadwal_stop.trim();
      if (safeStopStr.includes(' ')) {
        safeStopStr = safeStopStr.replace(' ', 'T');
      }
      const stopMatch = safeStopStr.match(/([+-])(\d{2})$/);
      if (stopMatch) {
        safeStopStr = safeStopStr + ':00';
      }
      const stopTime = new Date(safeStopStr).getTime();
      if (!isNaN(stopTime) && now > stopTime) {
        return { isPlayable: true, buttonText: t('match_ended'), status: 'ended' };
      }
    } else {
      // Fallback: 3 hours default duration
      const threeHoursMs = 3 * 60 * 60 * 1000;
      if (now > startTime + threeHoursMs) {
        return { isPlayable: true, buttonText: t('match_ended'), status: 'ended' };
      }
    }

    // 3. Otherwise: Live & Playable!
    return { isPlayable: true, buttonText: t('play_now'), status: 'live' };
  } catch (e) {
    return { isPlayable: true, buttonText: t('play_now'), status: 'live' };
  }
};

const cleanDescription = (desc?: string): string => {
  if (!desc) return '';
  let cleaned = desc.replace(/\s*(?:on|di)?\s*Duktek Sports?\s*\d{4}[\/-]\d{2}[\/-]\d{2}\s+\d{2}:\d{2}(?:\s+GMT[+-]\d{2})?/gi, '');
  cleaned = cleaned.replace(/Duktek Sports?/gi, '');
  return cleaned.trim();
};

const ChannelCard: React.FC<{
  item: PlayableStream;
  activeTab: string;
  selectStream: (stream: PlayableStream, tab?: any) => void;
  setSidebarTab: (tab: any) => void;
  t: any;
}> = ({ item, activeTab, selectStream, t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = getSlug(item.name);
    const url = `${window.location.origin}${window.location.pathname}?channel=${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -6 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', damping: 18, stiffness: 220 }}
      onClick={() => {
        selectStream(item, activeTab);
      }}
      className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl bg-[#141414] border border-white/5 transition-all duration-300 w-full aspect-[2/3]"
    >
      {/* Absolute Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/stadium_pitch_bg.png"
          alt=""
          className="w-full h-full object-cover opacity-20 group-hover:scale-105 group-hover:opacity-35 transition-all duration-500"
        />
        {/* YKN Watermark Logo like Navbar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-500">
          <div className="flex items-center gap-3 text-white">
            <Film className="w-16 h-16 text-netflix-red" />
            <span className="text-5xl font-black tracking-tighter uppercase font-outfit">YKN</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Red Pulsing Live Badge */}
      <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md border border-netflix-red/30 text-netflix-red text-[10px] font-black px-3 py-2 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-netflix-red animate-pulse" />
        LIVE
      </div>

      {/* Share / Copy Link Button */}
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 z-30 w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red hover:border-netflix-red hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer flex items-center justify-center"
        title={copied ? t('copied') : t('copy_link')}
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
      </button>

      {/* Brand Logo Hero Element */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 select-none">
        {item.isBase64Logo && item.logo ? (
          <img
            src={item.logo}
            alt={item.name}
            className="w-[80%] object-contain filter brightness-110 contrast-105 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <Tv size={64} className="text-zinc-400 transition-colors group-hover:text-netflix-red" />
        )}
      </div>

      {/* Mobile Title View (Always visible on mobile) */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent md:hidden z-10">
        <h4 className="text-white text-xs font-bold leading-tight truncate">
          {item.name}
        </h4>
        <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider truncate mt-0.5">
          {item.subName}
        </p>
      </div>

      {/* Desktop Hover Overlay (Slides up on desktop hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-500 hidden md:flex flex-col justify-end p-6 gap-3.5 z-10">
        <h4 className="text-white text-lg font-black leading-tight font-outfit drop-shadow-md transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
          {item.name}
        </h4>

        <div className="flex justify-between items-center transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out delay-75">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider truncate max-w-[200px]">
            {item.subName}
          </p>
          <span className="text-[10px] uppercase font-black bg-netflix-red text-white px-2.5 py-1 rounded-sm tracking-wider shadow-lg">
            TV
          </span>
        </div>

        <div className="flex items-center gap-2.5 pt-1 transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out delay-150">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:scale-105 transition-transform">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-wider">{t('play_channel')}</span>
        </div>
      </div>
    </motion.div>
  );
};

const MatchCard: React.FC<{
  item: PlayableStream;
  selectStream: (stream: PlayableStream, tab?: any) => void;
  setSidebarTab: (tab: any) => void;
  t: any;
  i18n: any;
}> = ({ item, selectStream, t, i18n }) => {
  const { isPlayable, buttonText, status } = getPlayableStatus(item, t);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = getSlug(item.name);
    const url = `${window.location.origin}${window.location.pathname}?match=${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -6 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', damping: 18, stiffness: 220 }}
      onClick={() => {
        selectStream(item, 'events');
      }}
      className="relative group rounded-2xl overflow-hidden shadow-2xl bg-[#141414] border border-white/5 transition-all duration-300 w-full aspect-[2/3] cursor-pointer"
    >
      {/* Absolute Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/stadium_pitch_bg.png"
          alt=""
          className="w-full h-full object-cover opacity-25 group-hover:scale-105 group-hover:opacity-40 transition-all duration-500"
        />
        {/* YKN Watermark Logo like Navbar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-500">
          <div className="flex items-center gap-3 text-white">
            <Film className="w-16 h-16 text-netflix-red" />
            <span className="text-5xl font-black tracking-tighter uppercase font-outfit">YKN</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Top Status Badge */}
      <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md text-[10px] md:text-xs font-black px-3 py-2 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20 select-none">
        {status === 'live' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-500">{t('live_now')}</span>
          </>
        )}
        {status === 'upcoming' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-500">{t('upcoming')}</span>
          </>
        )}
        {status === 'ended' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="text-zinc-500">{t('match_ended')}</span>
          </>
        )}
      </div>

      {/* Share / Copy Link Button */}
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 z-30 w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-netflix-red hover:border-netflix-red hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer flex items-center justify-center"
        title={copied ? t('copied') : t('copy_link')}
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
      </button>

      {/* Flag / Matchup Hero graphic */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center p-6 select-none gap-8 pb-20">
        <div className="flex items-center gap-4 justify-center w-full">
          <div className="flex flex-col items-center gap-2">
            <FlagImage countryName={item.player1 || ''} className="w-20 h-14 md:w-24 md:h-16 shadow-xl border border-white/10" />
            <span className="text-xs md:text-sm font-black text-zinc-300 max-w-[120px] truncate text-center mt-2">
              {item.player1}
            </span>
          </div>
          <span className="text-sm md:text-base font-black text-netflix-red font-outfit uppercase tracking-widest mt-[-20px]">
            VS
          </span>
          <div className="flex flex-col items-center gap-2">
            <FlagImage countryName={item.player2 || ''} className="w-20 h-14 md:w-24 md:h-16 shadow-xl border border-white/10" />
            <span className="text-xs md:text-sm font-black text-zinc-300 max-w-[120px] truncate text-center mt-2">
              {item.player2}
            </span>
          </div>
        </div>

        {item.jadwal_event && (
          <div className="flex items-center gap-2 text-zinc-300 text-[10px] md:text-xs font-bold bg-black/60 border border-white/10 py-2 px-4 rounded-xl backdrop-blur-md shadow-lg">
            <Clock size={13} className="text-netflix-red shrink-0" />
            <span>{formatJadwal(item.jadwal_event, i18n.language)}</span>
          </div>
        )}
      </div>

      {/* Mobile Title View (Always visible on mobile) */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent md:hidden z-10">
        <h4 className="text-white text-xs font-bold leading-tight truncate">
          {item.name}
        </h4>
        <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider truncate mt-0.5">
          {item.subName}
        </p>
      </div>

      {/* Desktop Hover Overlay (Slides up on desktop hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-500 hidden md:flex flex-col justify-end p-6 gap-3.5 z-10">
        <h4 className="text-white text-lg font-black leading-tight font-outfit drop-shadow-md transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
          {item.name}
        </h4>

        <div className="flex justify-between items-center transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out delay-75">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider truncate max-w-[200px]">
            {item.subName}
          </p>
          <span className="text-[10px] uppercase font-black bg-netflix-red text-white px-2.5 py-1 rounded-sm tracking-wider shadow-lg">
            LIVE
          </span>
        </div>

        {/* Action Description / Countdown / Button */}
        <div className="flex items-center gap-2.5 pt-1 transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 ease-out delay-150">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isPlayable ? 'bg-white text-black hover:scale-105' : 'bg-zinc-800 text-zinc-500'
            }`}>
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
          <span className={`text-sm font-bold uppercase tracking-wider ${isPlayable ? 'text-white' : 'text-zinc-500'}`}>
            {buttonText}
          </span>
        </div>
      </div>
    </motion.div>
  );
};


// Countdown component for upcoming matches
const MatchCountdown: React.FC<{ targetTime: string; onComplete?: () => void }> = ({ targetTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    let safeStartStr = targetTime.trim();
    if (safeStartStr.includes(' ')) {
      safeStartStr = safeStartStr.replace(' ', 'T');
    }
    const startMatch = safeStartStr.match(/([+-])(\d{2})$/);
    if (startMatch) {
      safeStartStr = safeStartStr + ':00';
    }
    const kickoffTime = new Date(safeStartStr).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = kickoffTime - now;

      if (diff <= 0) {
        if (onComplete) onComplete();
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours: hrs, minutes: mins, seconds: secs });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  if (!timeLeft) return null;

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex gap-2.5 md:gap-6 justify-center items-center font-outfit select-none my-1 md:my-2">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 text-sm sm:w-12 sm:h-12 sm:text-lg md:w-16 md:h-16 md:text-3xl bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center font-black text-white shadow-lg backdrop-blur-md">
          {pad(timeLeft.hours)}
        </div>
        <span className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Hours</span>
      </div>
      <span className="text-base md:text-2xl font-black text-netflix-red animate-pulse">:</span>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 text-sm sm:w-12 sm:h-12 sm:text-lg md:w-16 md:h-16 md:text-3xl bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center font-black text-white shadow-lg backdrop-blur-md">
          {pad(timeLeft.minutes)}
        </div>
        <span className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Minutes</span>
      </div>
      <span className="text-base md:text-2xl font-black text-netflix-red animate-pulse">:</span>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 text-sm sm:w-12 sm:h-12 sm:text-lg md:w-16 md:h-16 md:text-3xl bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center font-black text-white shadow-lg backdrop-blur-md">
          {pad(timeLeft.seconds)}
        </div>
        <span className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Seconds</span>
      </div>
    </div>
  );
};

// Share button component for the Player View
const PlayerShareButton: React.FC<{ stream: PlayableStream; t: any }> = ({ stream, t }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const slug = getSlug(stream.name);
    const param = stream.isChannel ? `channel=${slug}` : `match=${slug}`;
    const url = `${window.location.origin}${window.location.pathname}?${param}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer text-white shrink-0"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-500" />
          <span>{t('copied')}</span>
        </>
      ) : (
        <>
          <Share2 size={14} />
          <span>{t('share')}</span>
        </>
      )}
    </button>
  );
};

const LiveSports: React.FC = () => {
  const { t, i18n } = useTranslation();

  const { scrollY } = useScroll();

  // Background transform: translate slowly, scale up slightly, fade, blur
  const yBg = useTransform(scrollY, [0, 800], [0, 320]);
  const scaleBg = useTransform(scrollY, [0, 800], [1.05, 1.25]);
  const opacityBg = useTransform(scrollY, [0, 600], [1, 0]);
  const blurValue = useTransform(scrollY, [0, 600], [0, 16]);
  const filterBg = useTransform(blurValue, (v) => `blur(${v}px)`);

  // Content transform: translate faster, fade out sooner
  const yContent = useTransform(scrollY, [0, 400], [0, 120]);
  const opacityContent = useTransform(scrollY, [0, 400], [1, 0]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      image: '/world_cup_2026_logo.png',
      badge: 'Live',
      subtitle: 'FIFA World Cup 2026 Special',
      title: t('live_sports_tv'),
      description: t('live_sports_subtitle'),
      objectFit: 'object-contain'
    },
    {
      id: 1,
      image: '/world_cup_2026_stadium.png',
      badge: 'Exclusive',
      subtitle: 'Premium Sports Arena',
      title: 'CHAMPIONS LEADERBOARD',
      description: i18n.language.startsWith('id')
        ? 'Akses saluran TV olahraga premium terlengkap secara langsung. beIN Sports, DAZN, dan stasiun olahraga dunia tanpa buffering.'
        : 'Access the most complete selection of premium sports channels live. beIN Sports, DAZN, and international broadcasts with no buffering.',
      objectFit: 'object-cover'
    }
  ];

  const [matches, setMatches] = useState<PlayableStream[]>([]);
  const [sportsTv, setSportsTv] = useState<PlayableStream[]>([]);
  const [liveTv, setLiveTv] = useState<PlayableStream[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'sports-tv' | 'live-tv'>('events');
  const [sidebarTab, setSidebarTab] = useState<'events' | 'sports-tv' | 'live-tv'>('events');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time ticking state to trigger countdown updates
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reference tick to trigger re-evaluations and satisfy unused variable lint rules
  void tick;

  // Check for share parameters on mount or when streams load
  useEffect(() => {
    if (loading || matches.length === 0) return;
    
    const params = new URLSearchParams(window.location.search);
    const matchSlug = params.get('match');
    const channelSlug = params.get('channel');
    
    if (matchSlug) {
      const found = matches.find(m => getSlug(m.name) === matchSlug);
      if (found) {
        setActiveStream(found);
        setSidebarTab('events');
      }
    } else if (channelSlug) {
      const foundSport = sportsTv.find(c => getSlug(c.name) === channelSlug);
      if (foundSport) {
        setActiveStream(foundSport);
        setSidebarTab('sports-tv');
        setActiveTab('sports-tv');
      } else {
        const foundLive = liveTv.find(c => getSlug(c.name) === channelSlug);
        if (foundLive) {
          setActiveStream(foundLive);
          setSidebarTab('live-tv');
          setActiveTab('live-tv');
        }
      }
    }
  }, [loading, matches, sportsTv, liveTv]);

  // Selected stream server info
  const [activeStream, setActiveStream] = useState<PlayableStream | null>(null);
  const [activeServerIdx, setActiveServerIdx] = useState<number>(0);
  const [playerUrl, setPlayerUrl] = useState<string>('');

  useEffect(() => {
    if (activeStream) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, [activeStream]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events, sports channels, and entertainment channels in parallel
        const [eventsRes, sportsRes, liveRes] = await Promise.all([
          axios.get<MatchEvent[]>('https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-events.dat'),
          axios.get<ChannelEvent[]>('https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-sports.dat'),
          axios.get<ChannelEvent[]>('https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-hiburan.dat')
        ]);

        // 1. Process Events (Match Schedule)
        const mappedEvents: PlayableStream[] = eventsRes.data.map(item => ({
          id: item.id_event,
          name: `${item.player_1} vs ${item.player_2}`,
          subName: item.nama_event,
          logo: item.logo_1,
          isBase64Logo: false,
          servers: buildServers(item.url_iptv, item.url_license, item.jenis),
          isChannel: false,
          player1: item.player_1,
          player2: item.player_2,
          jadwal_event: item.jadwal_event,
          jadwal_stop: item.jadwal_stop,
          deskripsi: cleanDescription(item.deskripsi),
          deskripsi_en: cleanDescription(item.deskripsi_en)
        }));

        // 2. Process Sports TV Channels
        const mappedSports: PlayableStream[] = sportsRes.data.map(item => ({
          id: item.id_iptv,
          name: item.nama_channel,
          subName: item.tagline || 'Saluran Sports Premium',
          logo: item.gbr_base64,
          isBase64Logo: !!item.gbr_base64,
          servers: buildServers(item.url_iptv, item.url_license, item.jenis),
          isChannel: true
        }));

        // 3. Process Live TV Channels
        const mappedLive: PlayableStream[] = liveRes.data.map(item => ({
          id: item.id_iptv,
          name: item.nama_channel,
          subName: item.tagline || 'Saluran Hiburan & Lokal',
          logo: item.gbr_base64,
          isBase64Logo: !!item.gbr_base64,
          servers: buildServers(item.url_iptv, item.url_license, item.jenis),
          isChannel: true
        }));

        setMatches(mappedEvents);
        setSportsTv(mappedSports);
        setLiveTv(mappedLive);
      } catch (err: any) {
        console.error('Failed to load live sports data', err);
        setError(t('live_stream_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Set the player URL when a stream or server changes
  useEffect(() => {
    if (!activeStream) {
      setPlayerUrl('');
      return;
    }

    const server = activeStream.servers[activeServerIdx];
    if (!server) return;

    if (server.type === 'dash-clearkey' && server.keyId && server.key) {
      const v = encodeV(server.url, server.keyId, server.key);
      setPlayerUrl(`https://wc-2026-player.blogspot.com/?type=dash-clearkey&v=${v}`);
    } else {
      // Default fallback (e.g. HLS)
      const v = btoa(btoa(btoa(server.url)));
      setPlayerUrl(`https://wc-2026-player.blogspot.com/?type=hls&v=${v}`);
    }
  }, [activeStream, activeServerIdx]);

  // Scroll to top when activeStream changes (opening player or going back to menu)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeStream]);

  // Helper: select a stream and push slug to URL
  const selectStream = (stream: PlayableStream, tab?: 'events' | 'sports-tv' | 'live-tv') => {
    setActiveStream(stream);
    setActiveServerIdx(0);
    if (tab) setSidebarTab(tab);
    const slug = getSlug(stream.name);
    const param = stream.isChannel ? `channel=${slug}` : `match=${slug}`;
    window.history.pushState({}, '', `${window.location.pathname}?${param}`);
  };

  // Helper: go back to menu and clear URL params
  const clearStream = () => {
    setActiveStream(null);
    setActiveServerIdx(0);
    window.history.pushState({}, '', window.location.pathname);
  };

  const currentChannels = activeTab === 'sports-tv' ? sportsTv : liveTv;

  return <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
    <Navbar />

    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="pb-20"
    >
      {activeStream ? (
        // PLAYER VIEW WITH QUICK SWITCH SIDEBAR
        <div className="max-w-7xl mx-auto w-full px-[var(--container-padding)] pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in items-start">
            {/* Player Columns (Left) */}
            <div className="lg:col-span-8 space-y-6">
              <button
                onClick={() => {
                  clearStream();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all font-bold text-sm tracking-wide cursor-pointer"
              >
                <ArrowLeft size={16} />
                {t('back_to_menu')}
              </button>

              {/* Video Player Frame */}
              {(() => {
                const { status } = getPlayableStatus(activeStream, t);
                return (
                  <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 bg-[#070707] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
                    {!activeStream.isChannel && status === 'upcoming' ? (
                      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-10 select-none">
                        {/* Background Image inside Player */}
                        <img
                          src="/stadium_pitch_bg.png"
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-15"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/85" />
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center text-center gap-2 md:gap-6 w-full">
                          <span className="text-[9px] md:text-xs font-black bg-amber-500/20 border border-amber-500/30 text-amber-500 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full uppercase tracking-[2px] animate-pulse">
                            {t('upcoming')}
                          </span>
                          
                          {/* VS Flags and Names */}
                          <div className="flex items-center gap-3 md:gap-8 justify-center w-full max-w-lg">
                            <div className="flex flex-col items-center gap-1 md:gap-2.5">
                              <FlagImage countryName={activeStream.player1 || ''} className="w-10 h-7 md:w-16 md:h-11 shadow-lg border border-white/10" />
                              <span className="text-[10px] md:text-sm font-black text-zinc-300 max-w-[80px] md:max-w-[100px] truncate">{activeStream.player1}</span>
                            </div>
                            <span className="text-[10px] md:text-sm font-black text-netflix-red font-outfit uppercase tracking-widest">
                              VS
                            </span>
                            <div className="flex flex-col items-center gap-1 md:gap-2.5">
                              <FlagImage countryName={activeStream.player2 || ''} className="w-10 h-7 md:w-16 md:h-11 shadow-lg border border-white/10" />
                              <span className="text-[10px] md:text-sm font-black text-zinc-300 max-w-[80px] md:max-w-[100px] truncate">{activeStream.player2}</span>
                            </div>
                          </div>

                          {/* Countdown */}
                          {activeStream.jadwal_event && (
                            <MatchCountdown targetTime={activeStream.jadwal_event} />
                          )}

                          <p className="hidden md:block text-[9px] md:text-xs text-zinc-400 font-bold uppercase tracking-[2px] max-w-md">
                            {i18n.language.startsWith('id') 
                              ? 'Siaran langsung akan dimulai 20 menit sebelum waktu pertandingan.' 
                              : 'Live stream will unlock exactly 20 minutes before kickoff.'}
                          </p>
                        </div>
                      </div>
                    ) : !activeStream.isChannel && status === 'ended' ? (
                      /* ── MATCH ENDED OVERLAY ── */
                      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-4 md:p-8 text-center select-none">
                        <img
                          src="/stadium_pitch_bg.png"
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />

                        <div className="relative z-10 flex flex-col items-center gap-3 md:gap-5">
                          {/* Flags */}
                          <div className="flex items-center gap-3 md:gap-6">
                            <FlagImage countryName={activeStream.player1 || ''} className="w-10 h-7 md:w-14 md:h-10 shadow-lg border border-white/10 opacity-60" />
                            <span className="text-[10px] md:text-sm font-black text-zinc-500 font-outfit uppercase tracking-widest">VS</span>
                            <FlagImage countryName={activeStream.player2 || ''} className="w-10 h-7 md:w-14 md:h-10 shadow-lg border border-white/10 opacity-60" />
                          </div>

                          {/* Trophy + Title */}
                          <Trophy size={32} className="text-zinc-600 md:hidden" />
                          <Trophy size={52} className="text-zinc-500 hidden md:block" />

                          <div className="flex flex-col items-center gap-1">
                            <h3 className="text-base md:text-2xl font-black font-outfit text-white uppercase tracking-wider">
                              {t('match_ended')}
                            </h3>
                            <p className="text-zinc-500 text-[10px] md:text-sm max-w-[220px] md:max-w-xs leading-relaxed">
                              {i18n.language.startsWith('id')
                                ? 'Pertandingan ini telah selesai.'
                                : 'This match has ended.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : playerUrl ? (

                      <iframe
                        id="shaka_player_iframe"
                        src={playerUrl}
                        title={t('match_schedule')}
                        className="w-full h-full border-none"
                        allow="fullscreen *; autoplay *; encrypted-media *; picture-in-picture *"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                      ></iframe>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <NetflixLoader />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stream Info & Server Toggle */}
              {(() => {
                const { status } = getPlayableStatus(activeStream, t);
                return (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-6 bg-white/[0.02] border border-white/5 p-3 md:p-8 rounded-xl md:rounded-3xl backdrop-blur-3xl shadow-xl">
                    <div className="flex-1 min-w-0">
                      {/* Status badge + share button on same row on mobile */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-netflix-red text-[9px] md:text-xs font-black uppercase tracking-[3px] animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-netflix-red animate-ping shrink-0" />
                          {activeStream.isChannel ? t('live_now') : (status === 'live' ? t('live_now') : (status === 'upcoming' ? t('upcoming') : t('match_ended')))}
                        </span>
                        {/* Share button inline on mobile */}
                        <div className="md:hidden shrink-0">
                          <PlayerShareButton stream={activeStream} t={t} />
                        </div>
                      </div>

                      {/* Title */}
                      <div className="mt-0.5 md:mt-1">
                        {activeStream.isChannel ? (
                          <h1 className="text-sm md:text-3xl font-black font-outfit text-white flex items-center gap-2 md:gap-3 truncate">
                            {activeStream.isBase64Logo && activeStream.logo && (
                              <img src={activeStream.logo} alt={activeStream.name} className="h-5 md:h-8 max-w-[70px] md:max-w-[120px] object-contain rounded bg-white/5 p-0.5 md:p-1 border border-white/10 shrink-0" />
                            )}
                            <span className="truncate">{activeStream.name}</span>
                          </h1>
                        ) : (
                          <h1 className="text-sm md:text-3xl font-black font-outfit text-white flex items-center gap-1.5 md:gap-3.5 flex-wrap">
                            <FlagImage countryName={activeStream.player1 || ''} className="w-5 h-3.5 md:w-10 md:h-7 inline-block shrink-0" />
                            <span className="leading-tight">{activeStream.player1} vs {activeStream.player2}</span>
                            <FlagImage countryName={activeStream.player2 || ''} className="w-5 h-3.5 md:w-10 md:h-7 inline-block shrink-0" />
                          </h1>
                        )}
                      </div>

                      <p className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-wider mt-1">
                        {activeStream.subName}
                      </p>
                    </div>

                    {/* Share Button — desktop only (inline above on mobile) */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                      <PlayerShareButton stream={activeStream} t={t} />
                    </div>

                    {/* Server selector */}
                    {activeStream.servers.length > 1 && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">
                          {t('server_selector')}
                        </span>
                        <div className="flex gap-2">
                          {activeStream.servers.map((srv, idx) => (
                            <button
                              key={srv.name}
                              onClick={() => setActiveServerIdx(idx)}
                              className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${activeServerIdx === idx
                                ? 'bg-netflix-red text-white shadow-lg shadow-red-950/40'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
                                }`}
                            >
                              {srv.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}



              {/* Safety Tips Banner */}
              <div className="flex gap-4 p-6 bg-amber-950/20 border-l-4 border-amber-500/80 rounded-r-2xl text-zinc-400 text-sm">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-black text-white mb-1">{t('tips_title')}</h4>
                  <p className="leading-relaxed">
                    {t('tips_desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Quick Channels (Right) */}
            <div className="lg:col-span-4 flex flex-col h-[450px] lg:h-[540px] w-full bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-3xl p-6 overflow-hidden shadow-2xl">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 select-none">
                <Radio size={18} className="text-netflix-red animate-pulse shrink-0" />
                <span>Quick Channels</span>
              </h3>

              {/* Sidebar Tabs */}
              <div className="flex gap-1 p-0.5 bg-white/[0.02] border border-white/5 rounded-xl mb-4 shrink-0 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSidebarTab('events')}
                  className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${sidebarTab === 'events' ? 'bg-netflix-red text-white shadow' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                  {t('match_schedule')}
                </button>
                <button
                  onClick={() => setSidebarTab('sports-tv')}
                  className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${sidebarTab === 'sports-tv' ? 'bg-netflix-red text-white shadow' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                  Sports
                </button>
                <button
                  onClick={() => setSidebarTab('live-tv')}
                  className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${sidebarTab === 'live-tv' ? 'bg-netflix-red text-white shadow' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                  Live TV
                </button>
              </div>

              {/* Sidebar Channels List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
                {sidebarTab === 'events' ? (
                  matches.length === 0 ? (
                    <div className="py-10 text-center text-zinc-500 text-xs font-bold">{t('no_matches')}</div>
                  ) : (
                    matches.map((item) => {
                      const { isPlayable, buttonText, status } = getPlayableStatus(item, t);
                      const isCurrent = activeStream?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            selectStream(item);
                          }}
                          className={`flex flex-col gap-2.5 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${isCurrent
                            ? 'bg-netflix-red/10 border-netflix-red'
                            : 'bg-white/[0.01] border-white/5 hover:bg-white/5 hover:border-white/10'
                            }`}
                        >
                          <div className="flex items-center justify-between text-[9px] font-black tracking-wider uppercase">
                            <span className="text-zinc-500 truncate max-w-[120px]">{item.subName}</span>
                            {status === 'live' && (
                              <span className="text-emerald-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>LIVE</span>
                              </span>
                            )}
                            {status === 'upcoming' && <span className="text-amber-500">{t('upcoming')}</span>}
                            {status === 'ended' && <span className="text-zinc-500">{t('match_ended')}</span>}
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 truncate">
                              <FlagImage countryName={item.player1 || ''} className="w-6 h-4 shrink-0 rounded-sm" />
                              <span className="text-xs font-bold text-white truncate">{item.player1}</span>
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 font-outfit select-none">VS</span>
                            <div className="flex items-center gap-2 flex-1 justify-end truncate">
                              <span className="text-xs font-bold text-white truncate">{item.player2}</span>
                              <FlagImage countryName={item.player2 || ''} className="w-6 h-4 shrink-0 rounded-sm" />
                            </div>
                          </div>

                          {item.jadwal_event && (
                            <div className="text-[9px] font-black text-zinc-500 flex items-center gap-1.5 select-none">
                              <Clock size={11} className="text-netflix-red shrink-0" />
                              <span>{formatJadwal(item.jadwal_event, i18n.language)}</span>
                            </div>
                          )}

                          {!isPlayable && (
                            <div className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                              {buttonText}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )
                ) : (
                  (sidebarTab === 'sports-tv' ? sportsTv : liveTv).length === 0 ? (
                    <div className="py-10 text-center text-zinc-500 text-xs font-bold">{t('no_channels')}</div>
                  ) : (
                    (sidebarTab === 'sports-tv' ? sportsTv : liveTv).map((item) => {
                      const isCurrent = activeStream?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            selectStream(item);
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${isCurrent
                            ? 'bg-netflix-red/10 border-netflix-red'
                            : 'bg-white/[0.01] border-white/5 hover:bg-white/5 hover:border-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            {item.isBase64Logo && item.logo ? (
                              <div className="h-8 w-14 shrink-0 flex items-center justify-center bg-white/5 rounded-lg p-1.5 border border-white/5 overflow-hidden">
                                <img src={item.logo} alt={item.name} className="h-full max-w-full object-contain filter brightness-110" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 shrink-0 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 border border-white/5">
                                <Tv size={16} />
                              </div>
                            )}
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider truncate">
                                {item.subName}
                              </p>
                            </div>
                          </div>
                          <Play size={10} className={`shrink-0 ${isCurrent ? 'text-netflix-red' : 'text-zinc-500'}`} fill={isCurrent ? 'currentColor' : 'none'} />
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // SCHEDULE / CHANNELS VIEW
        <>
          {/* Fullscreen FIFA World Cup 2026 Hero Banner */}
          <div className="relative w-full overflow-hidden bg-black bg-gradient-to-b from-transparent to-black" style={{ height: '100svh' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                {/* Background Image */}
                <motion.div
                  className="absolute inset-0 z-0 origin-center"
                  style={{
                    y: yBg,
                    scale: scaleBg,
                    opacity: opacityBg,
                    filter: filterBg
                  }}
                >
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className={`w-full h-full ${slides[currentSlide].objectFit || 'object-cover'} brightness-[0.55]`}
                  />
                  {/* Multi-layered Gradients for Cinematic Look */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/40 to-transparent opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-black/20" />
                </motion.div>

                {/* Content Wrapper */}
                <motion.div
                  className="relative h-full w-full flex items-end px-[var(--container-padding)] z-10 pb-28 md:pb-32 pt-24 max-w-7xl mx-auto"
                  style={{
                    y: yContent,
                    opacity: opacityContent
                  }}
                >
                  <div className="max-w-3xl flex flex-col gap-4 md:gap-7">
                    <div className="flex items-center gap-3">
                      <span className="bg-netflix-red text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded tracking-tighter uppercase">
                        {slides[currentSlide].badge}
                      </span>
                      <span className="text-white/60 text-xs md:text-sm font-bold flex items-center gap-1.5">
                        <Play size={14} fill="white" className="opacity-60" />
                        {slides[currentSlide].subtitle}
                      </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-outfit leading-[0.9] tracking-tighter text-white uppercase">
                      {slides[currentSlide].title}
                    </h1>

                    <p className="text-zinc-300 text-sm md:text-xl leading-relaxed line-clamp-3 max-w-2xl font-medium antialiased">
                      {slides[currentSlide].description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <button
                        onClick={() => {
                          const firstPlayable = matches.find(m => getPlayableStatus(m, t).isPlayable);
                          if (firstPlayable) {
                            selectStream(firstPlayable, 'events');
                          } else {
                            const section = document.getElementById('sports-content');
                            if (section) {
                              section.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }}
                        className="px-6 md:px-10 py-3.5 md:py-4 rounded-xl font-black flex items-center gap-3 bg-white text-black hover:scale-105 hover:bg-zinc-100 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.1)] cursor-pointer"
                      >
                        <Play fill="black" size={24} />
                        <span className="uppercase tracking-tighter text-base md:text-lg">{t('watch_now')}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className="group relative py-2 cursor-pointer"
                >
                  <div className={`h-1 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-netflix-red' : 'w-4 bg-white/30 group-hover:bg-white/50'}`} />
                </button>
              ))}
            </div>

            {/* Static deep bottom gradient overlay for seamless dark transition */}
            <div className="absolute inset-x-0 bottom-0 h-[25vh] bg-gradient-to-t from-black via-black/85 to-transparent z-[5] pointer-events-none" />
          </div>

          {/* Main Content Area */}
          <div id="sports-content" className="max-w-7xl mx-auto w-full px-[var(--container-padding)] pt-12">
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                {/* Clean header exactly like Movies/Series pages */}
                <header>
                  <h2 className="text-3xl font-black font-outfit text-white uppercase tracking-wider">
                    {t('live_sports')}
                  </h2>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-1">
                    {activeTab === 'events' ? t('match_schedule') : activeTab === 'sports-tv' ? 'Sports TV' : 'Live TV'}
                  </p>
                </header>

                {/* Tab navigation - shrink-0 to prevent stretching and allow natural peeking overflow */}
                <div className="flex gap-2 md:gap-3 p-1.5 md:p-2 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-[20px] backdrop-blur-md shrink-0 w-full md:w-auto overflow-x-auto no-scrollbar justify-start md:justify-center">
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`shrink-0 py-2 px-4 md:py-3.5 md:px-7 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 md:gap-3 justify-center ${activeTab === 'events'
                      ? 'bg-netflix-red text-white shadow-lg shadow-red-950/30'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Calendar className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    {t('match_schedule')}
                  </button>
                  <button
                    onClick={() => setActiveTab('sports-tv')}
                    className={`shrink-0 py-2 px-4 md:py-3.5 md:px-7 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 md:gap-3 justify-center ${activeTab === 'sports-tv'
                      ? 'bg-netflix-red text-white shadow-lg shadow-red-950/30'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Tv className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    Sports TV
                  </button>
                  <button
                    onClick={() => setActiveTab('live-tv')}
                    className={`shrink-0 py-2 px-4 md:py-3.5 md:px-7 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 md:gap-3 justify-center ${activeTab === 'live-tv'
                      ? 'bg-netflix-red text-white shadow-lg shadow-red-950/30'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Radio className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    Live TV
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center">
                  <NetflixLoader />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                  <AlertCircle size={48} className="text-netflix-red" />
                  <h3 className="text-lg font-bold text-white">{error}</h3>
                </div>
              ) : activeTab === 'events' ? (
                // MATCH CARDS GRID (Netflix-aligned column specs)
                matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 mb-2">
                      <Trophy size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{t('no_matches')}</h3>
                    <p className="text-zinc-500 text-sm max-w-xs">
                      {t('no_matches_desc')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
                    {matches.map((item) => (
                      <MatchCard
                        key={item.id}
                        item={item}
                        selectStream={selectStream}
                        setSidebarTab={setSidebarTab}
                        t={t}
                        i18n={i18n}
                      />
                    ))}
                  </div>
                )
              ) : (
                // CHANNEL CARDS GRID (Netflix-aligned column specs)
                currentChannels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 mb-2">
                      <Tv size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{t('no_channels')}</h3>
                    <p className="text-zinc-500 text-sm max-w-xs">
                      {t('no_channels_desc')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
                    {currentChannels.map((item) => (
                      <ChannelCard
                        key={item.id}
                        item={item}
                        activeTab={activeTab}
                        selectStream={selectStream}
                        setSidebarTab={setSidebarTab}
                        t={t}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </motion.main>

    <Footer />
  </div>

};

export default LiveSports;
