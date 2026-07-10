type AssetFetcher = {
  fetch(request: Request): Promise<Response>;
};

interface Env {
  ASSETS: AssetFetcher;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/watch' || url.pathname.startsWith('/watch/')) {
      url.pathname = '/watch.html';
      const response = await env.ASSETS.fetch(new Request(url.toString(), request));
      const headers = new Headers(response.headers);
      headers.set('x-ykn-route', 'watch-html');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
