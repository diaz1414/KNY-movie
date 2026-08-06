import { Play, Radio, Tv } from 'lucide-react';
import type { PlayableStream } from '../../services/streamService';
import { formatBracketText } from '../../utils/textFormatter';

interface ChannelCardProps {
  stream: PlayableStream;
  onClick: () => void;
}

const ChannelCard = ({ stream, onClick }: ChannelCardProps) => {
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).yknAdRedirect) {
      try {
        (window as any).yknAdRedirect();
      } catch (err) {
        console.error('[Ads] Redirect error:', err);
      }
    }
    onClick();
  };

  const hasLogo = stream.logo && stream.logo.trim().length > 0;

  return (
    <div
      onClick={handleClick}
      className="group bg-zinc-950/96 backdrop-blur-2xl hover:bg-zinc-900/98 border border-white/10 rounded-2xl p-3 md:p-5 transition-all duration-300 cursor-pointer hover:border-netflix-red/35 relative overflow-hidden shadow-xl active:scale-95"
      tabIndex={0}
    >
      {/* Accent Glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-netflix-red/5 rounded-full blur-3xl group-hover:bg-netflix-red/10 transition-all duration-500" />

      <div className="flex flex-col gap-3 md:gap-5 relative z-10">
        {/* Top row: logo + LIVE badge */}
        <div className="flex justify-between items-start">
          {hasLogo ? (
            <div className="h-10 w-14 md:h-14 md:w-20 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform overflow-hidden border border-white/5">
              <img
                src={stream.logo}
                alt={stream.name}
                className="h-full max-w-full object-contain filter brightness-110"
                onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.png'; }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center p-2 group-hover:scale-105 transition-transform border border-white/5 text-zinc-500">
              <Tv size={20} />
            </div>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 select-none">
            <Radio size={10} className="text-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
          </div>
        </div>

        {/* Channel name */}
        <div>
          <h3 className="text-sm md:text-base font-outfit font-black tracking-tight text-white group-hover:text-netflix-red transition-colors line-clamp-1">{stream.name}</h3>
          <div className="text-[10px] text-zinc-500 font-bold line-clamp-1 italic mt-0.5 uppercase tracking-wider flex items-center gap-1 flex-wrap">
            {formatBracketText(stream.subName)}
          </div>
        </div>

        {/* Watch button */}
        <button className="flex items-center justify-between w-full py-2.5 md:py-3.5 px-3 md:px-4 bg-white/5 group-hover:bg-netflix-red group-hover:text-white text-white rounded-xl md:rounded-2xl font-black transition-all duration-300">
          <span className="text-[10px] md:text-xs uppercase tracking-wide">Tonton</span>
          <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
            <Play size={10} fill="currentColor" className="ml-0.5" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChannelCard;
