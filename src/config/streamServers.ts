export interface StreamServerConfig {
  id: string;
  name: string;
  base: string;
  getMovieUrl: (movieId: string | number, startAt?: number) => string;
  getTvUrl: (movieId: string | number, season: number, episode: number, isAutoNext?: boolean, startAt?: number) => string;
  getTvSeriesUrl?: (movieId: string | number) => string;
}

/**
 * Server Configuration:
 * - Server 1 to 3: Custom Subdomain di Cloudflare (Less ads, white-label, direct autoplay, auto Sub Indo ds_lang=id,en)
 * - Server 4 to 6: Domain Resmi VidSrc Langsung (Direct fallback: vidsrc.sh, vidsrc2.ru, vidsrc.ir, auto Sub Indo ds_lang=id,en)
 * - Server 7 to 13: Server cadangan lainnya (vidlink, autoembed, vidsrc.cc, multiembed, warezcdn, nontongo, 2embed)
 */
export const STREAM_SERVERS: StreamServerConfig[] = [
  // ── 1-3: Custom Shield Domains (codai.site - Auto Sub Indo & Resume Support) ──
  {
    id: 'server-1',
    name: 'Server 1 (YKN Primary)',
    base: 'player1ykn.codai.site',
    getMovieUrl: (id, startAt) =>
      `https://player1ykn.codai.site/embed/movie/${id}?ds_lang=id,en${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvUrl: (id, season, episode, isAutoNext, startAt) =>
      `https://player1ykn.codai.site/embed/tv/${id}/${season}/${episode}?ds_lang=id,en${isAutoNext ? '&autonext=1' : ''}${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvSeriesUrl: (id) => `https://player1ykn.codai.site/embed/tv/${id}?ds_lang=id,en`
  },
  {
    id: 'server-2',
    name: 'Server 2 (YKN Backup)',
    base: 'player2ykn.codai.site',
    getMovieUrl: (id, startAt) =>
      `https://player2ykn.codai.site/embed/movie/${id}?ds_lang=id,en${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvUrl: (id, season, episode, isAutoNext, startAt) =>
      `https://player2ykn.codai.site/embed/tv/${id}/${season}/${episode}?ds_lang=id,en${isAutoNext ? '&autonext=1' : ''}${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvSeriesUrl: (id) => `https://player2ykn.codai.site/embed/tv/${id}?ds_lang=id,en`
  },
  {
    id: 'server-3',
    name: 'Server 3 (YKN Mirror)',
    base: 'player3ykn.codai.site',
    getMovieUrl: (id, startAt) =>
      `https://player3ykn.codai.site/embed/movie/${id}?ds_lang=id,en${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvUrl: (id, season, episode, isAutoNext, startAt) =>
      `https://player3ykn.codai.site/embed/tv/${id}/${season}/${episode}?ds_lang=id,en${isAutoNext ? '&autonext=1' : ''}${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvSeriesUrl: (id) => `https://player3ykn.codai.site/embed/tv/${id}?ds_lang=id,en`
  },

  // ── 4-6: VidSrc Official Direct (Auto Sub Indo & Resume Support) ──
  {
    id: 'server-4',
    name: 'Server 4 (VidSrc Primary)',
    base: 'vidsrc.sh',
    getMovieUrl: (id, startAt) =>
      `https://vidsrc.sh/embed/movie/${id}?ds_lang=id,en${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvUrl: (id, season, episode, isAutoNext, startAt) =>
      `https://vidsrc.sh/embed/tv/${id}/${season}/${episode}?ds_lang=id,en${isAutoNext ? '&autonext=1' : ''}${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc.sh/embed/tv/${id}?ds_lang=id,en`
  },
  {
    id: 'server-5',
    name: 'Server 5 (VidSrc Backup)',
    base: 'vidsrc2.ru',
    getMovieUrl: (id, startAt) =>
      `https://vidsrc2.ru/embed/movie/${id}?ds_lang=id,en${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvUrl: (id, season, episode, isAutoNext, startAt) =>
      `https://vidsrc2.ru/embed/tv/${id}/${season}/${episode}?ds_lang=id,en${isAutoNext ? '&autonext=1' : ''}${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc2.ru/embed/tv/${id}?ds_lang=id,en`
  },
  {
    id: 'server-6',
    name: 'Server 6 (VidSrc Mirror)',
    base: 'vidsrc.ir',
    getMovieUrl: (id, startAt) =>
      `https://vidsrc.ir/embed/movie/${id}?ds_lang=id,en${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvUrl: (id, season, episode, isAutoNext, startAt) =>
      `https://vidsrc.ir/embed/tv/${id}/${season}/${episode}?ds_lang=id,en${isAutoNext ? '&autonext=1' : ''}${startAt && startAt > 0 ? `&startAt=${startAt}` : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc.ir/embed/tv/${id}?ds_lang=id,en`
  },

  // ── 7-13: Shifted Original Servers ──
  {
    id: 'server-7',
    name: 'Server 7 (HD Stream)',
    base: 'vidlink.pro',
    getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://vidlink.pro/tv/${id}/${season}/${episode}${isAutoNext ? '&autonext=true' : ''}`,
    getTvSeriesUrl: (id) => `https://vidlink.pro/tv/${id}`
  },
  {
    id: 'server-8',
    name: 'Server 8 (Regional)',
    base: 'autoembed.co',
    getMovieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://autoembed.co/tv/tmdb/${id}`
  },
  {
    id: 'server-9',
    name: 'Server 9 (Global)',
    base: 'vidsrc.cc',
    getMovieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc.cc/v2/embed/tv/${id}`
  },
  {
    id: 'server-10',
    name: 'Server 10 (Super)',
    base: 'multiembed.mov',
    getMovieUrl: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
  },
  {
    id: 'server-11',
    name: 'Server 11 (Extended)',
    base: 'warezcdn.com',
    getMovieUrl: (id) => `https://embed.warezcdn.com/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://embed.warezcdn.com/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://embed.warezcdn.com/tv/${id}`
  },
  {
    id: 'server-12',
    name: 'Server 12 (Direct)',
    base: 'nontongo.win',
    getMovieUrl: (id) => `https://www.nontongo.win/embed/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://www.nontongo.win/embed/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://www.nontongo.win/embed/tv/${id}`
  },
  {
    id: 'server-13',
    name: 'Server 13 (Alternative)',
    base: '2embed.cc',
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://www.2embed.cc/embed/${id}`
  }
];

