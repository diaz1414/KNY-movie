import { motion } from 'framer-motion';
import type { Match } from '../../services/matchService';
import { formatBracketText } from '../../utils/textFormatter';
import { Play, Radio, Clock, CheckCircle, ChevronRight, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MatchCardProps {
  match: Match;
  onClick: () => void;
  viewerCount?: number;
}

const MatchCard = ({ match, onClick, viewerCount }: MatchCardProps) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isStartingSoon, setIsStartingSoon] = useState(false);
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const [viewers, setViewers] = useState<string>('0');

  useEffect(() => {
    if (!isLive) return;
    const rawPresence = viewerCount || 0;
    const format = (v: number) => {
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
      if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
      return v.toString();
    };
    setViewers(format(rawPresence));
  }, [isLive, viewerCount]);

  useEffect(() => {
    if (match.status !== 'upcoming' || !match.date) return;

    const parseJadwal = (dateStr?: string): Date => {
      if (!dateStr) return new Date();
      let clean = dateStr.trim();
      if (clean.includes(' ')) clean = clean.replace(' ', 'T');
      const tzMatch = clean.match(/([+-]\d{2})$/);
      if (tzMatch) clean += ':00';
      return new Date(clean);
    };

    const kickoff = parseJadwal(match.date);
    const playableStart = new Date(kickoff.getTime() - 30 * 60 * 1000);

    const updateTimer = () => {
      const now = new Date();
      const diffToPlayable = playableStart.getTime() - now.getTime();
      const diffToKickoff = kickoff.getTime() - now.getTime();

      if (diffToPlayable <= 0) {
        setTimeLeftStr('Buka Sekarang');
        setIsStartingSoon(true);
      } else if (diffToKickoff < 60 * 60 * 1000) {
        const mins = Math.ceil(diffToPlayable / (1000 * 60));
        setTimeLeftStr(`Buka dlm ${mins}m`);
        setIsStartingSoon(true);
      } else if (diffToKickoff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diffToKickoff / (1000 * 60 * 60));
        const mins = Math.floor((diffToKickoff / (1000 * 60)) % 60);
        setTimeLeftStr(`${hours}j ${mins}m lagi`);
        setIsStartingSoon(false);
      } else {
        setTimeLeftStr('');
        setIsStartingSoon(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, [match]);

  useEffect(() => {
    if (match.status !== 'finished' || !match.stopDate) {
      setIsGracePeriod(false);
      return;
    }

    const parseJadwalDate = (dateStr?: string): Date => {
      if (!dateStr) return new Date();
      let clean = dateStr.trim();
      if (clean.includes(' ')) clean = clean.replace(' ', 'T');
      const tzMatch = clean.match(/([+-]\d{2})$/);
      if (tzMatch) clean += ':00';
      return new Date(clean);
    };

    const stop = parseJadwalDate(match.stopDate);
    const graceEnd = new Date(stop.getTime() + 30 * 60 * 1000);

    const updateGrace = () => {
      const now = new Date();
      setIsGracePeriod(now <= graceEnd);
    };

    updateGrace();
    const interval = setInterval(updateGrace, 10000);
    return () => clearInterval(interval);
  }, [match.status, match.stopDate]);

  const canWatch = isLive || (isFinished && isGracePeriod) || isStartingSoon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-5 cursor-pointer border transition-all duration-300 backdrop-blur-2xl bg-[#0a0a0a]/98 ${
        isLive
          ? 'border-netflix-red/40 shadow-lg shadow-netflix-red/5'
          : isStartingSoon
          ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
          : isFinished
          ? isGracePeriod
            ? 'border-netflix-red/20 hover:border-netflix-red/40 opacity-90'
            : 'border-white/5 opacity-70'
          : 'border-white/10 hover:border-white/20'
      }`}
      tabIndex={0}
    >
      {/* Glow effect */}
      {isLive && (
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-netflix-red/8 rounded-full blur-3xl pointer-events-none" />
      )}
      {isStartingSoon && !isLive && (
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* League Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 truncate flex items-center gap-1.5">
            {formatBracketText(match.league.name)}
          </span>
        </div>

        {/* Status badge */}
        {isLive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-netflix-red/10 rounded-full border border-netflix-red/25 shrink-0">
            <Radio size={10} className="text-netflix-red animate-pulse" />
            <span className="text-[10px] font-black text-netflix-red uppercase tracking-widest whitespace-nowrap">
              LIVE{viewers && viewerCount ? ` · ${viewers}` : ''}
            </span>
            {viewerCount ? (
              <Users size={9} className="text-netflix-red/70" />
            ) : null}
          </div>
        )}
        {isStartingSoon && !isLive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-500/25 shrink-0 animate-pulse">
            <Clock size={10} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">SEGERA</span>
          </div>
        )}
        {isFinished && !isGracePeriod && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/30 rounded-full border border-zinc-700/10 shrink-0">
            <CheckCircle size={10} className="text-zinc-600" />
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Selesai</span>
          </div>
        )}
      </div>

      {/* Teams vs Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-5">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2 min-w-0">
          <div className="w-12 h-9 rounded-xl bg-white/5 p-1.5 flex items-center justify-center border border-white/5 overflow-hidden">
            <img
              src={match.homeTeam.logo}
              alt={match.homeTeam.name}
              className="h-full w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.png'; }}
            />
          </div>
          <span className="text-xs font-black text-center text-zinc-200 truncate w-full leading-tight">{match.homeTeam.name}</span>
        </div>

        {/* Score / Time */}
        <div className="flex flex-col items-center gap-1">
          {(isLive || isFinished) && match.score ? (
            <div className="text-xl font-black tracking-tighter text-white">
              {match.score}
            </div>
          ) : (
            <div className="text-[11px] font-black text-zinc-500 uppercase tracking-tight bg-white/5 px-2 py-1 rounded-lg border border-white/5">
              {match.time}
            </div>
          )}
          <div className="text-[9px] font-black text-zinc-600 uppercase select-none">VS</div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2 min-w-0">
          <div className="w-12 h-9 rounded-xl bg-white/5 p-1.5 flex items-center justify-center border border-white/5 overflow-hidden">
            <img
              src={match.awayTeam.logo}
              alt={match.awayTeam.name}
              className="h-full w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.png'; }}
            />
          </div>
          <span className="text-xs font-black text-center text-zinc-200 truncate w-full leading-tight">{match.awayTeam.name}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest select-none flex items-center gap-1.5">
          {isLive ? (
            <>
              <Radio size={9} className="text-netflix-red animate-pulse" />
              <span className="text-netflix-red">Tonton Langsung</span>
            </>
          ) : isStartingSoon ? (
            <>
              <Clock size={9} className="text-amber-400" />
              <span className="text-amber-400">{timeLeftStr}</span>
            </>
          ) : isFinished && isGracePeriod ? (
            <>
              <Radio size={9} className="text-netflix-red" />
              <span className="text-netflix-red">Tonton Siaran</span>
            </>
          ) : isFinished ? (
            <>
              <CheckCircle size={9} />
              <span>Pertandingan Selesai</span>
            </>
          ) : (
            <>
              <Clock size={9} />
              <span>{timeLeftStr || 'Akan Datang'}</span>
            </>
          )}
        </div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow ${
          canWatch
            ? 'bg-netflix-red text-white hover:bg-red-600 hover:scale-110'
            : 'bg-white/5 text-zinc-600 border border-white/5'
        }`}>
          {canWatch ? (
            <Play size={11} fill="currentColor" className="ml-0.5" />
          ) : (
            <ChevronRight size={12} className="opacity-30" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
