export interface StreamServerConfig {
  id: string;
  name: string;
  base: string;
  getMovieUrl: (movieId: string | number) => string;
  getTvUrl: (movieId: string | number, season: number, episode: number, isAutoNext?: boolean) => string;
  getTvSeriesUrl?: (movieId: string | number) => string;
}

/**
 * Server Configuration:
 * - Server 1 to 3 updated to official active VidSrc domains (https://vidsrc.sh/vidsrc/docs/):
 *   Server 1: vidsrc.sh
 *   Server 2: vidsrc2.ru
 *   Server 3: vidsrc.ir
 * - Server 4 to 10 retained as original.
 */
export const STREAM_SERVERS: StreamServerConfig[] = [
  {
    id: 'server-1',
    name: 'Server 1 (Primary)',
    base: 'vidsrc.sh',
    getMovieUrl: (id) => `https://vidsrc.sh/embed/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://vidsrc.sh/embed/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc.sh/embed/tv/${id}`
  },
  {
    id: 'server-2',
    name: 'Server 2 (Backup)',
    base: 'vidsrc2.ru',
    getMovieUrl: (id) => `https://vidsrc2.ru/embed/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://vidsrc2.ru/embed/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc2.ru/embed/tv/${id}`
  },
  {
    id: 'server-3',
    name: 'Server 3 (Mirror)',
    base: 'vidsrc.ir',
    getMovieUrl: (id) => `https://vidsrc.ir/embed/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://vidsrc.ir/embed/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc.ir/embed/tv/${id}`
  },
  {
    id: 'server-4',
    name: 'Server 4 (HD Stream)',
    base: 'vidlink.pro',
    getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://vidlink.pro/tv/${id}/${season}/${episode}${isAutoNext ? '&autonext=true' : ''}`,
    getTvSeriesUrl: (id) => `https://vidlink.pro/tv/${id}`
  },
  {
    id: 'server-5',
    name: 'Server 5 (Regional)',
    base: 'autoembed.co',
    getMovieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://autoembed.co/tv/tmdb/${id}`
  },
  {
    id: 'server-6',
    name: 'Server 6 (Global)',
    base: 'vidsrc.cc',
    getMovieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://vidsrc.cc/v2/embed/tv/${id}`
  },
  {
    id: 'server-7',
    name: 'Server 7 (Super)',
    base: 'multiembed.mov',
    getMovieUrl: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
  },
  {
    id: 'server-8',
    name: 'Server 8 (Extended)',
    base: 'warezcdn.com',
    getMovieUrl: (id) => `https://embed.warezcdn.com/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://embed.warezcdn.com/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://embed.warezcdn.com/tv/${id}`
  },
  {
    id: 'server-9',
    name: 'Server 9 (Direct)',
    base: 'nontongo.win',
    getMovieUrl: (id) => `https://www.nontongo.win/embed/movie/${id}`,
    getTvUrl: (id, season, episode, isAutoNext) =>
      `https://www.nontongo.win/embed/tv/${id}/${season}/${episode}${isAutoNext ? '?autonext=1' : ''}`,
    getTvSeriesUrl: (id) => `https://www.nontongo.win/embed/tv/${id}`
  },
  {
    id: 'server-10',
    name: 'Server 10 (Alternative)',
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
  }
): string => {
  if (!server) return '';
  const { movieId, isTV, currentSeason = 1, currentEpisode = 1, isAutoNextEnabled = false } = params;

  const matched = STREAM_SERVERS.find((s) => server.base.includes(s.base) || s.base.includes(server.base));
  if (matched) {
    return isTV
      ? matched.getTvUrl(movieId, currentSeason, currentEpisode, isAutoNextEnabled)
      : matched.getMovieUrl(movieId);
  }

  // Fallback for legacy domains or custom bases
  const extra = isAutoNextEnabled ? (server.base.includes('vidlink') ? '&autonext=true' : '?autonext=1') : '';
  if (isTV) {
    if (server.base.includes('vidsrcme.su') || server.base.includes('vidsrcme.ru') || server.base.includes('vidsrc-me.ru')) {
      return `https://${server.base}/embed/tv/${movieId}/${currentSeason}/${currentEpisode}${extra}`;
    }
    return server.base;
  } else {
    if (server.base.includes('vidsrcme.su') || server.base.includes('vidsrcme.ru') || server.base.includes('vidsrc-me.ru')) {
      return `https://${server.base}/embed/movie/${movieId}`;
    }
    return server.base;
  }
};
