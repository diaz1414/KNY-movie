type AssetFetcher = {
  fetch(request: Request): Promise<Response>;
};

interface Env {
  ASSETS: AssetFetcher;
}

export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/watch' || url.pathname.startsWith('/watch/')) {
      url.pathname = '/watch.html';
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
