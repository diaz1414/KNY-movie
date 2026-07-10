import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { isSupabaseEnabled, supabase } from '../services/supabase';
import { Trophy, Play, AlertCircle, ArrowLeft, Tv, ShieldAlert, Radio, Calendar, Clock, Film, Share2, Check, Award, Bell, Send } from 'lucide-react';
import NetflixLoader from '../components/NetflixLoader';
import { CustomPlayer } from '../components/CustomPlayer';
import { WorldCupDashboard } from '../components/WorldCupDashboard';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface StreamServer {
  name: string;
  url: string;
  type: string;
  keyId?: string;
  key?: string;
  keys?: Record<string, string>;
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

const usernameColors = [
  '#f87171', // red-400
  '#60a5fa', // blue-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#c084fc', // purple-400
  '#f472b6', // pink-400
  '#2dd4bf', // teal-400
  '#f59e0b', // orange-400
  '#818cf8', // indigo-400
  '#fb7185'  // rose-400
];

const getUsernameColor = (username: string) => {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return usernameColors[hash % usernameColors.length];
};

const avatarGradients = [
  'from-pink-500 to-rose-500',
  'from-purple-600 to-indigo-600',
  'from-blue-500 to-teal-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-red-500 to-orange-600',
  'from-fuchsia-500 to-purple-600',
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-red-600'
];

const getAvatarGradient = (username: string) => {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length];
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
      const keys: Record<string, string> = {};
      const pairs = decryptedLicense.split(',');
      pairs.forEach(pair => {
        const parts = pair.split(':');
        if (parts.length === 2) {
          const [kid, k] = parts;
          if (kid && k) {
            keys[kid.trim()] = k.trim();
          }
        }
      });
      if (Object.keys(keys).length > 0) {
        servers[0].keys = keys;
        const firstKeyId = Object.keys(keys)[0];
        servers[0].keyId = firstKeyId;
        servers[0].key = keys[firstKeyId];
      }
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

const normalizeTeamName = (name: string): string => {
  let lower = name.toLowerCase().trim();
  if (lower.includes('ivoire') || lower.includes('ivory')) return 'ivorycoast';
  if (lower.includes('curacao') || lower.includes('curaçao')) return 'curacao';
  if (lower.includes('cabo verde') || lower.includes('cape verde')) return 'capeverde';
  if (lower.includes('iran')) return 'iran';
  if (lower.includes('dr congo') || lower.includes('democratic republic of the congo')) return 'congo';
  return lower.replace(/[^a-z0-9]/g, '').trim();
};

const findWcGame = (stream: PlayableStream, wcGames: any[]) => {
  if (!stream.player1 || !stream.player2) return null;
  const p1 = normalizeTeamName(stream.player1);
  const p2 = normalizeTeamName(stream.player2);

  return wcGames.find(g => {
    const home = normalizeTeamName(g.home_team_name_en || g.home_team_label || '');
    const away = normalizeTeamName(g.away_team_name_en || g.away_team_label || '');
    return (home === p1 && away === p2) || (home === p2 && away === p1);
  });
};

const getWcScore = (stream: PlayableStream, game: any) => {
  if (!game) return null;
  const p1 = normalizeTeamName(stream.player1 || '');
  const home = normalizeTeamName(game.home_team_name_en || game.home_team_label || '');
  
  const homeScore = game.home_score;
  const awayScore = game.away_score;
  
  if (home === p1) {
    return `${homeScore} - ${awayScore}`;
  } else {
    return `${awayScore} - ${homeScore}`;
  }
};

const formatViewerCount = (count: number, locale: string): string => {
  const isId = locale.startsWith('id');
  if (count >= 1000000) {
    const millions = (count / 1000000).toFixed(1).replace('.', isId ? ',' : '.');
    return isId ? `${millions}JT menonton` : `${millions}M watching`;
  }
  if (count >= 1000) {
    const thousands = (count / 1000).toFixed(1).replace('.', isId ? ',' : '.');
    return isId ? `${thousands}RB menonton` : `${thousands}K watching`;
  }
  return isId ? `${count} menonton` : `${count} watching`;
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
    const leadTimeMs = 30 * 60 * 1000; // 30 minutes in milliseconds
    const startsIn = startTime - now;

    // 1. Check if the match is in the future and starting in > 30 minutes
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
  i18n: any;
  viewerCount?: number;
}> = ({ item, activeTab, selectStream, t, i18n, viewerCount }) => {
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
        {viewerCount !== undefined && viewerCount > 0 && (
          <span className="text-zinc-400 border-l border-white/20 pl-1.5 ml-1.5 font-bold uppercase tracking-wider">
            {formatViewerCount(viewerCount, i18n.language)}
          </span>
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

      {/* Brand Logo Hero Element */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
        {item.isBase64Logo && item.logo ? (
          <img
            src={item.logo}
            alt={item.name}
            className="w-[80%] object-contain filter brightness-110 contrast-105 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Tv size={56} className="text-zinc-400 transition-colors group-hover:text-netflix-red" />
            <span className="text-xs md:text-sm font-black text-zinc-300 uppercase tracking-wider max-w-[150px] break-words">
              {item.name}
            </span>
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
  viewerCount?: number;
  wcGames?: any[];
  activeReminders?: string[];
  toggleReminder?: (matchId: string) => void;
}> = ({ item, selectStream, t, i18n, viewerCount, wcGames = [], activeReminders = [], toggleReminder }) => {
  const { isPlayable, buttonText, status } = getPlayableStatus(item, t);
  const matchedGame = findWcGame(item, wcGames);
  const score = getWcScore(item, matchedGame);
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
            {viewerCount !== undefined && viewerCount > 0 && (
              <span className="text-zinc-400 border-l border-white/20 pl-1.5 ml-1.5 font-bold uppercase tracking-wider">
                {formatViewerCount(viewerCount, i18n.language)}
              </span>
            )}
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

      {/* Remind Me / Notification Toggle Button */}
      {status === 'upcoming' && item.id && toggleReminder && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleReminder(item.id);
          }}
          className={`absolute top-[60px] right-4 z-30 w-9 h-9 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95 ${
            activeReminders.includes(item.id)
              ? 'bg-netflix-red border-netflix-red text-white'
              : 'bg-black/80 border-white/10 text-white hover:bg-netflix-red hover:border-netflix-red'
          }`}
          title={activeReminders.includes(item.id) ? t('reminded') : t('remind_me')}
        >
          <Bell size={14} fill={activeReminders.includes(item.id) ? 'currentColor' : 'none'} className={activeReminders.includes(item.id) ? 'animate-bounce' : ''} />
        </button>
      )}

      {/* Flag / Matchup Hero graphic */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center p-6 select-none gap-8 pb-20">
        <div className="flex items-center gap-4 justify-center w-full">
          <div className="flex flex-col items-center gap-2">
            <FlagImage countryName={item.player1 || ''} className="w-20 h-14 md:w-24 md:h-16 shadow-xl border border-white/10" />
            <span className="text-xs md:text-sm font-black text-zinc-300 max-w-[120px] truncate text-center mt-2">
              {item.player1}
            </span>
          </div>
          {status === 'ended' && score ? (
            <span className="text-sm md:text-2xl font-black text-white font-outfit uppercase tracking-wider whitespace-nowrap mt-[-20px] bg-netflix-red/25 border border-netflix-red/35 px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl backdrop-blur-md shadow-lg shadow-red-950/20">
              {score}
            </span>
          ) : (
            <span className="text-sm md:text-base font-black text-netflix-red font-outfit uppercase tracking-widest mt-[-20px] whitespace-nowrap">
              VS
            </span>
          )}
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
          <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-sm tracking-wider shadow-lg ${
            status === 'live' 
              ? 'bg-netflix-red text-white' 
              : status === 'upcoming'
                ? 'bg-amber-500 text-white'
                : 'bg-zinc-600 text-white'
          }`}>
            {status === 'live' ? 'LIVE' : status === 'upcoming' ? t('upcoming') : t('match_ended')}
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
      image: '/world_cup_2026_hero.png',
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
  // Selected stream server info
  const [activeStream, setActiveStream] = useState<PlayableStream | null>(null);
  const [activeServerIdx, setActiveServerIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'events' | 'sports-tv' | 'live-tv' | 'stats'>('events');
  const [sidebarTab, setSidebarTab] = useState<'events' | 'sports-tv' | 'live-tv'>('events');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerCounts, setViewerCounts] = useState<Record<string, number>>({});
  const [wcGames, setWcGames] = useState<any[]>([]);
  const [activeReminders, setActiveReminders] = useState<string[]>([]);

  // Custom Toast State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Live Match Chat & Real-Time Emoji Reactions States
  const [chatNickname, setChatNickname] = useState<string>('');
  const [hasJoinedChat, setHasJoinedChat] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; timestamp: string; color: string }[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat nickname and reminders from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kny_match_reminders');
      if (stored) {
        setActiveReminders(JSON.parse(stored));
      }
      const saved = localStorage.getItem('kny_chat_nickname');
      if (saved) {
        setChatNickname(saved);
        setHasJoinedChat(true);
      }
    } catch (e) {
      console.error('Failed to load initial storage data', e);
    }
  }, []);

  // Auto-scroll chat window when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages]);

  // Real-Time message/reaction subscriber specific to activeStream.id
  useEffect(() => {
    if (!activeStream) return;

    // Reset messages feed for this channel/match room
    setChatMessages([]);

    if (!isSupabaseEnabled) return;

    const channelId = `room-${activeStream.id}`;
    const channel = supabase.channel(channelId, {
      config: {
        broadcast: { self: true }
      }
    });

    const usernameColors = [
      'text-red-400',
      'text-blue-400',
      'text-green-400',
      'text-yellow-400',
      'text-purple-400',
      'text-pink-400',
      'text-teal-400',
      'text-amber-400',
      'text-indigo-400',
      'text-emerald-400'
    ];
    const getRandomColor = (username: string) => {
      const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return usernameColors[hash % usernameColors.length];
    };

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setChatMessages(prev => {
          if (prev.some(m => m.id === payload.id)) return prev;
          return [...prev, {
            id: payload.id,
            user: payload.user,
            text: payload.text,
            timestamp: payload.timestamp,
            color: getRandomColor(payload.user)
          }].slice(-100);
        });
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const id = Math.random().toString();
        const x = Math.random() * 80 + 10; // 10% to 90% horizontal position
        const y = Math.random() * 20 + 75; // Starting float point
        const newEmoji = { id, emoji: payload.emoji, x, y };

        setFloatingEmojis(prev => [...prev, newEmoji]);

        setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(e => e.id !== id));
        }, 2000);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeStream?.id]);

  const sendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !chatNickname.trim() || !activeStream) return;

    const messageId = Math.random().toString();
    const payload = {
      id: messageId,
      user: chatNickname.trim(),
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString(i18n.language.startsWith('id') ? 'id-ID' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };

    if (!isSupabaseEnabled) {
      setChatMessages(prev => [...prev, {
        ...payload,
        color: getUsernameColor(payload.user)
      }].slice(-100));
      setChatInput('');
      return;
    }

    const channelId = `room-${activeStream.id}`;
    const channel = supabase.channel(channelId);

    channel.send({
      type: 'broadcast',
      event: 'message',
      payload
    }).then(() => {
      setChatInput('');
    }).catch(err => {
      console.error('Failed to send broadcast chat message:', err);
    });
  };

  const sendEmojiReaction = (emoji: string) => {
    if (!activeStream) return;

    if (!isSupabaseEnabled) {
      const id = Math.random().toString();
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 20 + 75;
      setFloatingEmojis(prev => [...prev, { id, emoji, x, y }]);

      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== id));
      }, 2000);
      return;
    }

    const channelId = `room-${activeStream.id}`;
    const channel = supabase.channel(channelId);

    channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji }
    }).catch(err => {
      console.error('Failed to send emoji reaction broadcast:', err);
    });
  };

  const generateRandomNickname = () => {
    const adjectives_id = ['Penonton', 'Fans', 'Suporter', 'Pengamat', 'Pakar', 'Komentator', 'Pencinta', 'Jagoan', 'Penyemangat', 'Kawan'];
    const nouns_id = ['Bola', 'Sepak', 'Dunia', 'Laga', 'WorldCup', 'YKN', 'Nonton', 'Juara', 'Gol', 'Striker', 'Kiper'];
    
    const adjectives_en = ['Viewer', 'Fan', 'Supporter', 'Observer', 'Expert', 'Pundit', 'Lover', 'Champ', 'Cheerer', 'Buddy'];
    const nouns_en = ['Football', 'Soccer', 'Cup', 'Match', 'WorldCup', 'YKN', 'Streaming', 'Winner', 'Goal', 'Striker', 'Keeper'];

    const isId = i18n.language.startsWith('id');
    const adjs = isId ? adjectives_id : adjectives_en;
    const nouns = isId ? nouns_id : nouns_en;

    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;

    return `${adj}_${noun}_${num}`;
  };

  const toggleReminder = (matchId: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast(t('notif_blocked'), 'error');
      return;
    }

    const handleToggle = () => {
      const isCurrentlyReminded = activeReminders.includes(matchId);
      const updatedList = isCurrentlyReminded
        ? activeReminders.filter(id => id !== matchId)
        : [...activeReminders, matchId];

      if (isCurrentlyReminded) {
        showToast(t('notif_removed'), 'info');
      } else {
        showToast(t('notif_granted'), 'success');
      }
      localStorage.setItem('kny_match_reminders', JSON.stringify(updatedList));
      setActiveReminders(updatedList);
    };

    if (Notification.permission === 'granted') {
      handleToggle();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          handleToggle();
        } else {
          showToast(t('notif_blocked'), 'error');
        }
      });
    } else {
      showToast(t('notif_blocked'), 'error');
    }
  };

  // Real-time tracking of viewers using Supabase Presence
  useEffect(() => {
    if (!isSupabaseEnabled) {
      setViewerCounts({});
      return;
    }

    const channel = supabase.channel('global-live-sports-presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const counts: Record<string, number> = {};
        
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.watching) {
              counts[p.watching] = (counts[p.watching] || 0) + 1;
            }
          });
        });
        
        setViewerCounts(counts);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const streamId = activeStream?.id || null;
          await channel.track({ watching: streamId, joined_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [activeStream?.id]);

  // Real-time ticking state to trigger countdown updates
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Background check effect for scheduled kickoff push notifications
  useEffect(() => {
    if (matches.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const stored = localStorage.getItem('kny_match_reminders');
      if (!stored) return;

      const reminders: string[] = JSON.parse(stored);
      if (reminders.length === 0) return;

      reminders.forEach(id => {
        const match = matches.find(m => m.id === id);
        if (!match || !match.jadwal_event) return;

        try {
          let safeStartStr = match.jadwal_event.trim();
          if (safeStartStr.includes(' ')) {
            safeStartStr = safeStartStr.replace(' ', 'T');
          }
          const startMatch = safeStartStr.match(/([+-])(\d{2})$/);
          if (startMatch) {
            safeStartStr = safeStartStr + ':00';
          }
          const kickoffTime = new Date(safeStartStr).getTime();
          if (isNaN(kickoffTime)) return;

          const diffMins = (kickoffTime - now) / 60000;

          // 1. 30 Minutes Before Kickoff (Stream Unlocked)
          if (diffMins <= 30 && diffMins > 10) {
            const hasNotified30 = localStorage.getItem(`kny_notified_30_${id}`);
            if (!hasNotified30 && Notification.permission === 'granted') {
              localStorage.setItem(`kny_notified_30_${id}`, 'true');
              const title = i18n.language.startsWith('id')
                ? `${match.name} - Siaran Dibuka!`
                : `${match.name} - Stream Unlocked!`;
              const body = i18n.language.startsWith('id')
                ? `Siaran langsung sudah dibuka dan bisa diputar sekarang. Mari bersiap menonton!`
                : `The live stream is now unlocked and playable. Get ready to watch!`;
              new Notification(title, {
                body,
                icon: '/favicon.png'
              });
            }
          }

          // 2. 10 Minutes Before Kickoff (Starting Soon)
          if (diffMins <= 10 && diffMins > 0) {
            const hasNotified10 = localStorage.getItem(`kny_notified_10_${id}`);
            if (!hasNotified10 && Notification.permission === 'granted') {
              localStorage.setItem(`kny_notified_10_${id}`, 'true');
              const title = i18n.language.startsWith('id')
                ? `${match.name} - 10 Menit Menuju Kickoff!`
                : `${match.name} - 10 Mins to Kickoff!`;
              const body = i18n.language.startsWith('id')
                ? `Pertandingan akan segera dimulai dalam 10 menit. Jangan sampai terlewat!`
                : `Kickoff is starting in 10 minutes. Don't miss the action!`;
              new Notification(title, {
                body,
                icon: '/favicon.png'
              });
            }
          }
        } catch (err) {
          console.error('Error checking match reminder notifications', err);
        }
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [matches, i18n.language]);

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

        let eventsData: MatchEvent[] = [];
        let sportsData: ChannelEvent[] = [];
        let liveData: ChannelEvent[] = [];

        try {
          // Primary Source: Fetch from the external GitHub raw URLs
          const [eventsRes, sportsRes, liveRes] = await Promise.all([
            axios.get<MatchEvent[]>('https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-events.dat'),
            axios.get<ChannelEvent[]>('https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-sports.dat'),
            axios.get<ChannelEvent[]>('https://raw.githubusercontent.com/movietrailersxxi-pixel/web/main/assets/tv-hiburan.dat')
          ]);
          eventsData = eventsRes.data;
          sportsData = sportsRes.data;
          liveData = liveRes.data;
        } catch (githubErr) {
          console.warn('Failed to fetch from Github source, trying Bot API fallback...', githubErr);

          // First Fallback (Backup): Fetch from the bot's API endpoints
          const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || 'http://147.135.252.68:20114';
          try {
            const [eventsRes, sportsRes, liveRes] = await Promise.all([
              axios.get<MatchEvent[]>(`${BOT_API_URL}/api/sports/events`),
              axios.get<ChannelEvent[]>(`${BOT_API_URL}/api/sports/tv`),
              axios.get<ChannelEvent[]>(`${BOT_API_URL}/api/sports/hiburan`)
            ]);
            eventsData = eventsRes.data;
            sportsData = sportsRes.data;
            liveData = liveRes.data;
          } catch (botErr) {
            console.warn('Failed to fetch from Bot API, falling back to local JSON data...', botErr);
            // Second Fallback (Final Backup): Fetch local JSON files served from the public folder
            const [eventsRes, sportsRes, liveRes] = await Promise.all([
              axios.get<MatchEvent[]>('/data/tv-events.json'),
              axios.get<ChannelEvent[]>('/data/tv-sports.json'),
              axios.get<ChannelEvent[]>('/data/tv-hiburan.json')
            ]);
            eventsData = eventsRes.data;
            sportsData = sportsRes.data;
            liveData = liveRes.data;
          }
        }

        // Try fetching World Cup games for score lookup on finished matches from both primary and backup sources
        let wcGamesData: any[] = [];
        try {
          const wcRes = await axios.get('https://worldcup26.ir/get/games');
          if (wcRes && wcRes.data && wcRes.data.games) {
            wcGamesData = wcRes.data.games;
          }
        } catch (wcErr) {
          console.warn('Failed to fetch World Cup games for scoreboard syncing', wcErr);
        }

        // Backup Source: ESPN Scoreboard API
        try {
          const espnRes = await axios.get('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
          if (espnRes && espnRes.data && espnRes.data.events) {
            espnRes.data.events.forEach((event: any) => {
              const comp = event.competitions?.[0];
              if (comp) {
                const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home');
                const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away');
                if (homeComp && awayComp) {
                  const mappedGame = {
                    home_team_name_en: homeComp.team?.displayName || homeComp.team?.name || '',
                    away_team_name_en: awayComp.team?.displayName || awayComp.team?.name || '',
                    home_score: homeComp.score,
                    away_score: awayComp.score
                  };
                  
                  // Avoid duplicating if already present in wcGamesData
                  const homeNorm = normalizeTeamName(mappedGame.home_team_name_en);
                  const awayNorm = normalizeTeamName(mappedGame.away_team_name_en);
                  const exists = wcGamesData.some(g => {
                    const h = normalizeTeamName(g.home_team_name_en || g.home_team_label || '');
                    const a = normalizeTeamName(g.away_team_name_en || g.away_team_label || '');
                    return (h === homeNorm && a === awayNorm) || (h === awayNorm && a === homeNorm);
                  });
                  
                  if (!exists) {
                    wcGamesData.push(mappedGame);
                  }
                }
              }
            });
          }
        } catch (espnErr) {
          console.warn('Failed to fetch from backup ESPN scoreboard API', espnErr);
        }

        setWcGames(wcGamesData);

        // 1. Process Events (Match Schedule) - Deduplicated
        const seenEvents = new Set<string>();
        const mappedEvents: PlayableStream[] = [];
        for (const item of eventsData) {
          const key = item.id_event || `${item.player_1} vs ${item.player_2}`;
          if (seenEvents.has(key)) continue;
          seenEvents.add(key);
          mappedEvents.push({
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
          });
        }

        // 2. Process Sports TV Channels - Deduplicated
        const seenSports = new Set<string>();
        const mappedSports: PlayableStream[] = [];
        for (const item of sportsData) {
          const key = item.id_iptv || item.nama_channel;
          if (seenSports.has(key)) continue;
          seenSports.add(key);
          mappedSports.push({
            id: item.id_iptv,
            name: item.nama_channel,
            subName: item.tagline || 'Saluran Sports Premium',
            logo: item.gbr_base64,
            isBase64Logo: !!item.gbr_base64,
            servers: buildServers(item.url_iptv, item.url_license, item.jenis),
            isChannel: true
          });
        }

        // 3. Process Live TV Channels - Deduplicated
        const seenLive = new Set<string>();
        const mappedLive: PlayableStream[] = [];
        for (const item of liveData) {
          const key = item.id_iptv || item.nama_channel;
          if (seenLive.has(key)) continue;
          seenLive.add(key);
          mappedLive.push({
            id: item.id_iptv,
            name: item.nama_channel,
            subName: item.tagline || 'Saluran Hiburan & Lokal',
            logo: item.gbr_base64,
            isBase64Logo: !!item.gbr_base64,
            servers: buildServers(item.url_iptv, item.url_license, item.jenis),
            isChannel: true
          });
        }

        // Sort matches: live first, upcoming second, ended last
        const sortedEvents = [...mappedEvents].sort((a, b) => {
          const statusA = getPlayableStatus(a, (k: string) => k).status;
          const statusB = getPlayableStatus(b, (k: string) => k).status;
          
          const score = { live: 1, upcoming: 2, ended: 3 };
          return score[statusA] - score[statusB];
        });

        setMatches(sortedEvents);
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
                              ? 'Siaran langsung akan dimulai 30 menit sebelum waktu pertandingan.'
                              : 'Live stream will unlock exactly 30 minutes before kickoff.'}
                          </p>
                        </div>
                      </div>
                    ) : !activeStream.isChannel && status === 'ended' ? (
                      /* ── MATCH ENDED OVERLAY ── */
                      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-3 md:p-8 text-center select-none">
                        <img
                          src="/stadium_pitch_bg.png"
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

                        {/* Standard elegant layout: Flags -> Trophy (Desktop) -> Info Text -> CTA Button */}
                        <div className="relative z-10 flex flex-col items-center gap-2 md:gap-4 w-full max-w-xs md:max-w-md">

                          {/* 1. Flags (Match Identity) */}
                          <div className="flex items-center gap-3 md:gap-6">
                            <FlagImage countryName={activeStream.player1 || ''} className="w-8 h-5.5 md:w-14 md:h-10 shadow-lg border border-white/10 opacity-60" />
                            <span className="text-[10px] md:text-sm font-black text-zinc-500 font-outfit uppercase tracking-widest">VS</span>
                            <FlagImage countryName={activeStream.player2 || ''} className="w-8 h-5.5 md:w-14 md:h-10 shadow-lg border border-white/10 opacity-60" />
                          </div>

                          {/* 2. Trophy (Hidden on mobile to save vertical space) */}
                          <Trophy size={36} className="text-zinc-500 animate-bounce duration-1000 hidden md:block" />

                          {/* 3. Text content */}
                          <div className="flex flex-col items-center gap-0.5">
                            <h3 className="text-xs md:text-xl font-black font-outfit text-white uppercase tracking-wider">
                              {t('match_ended')}
                            </h3>
                            <p className="text-zinc-400 text-[9px] md:text-sm leading-relaxed px-4 md:px-0 max-w-[200px] md:max-w-sm">
                              {i18n.language.startsWith('id')
                                ? 'Pertandingan ini telah selesai. Tonton siaran olahraga lainnya di World Cup TV.'
                                : 'This match has ended. Watch other sports broadcasts on World Cup TV.'}
                            </p>
                          </div>

                          {/* 4. CTA Button (Full width on mobile for better touch targets) */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const worldCupChannel = sportsTv.find(
                                (c) =>
                                  c.name.toLowerCase().includes('world cup') ||
                                  getSlug(c.name) === 'worldcup-tv'
                              );

                              if (worldCupChannel) {
                                selectStream(worldCupChannel, 'sports-tv');
                              } else if (sportsTv.length > 0) {
                                selectStream(sportsTv[0], 'sports-tv');
                              } else {
                                clearStream();
                                setActiveTab('sports-tv');
                              }
                            }}
                            className="w-full md:w-auto mt-1 px-4 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl bg-netflix-red text-white font-black text-[10px] md:text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 hover:bg-red-700 transition-all cursor-pointer"
                          >
                            <Tv size={14} fill="currentColor" />
                            <span>Watch World Cup TV</span>
                          </motion.button>

                        </div>
                      </div>
                    ) : activeStream.servers[activeServerIdx] ? (
                      <>
                        <CustomPlayer
                          url={activeStream.servers[activeServerIdx].url}
                          type={activeStream.servers[activeServerIdx].type}
                          keyId={activeStream.servers[activeServerIdx].keyId}
                          keyVal={activeStream.servers[activeServerIdx].key}
                          keys={activeStream.servers[activeServerIdx].keys}
                        />
                        {/* Floating Emojis Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                          {floatingEmojis.map((emoji) => (
                            <div
                              key={emoji.id}
                              className="absolute text-3xl md:text-4xl floating-emoji select-none"
                              style={{
                                left: `${emoji.x}%`,
                                bottom: `${100 - emoji.y}%`
                              }}
                            >
                              {emoji.emoji}
                            </div>
                          ))}
                        </div>
                        <style dangerouslySetInnerHTML={{__html: `
                          @keyframes floatUpAndFade {
                            0% {
                              transform: translateY(0) scale(0.6);
                              opacity: 0;
                            }
                            15% {
                              transform: translateY(-20px) scale(1.2);
                              opacity: 0.9;
                            }
                            100% {
                              transform: translateY(-150px) scale(0.8);
                              opacity: 0;
                            }
                          }
                          .floating-emoji {
                            animation: floatUpAndFade 2s cubic-bezier(0.25, 1, 0.50, 1) forwards;
                          }
                        `}} />
                      </>
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
                          {(activeStream.isChannel || status === 'live') && viewerCounts[activeStream.id] && (
                            <span className="text-zinc-400 border-l border-white/20 pl-1.5 ml-1.5 normal-case font-bold">
                              {formatViewerCount(viewerCounts[activeStream.id], i18n.language)}
                            </span>
                          )}
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

              {/* Live Match Chat */}
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-3xl p-4 md:p-6 shadow-2xl overflow-hidden flex flex-col h-[400px] md:h-[500px] w-full gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <Film size={16} className="text-netflix-red" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-outfit flex items-center gap-1.5">
                      {t('live_chat')}
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h3>
                  </div>
                  {hasJoinedChat && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Nickname: <span className="text-netflix-red font-black">{chatNickname}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('kny_chat_nickname');
                          setHasJoinedChat(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-white/5"
                        title="Edit Nickname"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                  {!hasJoinedChat ? (
                    /* Username Selector Form */
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-4 gap-4 animate-fade-in">
                      <div className="w-14 h-14 bg-netflix-red/10 border border-netflix-red/20 text-netflix-red rounded-2xl flex items-center justify-center mb-1 shadow-lg shadow-black/20">
                        <Film size={26} />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider font-outfit">{t('choose_nickname')}</h4>
                      
                      <div className="w-full max-w-sm flex flex-col gap-3">
                        <div className="relative w-full flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-netflix-red/50 focus-within:bg-white/[0.08] transition-all pr-2.5">
                          <input
                            type="text"
                            maxLength={20}
                            placeholder={t('nickname_placeholder')}
                            value={chatNickname}
                            onChange={(e) => setChatNickname(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && chatNickname.trim()) {
                                localStorage.setItem('kny_chat_nickname', chatNickname.trim());
                                setHasJoinedChat(true);
                              }
                            }}
                            className="w-full pl-4 pr-24 py-3 bg-transparent border-none text-white text-xs font-semibold focus:outline-none focus:ring-0 placeholder-zinc-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const name = generateRandomNickname();
                              setChatNickname(name);
                            }}
                            className="absolute right-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/5 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
                          >
                            {t('randomize')}
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (chatNickname.trim()) {
                              localStorage.setItem('kny_chat_nickname', chatNickname.trim());
                              setHasJoinedChat(true);
                            }
                          }}
                          disabled={!chatNickname.trim()}
                          className="w-full py-3.5 rounded-xl bg-netflix-red disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-xs uppercase tracking-wider hover:bg-red-700 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-red-950/40"
                        >
                          {t('join_chat')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Chat Room Messages & Send panel */
                    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in relative">
                      {/* Messages Feed */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar mb-3 select-text">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col justify-center items-center text-center text-zinc-500 text-xs font-bold gap-2 select-none">
                            <Film size={20} className="text-zinc-600 animate-pulse" />
                            <span>Mulai percakapan...</span>
                          </div>
                        ) : (
                          chatMessages.map((msg) => {
                            const isMe = msg.user.trim().toLowerCase() === chatNickname.trim().toLowerCase();
                            const avatarGrad = getAvatarGradient(msg.user);
                            const userColor = getUsernameColor(msg.user);
                            const initial = msg.user.trim().charAt(0) || '?';

                            return (
                              <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-fade-in`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-xs font-black uppercase text-white shadow-md shadow-black/20 shrink-0 select-none`}>
                                  {initial}
                                </div>

                                {/* Content column */}
                                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center gap-2 mb-0.5 select-none">
                                    <span 
                                      className="text-[10px] font-black uppercase tracking-wider"
                                      style={{ color: userColor }}
                                    >
                                      {msg.user}
                                    </span>
                                    <span className="text-[8px] text-zinc-500 font-bold">{msg.timestamp}</span>
                                  </div>
                                  <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed break-words select-text border transition-all ${
                                    isMe 
                                      ? 'bg-netflix-red/10 border-netflix-red/25 text-white rounded-tr-none shadow-[0_4px_12px_rgba(229,9,20,0.15)]'
                                      : 'bg-white/[0.03] border-white/5 text-zinc-200 rounded-tl-none shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-white/[0.05]'
                                  }`}>
                                    {msg.text}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        
                        {/* Auto-scroll target */}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Emoji Reactions Bar */}
                      <div className="flex justify-between items-center gap-2 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl mb-3 shrink-0 backdrop-blur-md shadow-inner select-none">
                        {['⚽', '🔥', '👏', '😂', '❤️', '😮'].map((emoji) => (
                          <button
                            type="button"
                            key={emoji}
                            onClick={() => sendEmojiReaction(emoji)}
                            className="flex-1 py-1.5 hover:bg-white/10 active:scale-135 rounded-xl text-xl transition-all duration-200 cursor-pointer flex items-center justify-center select-none hover:shadow-lg hover:shadow-black/20"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      {/* Chat Input Form */}
                      <form onSubmit={sendChatMessage} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl shrink-0 focus-within:border-netflix-red/50 focus-within:bg-white/[0.04] transition-all">
                        <input
                          type="text"
                          maxLength={150}
                          placeholder={t('chat_placeholder')}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 px-3.5 py-2 bg-transparent border-0 text-white text-xs font-semibold focus:outline-none focus:ring-0 placeholder-zinc-500"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim()}
                          className="w-9 h-9 rounded-xl bg-netflix-red disabled:bg-zinc-800/80 disabled:text-zinc-600 text-white font-black hover:bg-red-700 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-lg shadow-red-950/20"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

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
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <Radio size={16} className="animate-pulse text-netflix-red" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-outfit">
                  {t('quick_channels')}
                </h3>
              </div>

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
                      const matchedGame = findWcGame(item, wcGames);
                      const score = getWcScore(item, matchedGame);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            selectStream(item);
                          }}
                          className={`flex flex-col gap-2.5 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isCurrent
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
                                {viewerCounts[item.id] && (
                                  <span className="text-zinc-400 border-l border-white/20 pl-1.5 ml-1.5">
                                    {formatViewerCount(viewerCounts[item.id], i18n.language)}
                                  </span>
                                )}
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
                            {status === 'ended' && score ? (
                              <span className="text-[10px] font-black text-white bg-netflix-red/25 border border-netflix-red/35 px-2 py-0.5 rounded-md select-none font-outfit whitespace-nowrap">
                                {score}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-zinc-500 font-outfit select-none whitespace-nowrap">VS</span>
                            )}
                            <div className="flex items-center gap-2 flex-1 justify-end truncate">
                              <span className="text-xs font-bold text-white truncate">{item.player2}</span>
                              <FlagImage countryName={item.player2 || ''} className="w-6 h-4 shrink-0 rounded-sm" />
                            </div>
                          </div>

                          {item.jadwal_event && (
                            <div className="flex items-center justify-between select-none">
                              <div className="text-[9px] font-black text-zinc-500 flex items-center gap-1.5">
                                <Clock size={11} className="text-netflix-red shrink-0" />
                                <span>{formatJadwal(item.jadwal_event, i18n.language)}</span>
                              </div>
                              {status === 'upcoming' && item.id && toggleReminder && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReminder(item.id);
                                  }}
                                  className={`p-1 rounded-md border transition-all cursor-pointer ${
                                    activeReminders.includes(item.id)
                                      ? 'bg-netflix-red border-netflix-red text-white'
                                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                                  }`}
                                  title={activeReminders.includes(item.id) ? t('reminded') : t('remind_me')}
                                >
                                  <Bell size={9} fill={activeReminders.includes(item.id) ? 'currentColor' : 'none'} />
                                </button>
                              )}
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
                              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider truncate">
                                <span>{item.subName}</span>
                                {viewerCounts[item.id] && (
                                  <>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-netflix-red font-black">
                                      {formatViewerCount(viewerCounts[item.id], i18n.language)}
                                    </span>
                                  </>
                                )}
                              </div>
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
                    {activeTab === 'events' ? t('match_schedule') : activeTab === 'sports-tv' ? 'Sports TV' : activeTab === 'live-tv' ? 'Live TV' : t('stats_standings')}
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
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`shrink-0 py-2 px-4 md:py-3.5 md:px-7 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 md:gap-3 justify-center ${activeTab === 'stats'
                      ? 'bg-netflix-red text-white shadow-lg shadow-red-950/30'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Award className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    {t('stats_standings')}
                  </button>
                </div>
              </div>

              {!loading && !error && (
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-zinc-950/80 via-zinc-900/60 to-black/80 backdrop-blur-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-netflix-red/20 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
                  {/* Stadium background overlay for premium look */}
                  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <img src="/stadium_pitch_bg.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  {/* Gold/Red highlight line on the left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-netflix-red to-amber-500 rounded-l-3xl" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-7 flex-1">
                    {/* Logo Container */}
                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-3.5 rounded-2xl shadow-inner select-none shrink-0">
                      <img
                        src="/yknwc-logo.png"
                        alt="YKN TV Logo"
                        className="w-10 h-10 object-contain rounded-xl"
                      />
                      <div className="text-left font-outfit">
                        <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic text-white block">
                          YKN <span className="text-[#D4AF37]">TV</span>
                        </span>
                        <span className="inline-block text-[8px] bg-gradient-to-r from-[#D4AF37] to-emerald-500 text-black font-black px-1.5 py-0.5 rounded tracking-widest uppercase mt-0.5">
                          WC 2026
                        </span>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center md:text-left space-y-1 md:space-y-1.5 max-w-xl">
                      <span className="inline-block text-[9px] font-black bg-netflix-red/10 border border-netflix-red/20 text-netflix-red px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {t('ykn_tv_promo_badge')}
                      </span>
                      <h3 className="text-sm md:text-base font-black uppercase text-white tracking-wide font-outfit">
                        {t('ykn_tv_promo_title')}
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed">
                        {t('ykn_tv_promo_desc')}
                      </p>
                    </div>
                  </div>

                  {/* Button Container */}
                  <div className="relative z-10 w-full md:w-auto flex justify-center shrink-0">
                    <a
                      href="https://worldcup2026-ykntv.diaww.my.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-netflix-red text-white font-black text-xs md:text-sm uppercase tracking-wider hover:bg-red-700 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer shadow-lg shadow-red-950/40 border border-red-500/20"
                    >
                      {t('ykn_tv_promo_btn')}
                    </a>
                  </div>
                </div>
              )}

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
                        viewerCount={viewerCounts[item.id] || 0}
                        wcGames={wcGames}
                        activeReminders={activeReminders}
                        toggleReminder={toggleReminder}
                      />
                    ))}
                  </div>
                )
              ) : activeTab === 'stats' ? (
                // WORLD CUP STANDINGS & SCORES DASHBOARD
                <WorldCupDashboard i18n={i18n} />
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
                        i18n={i18n}
                        viewerCount={viewerCounts[item.id] || 0}
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

    {/* Custom Premium Toast Notifications */}
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
            className="pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden relative group w-full"
          >
            {/* Countdown Progress Bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: 0 }}
              transition={{ duration: 4, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-[3px] ${
                toast.type === 'success' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : toast.type === 'error' 
                    ? 'bg-gradient-to-r from-netflix-red to-red-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-400'
              }`}
            />

            {/* Icon Column */}
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : toast.type === 'error' 
                  ? 'bg-netflix-red/10 text-netflix-red border border-netflix-red/20' 
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {toast.type === 'success' && <Check size={18} className="stroke-[3]" />}
              {toast.type === 'error' && <ShieldAlert size={18} className="stroke-[2.5]" />}
              {toast.type === 'info' && <Bell size={18} className="stroke-[2.5]" />}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h5 className="text-xs font-black text-white uppercase tracking-wider font-outfit">
                {toast.type === 'success' ? t('success') : toast.type === 'error' ? t('error') : t('info')}
              </h5>
              <p className="text-zinc-400 text-xs font-semibold mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Manual Dismiss Button */}
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>

    <Footer />
  </div>

};

export default LiveSports;