export const getMovieStreamSources = (cleanId: string | number) => {
  const sources = STREAM_SERVERS.map((server) => ({
    name: server.name,
    url: server.getMovieUrl(cleanId)
  }));
  // Server Indo (Mino) as original in api.ts
  sources.push({
    name: 'Server Indo (Mino)',
    url: `https://minochinos.com/embed/${cleanId}`
  });
  return sources;
};

export const getTvStreamSources = (cleanId: string | number) => {
  return STREAM_SERVERS.map((server) => ({
    name: server.name,
    url: server.getTvSeriesUrl ? server.getTvSeriesUrl(cleanId) : server.getTvUrl(cleanId, 1, 1)
  }));
};

export const buildStreamUrl = (
  server: { base: string; name?: string } | undefined,
  params: {
    movieId: string | number;
    isTV: boolean;
    currentSeason?: number;
    currentEpisode?: number;
    isAutoNextEnabled?: boolean;
    startAt?: number;
  }
): string => {
  if (!server) return '';
  const { movieId, isTV, currentSeason = 1, currentEpisode = 1, isAutoNextEnabled = false, startAt } = params;

  const matched = STREAM_SERVERS.find((s) => server.base.includes(s.base) || s.base.includes(server.base));
  if (matched) {
    return isTV
      ? matched.getTvUrl(movieId, currentSeason, currentEpisode, isAutoNextEnabled, startAt)
      : matched.getMovieUrl(movieId, startAt);
  }

  // Fallback for official or legacy domains
  const extra = isAutoNextEnabled ? (server.base.includes('vidlink') ? '&autonext=true' : '?autonext=1') : '';
  const startParam = startAt && startAt > 0 ? `&startAt=${startAt}` : '';
  if (isTV) {
    if (server.base.includes('player1ykn.codai.site') || server.base.includes('player1.ykn.my.id')) {
      return `https://player1ykn.codai.site/embed/tv/${movieId}/${currentSeason}/${currentEpisode}?ds_lang=id,en${extra}${startParam}`;
    }
    if (server.base.includes('player2ykn.codai.site') || server.base.includes('player2.ykn.my.id')) {
      return `https://player2ykn.codai.site/embed/tv/${movieId}/${currentSeason}/${currentEpisode}?ds_lang=id,en${extra}${startParam}`;
    }
    if (server.base.includes('player3ykn.codai.site') || server.base.includes('player3.ykn.my.id')) {
      return `https://player3ykn.codai.site/embed/tv/${movieId}/${currentSeason}/${currentEpisode}?ds_lang=id,en${extra}${startParam}`;
    }
    if (server.base.includes('vidsrc.sh') || server.base.includes('vidsrcme.su')) {
      return `https://vidsrc.sh/embed/tv/${movieId}/${currentSeason}/${currentEpisode}?ds_lang=id,en${extra}${startParam}`;
    }
    if (server.base.includes('vidsrc2.ru') || server.base.includes('vidsrcme.ru')) {
      return `https://vidsrc2.ru/embed/tv/${movieId}/${currentSeason}/${currentEpisode}?ds_lang=id,en${extra}${startParam}`;
    }
    if (server.base.includes('vidsrc.ir') || server.base.includes('vidsrc-me.ru')) {
      return `https://vidsrc.ir/embed/tv/${movieId}/${currentSeason}/${currentEpisode}?ds_lang=id,en${extra}${startParam}`;
    }
    return server.base;
  } else {
    if (server.base.includes('player1ykn.codai.site') || server.base.includes('player1.ykn.my.id')) {
      return `https://player1ykn.codai.site/embed/movie/${movieId}?ds_lang=id,en${startParam}`;
    }
    if (server.base.includes('player2ykn.codai.site') || server.base.includes('player2.ykn.my.id')) {
      return `https://player2ykn.codai.site/embed/movie/${movieId}?ds_lang=id,en${startParam}`;
    }
    if (server.base.includes('player3ykn.codai.site') || server.base.includes('player3.ykn.my.id')) {
      return `https://player3ykn.codai.site/embed/movie/${movieId}?ds_lang=id,en${startParam}`;
    }
    if (server.base.includes('vidsrc.sh') || server.base.includes('vidsrcme.su')) {
      return `https://vidsrc.sh/embed/movie/${movieId}?ds_lang=id,en${startParam}`;
    }
    if (server.base.includes('vidsrc2.ru') || server.base.includes('vidsrcme.ru')) {
      return `https://vidsrc2.ru/embed/movie/${movieId}?ds_lang=id,en${startParam}`;
    }
    if (server.base.includes('vidsrc.ir') || server.base.includes('vidsrc-me.ru')) {
      return `https://vidsrc.ir/embed/movie/${movieId}?ds_lang=id,en${startParam}`;
    }
    return server.base;
  }
};
