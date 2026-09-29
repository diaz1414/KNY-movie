import fs from 'fs';
import path from 'path';

console.log('--- Applying SEO Fixes for YKN Ecosystem ---');

// ==========================================
// 1. FIX C:/diaz/YKN-TV
// ==========================================
const yknTvPath = 'C:/diaz/YKN-TV';

if (fs.existsSync(yknTvPath)) {
  console.log('Processing YKN-TV at:', yknTvPath);

  // A. Create/Update public/sitemap.xml
  const tvSitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://tv.ykn.my.id/</loc>
    <lastmod>2026-09-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://tv.ykn.my.id/ykn-tv-logo.png</image:loc>
      <image:title>YKN TV | Live TV &amp; Sports Streaming Indonesia</image:title>
    </image:image>
  </url>
  <url>
    <loc>https://tv.ykn.my.id/status</loc>
    <lastmod>2026-09-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://tv.ykn.my.id/about</loc>
    <lastmod>2026-09-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;
  fs.writeFileSync(path.join(yknTvPath, 'public/sitemap.xml'), tvSitemapContent, 'utf8');
  console.log('✓ Created YKN-TV public/sitemap.xml');

  // B. Update public/robots.txt
  const tvRobotsContent = `# ============================================================
# YKN TV - robots.txt
# ============================================================

User-agent: *
Disallow: /ykn-c0ntr0l-hq
Disallow: /ykn-c0ntr0l-hq/
Disallow: /ykn-c0ntr0l-hq/dashboard
Disallow: /api/
Disallow: /src/
Disallow: /.env

# Allow Googlebot and legitimate search crawlers full access
User-agent: Googlebot
Allow: /
Disallow: /ykn-c0ntr0l-hq
Disallow: /api/

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /
Disallow: /ykn-c0ntr0l-hq
Disallow: /api/

# Block aggressive AI scrapers
User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Bytespider
Disallow: /

# Sitemap
Sitemap: https://tv.ykn.my.id/sitemap.xml
`;
  fs.writeFileSync(path.join(yknTvPath, 'public/robots.txt'), tvRobotsContent, 'utf8');
  console.log('✓ Updated YKN-TV public/robots.txt');

  // C. Update index.html
  let tvIndexHtml = fs.readFileSync(path.join(yknTvPath, 'index.html'), 'utf8');

  // 1. Fix robots meta tag
  tvIndexHtml = tvIndexHtml.replace(
    /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i,
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />'
  );

  // 2. Add dynamic canonical tag & schema
  if (!tvIndexHtml.includes('schema.org') || !tvIndexHtml.includes('BroadcastService')) {
    const tvSchema = `
  <!-- Structured Data: WebSite & BroadcastService for Google Rich Snippets -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://tv.ykn.my.id/#website",
          "url": "https://tv.ykn.my.id/",
          "name": "YKN TV",
          "description": "Nonton TV online dan live streaming siaran langsung olahraga, sepak bola, dan hiburan Indonesia gratis kualitas HD di YKN TV.",
          "inLanguage": "id-ID"
        },
        {
          "@type": "Organization",
          "@id": "https://tv.ykn.my.id/#organization",
          "name": "YKN TV",
          "url": "https://tv.ykn.my.id/",
          "logo": "https://tv.ykn.my.id/ykn-tv-logo.png"
        },
        {
          "@type": "BroadcastService",
          "name": "YKN TV Live Sports & Entertainment",
          "broadcastDisplayName": "YKN TV",
          "videoFormat": "HD",
          "isLiveBroadcast": true
        }
      ]
    }
  </script>`;
    tvIndexHtml = tvIndexHtml.replace('</head>', `${tvSchema}\n</head>`);
  }

  // 3. Whitelist Googlebot in isDevBypassed
  if (tvIndexHtml.includes('function isDevBypassed() {') && !tvIndexHtml.includes('googlebot')) {
    tvIndexHtml = tvIndexHtml.replace(
      'function isDevBypassed() {',
      `function isDevBypassed() {
        var _ua = (navigator.userAgent || '').toLowerCase();
        if (/googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|google-inspectiontool|chrome-lighthouse|screaming frog|mediapartners-google/i.test(_ua)) return true;`
    );
  }

  // 4. Whitelist Googlebot in isBypassed for Ad Redirect
  if (tvIndexHtml.includes('function isBypassed() {') && !tvIndexHtml.includes('_adUa')) {
    tvIndexHtml = tvIndexHtml.replace(
      'function isBypassed() {',
      `function isBypassed() {
        try {
          var _adUa = (navigator.userAgent || '').toLowerCase();
          if (/googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|google-inspectiontool|chrome-lighthouse|screaming frog|mediapartners-google/i.test(_adUa)) return true;
        } catch(e) {}`
    );
  }

  // 5. Add dynamic canonical updater for mirrors (backup-tv.ykn.my.id / worldcup2026-tv.ykn.my.id)
  if (!tvIndexHtml.includes('id="canonical-url"')) {
    tvIndexHtml = tvIndexHtml.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
      `<link rel="canonical" id="canonical-url" href="https://tv.ykn.my.id/" />
  <script>
    try {
      var _cHost = window.location.hostname;
      if (_cHost && _cHost.endsWith('ykn.my.id')) {
        var _cEl = document.getElementById('canonical-url');
        if (_cEl) _cEl.setAttribute('href', window.location.origin + window.location.pathname);
      }
    } catch(e) {}
  </script>`
    );
  }

  // 6. Add crawlable fallback content inside <div id="root">
  if (tvIndexHtml.includes('<div id="root"></div>')) {
    const crawlableTvContent = `<div id="root">
    <!-- Crawlable Pre-rendered Content for Search Engine Crawlers -->
    <header style="padding: 24px 20px; border-bottom: 1px solid #1f1f23; max-width: 1200px; margin: 0 auto; color: #fff; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="font-size: 2rem; font-weight: 800; color: #d4af37; margin: 0 0 10px 0;">YKN TV - Live TV &amp; Sports Streaming Indonesia</h1>
      <p style="color: #a1a1aa; margin: 0; font-size: 1.1rem;">Nonton live streaming siaran langsung olahraga, sepak bola liga top dunia, saluran berita, dan hiburan TV nasional Indonesia online tanpa buffering.</p>
      <nav style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap;">
        <a href="/" style="color: #fff; text-decoration: none; font-weight: 600;">Jadwal Pertandingan</a>
        <a href="/status" style="color: #fff; text-decoration: none; font-weight: 600;">Server Status</a>
        <a href="/about" style="color: #fff; text-decoration: none; font-weight: 600;">Tentang YKN TV</a>
        <a href="https://movies.ykn.my.id" style="color: #E50914; text-decoration: none; font-weight: 600;">YKN Movies</a>
        <a href="https://ykn.my.id" style="color: #d4af37; text-decoration: none; font-weight: 600;">YKN HUB</a>
      </nav>
    </header>
    <main style="max-width: 1200px; margin: 30px auto; padding: 0 20px; color: #d4d4d8; font-family: system-ui, -apple-system, sans-serif;">
      <section>
        <h2 style="color: #fff; font-size: 1.4rem;">Siaran Langsung Olahraga &amp; TV Online Lengkap</h2>
        <p style="line-height: 1.6; color: #a1a1aa;">YKN TV menghadirkan pengalaman nonton live sports online terbaik dan terlengkap dengan pilihan multi-server cadangan berkecepatan tinggi, audio jernih, dan resolusi high definition (HD).</p>
        <ul style="line-height: 1.8; color: #a1a1aa; padding-left: 20px;">
          <li>Live streaming pertandingan sepak bola liga dunia dan turnamen internasional</li>
          <li>Pilihan server cadangan (Backup Server) anti gangguan</li>
          <li>Bisa diputar di smartphone Android, iOS, PC, dan Smart TV</li>
          <li>Akses cepat dan ringan tanpa perlu registrasi akun</li>
        </ul>
      </section>
    </main>
  </div>
  <noscript>
    <div style="background: #09090b; color: #fff; padding: 20px; text-align: center; font-family: sans-serif;">
      <p>Aktifkan JavaScript pada peramban Anda untuk menonton siaran langsung di <strong>YKN TV</strong>.</p>
    </div>
  </noscript>`;
    tvIndexHtml = tvIndexHtml.replace('<div id="root"></div>', crawlableTvContent);
  }

  fs.writeFileSync(path.join(yknTvPath, 'index.html'), tvIndexHtml, 'utf8');
  console.log('✓ Updated YKN-TV index.html with SEO tags, bot whitelisting, and crawlable fallback');

  // D. Update vercel.json in YKN-TV
  const tvVercelPath = path.join(yknTvPath, 'vercel.json');
  if (fs.existsSync(tvVercelPath)) {
    const tvVercel = JSON.parse(fs.readFileSync(tvVercelPath, 'utf8'));
    // Ensure static files like robots.txt and sitemap.xml have headers
    if (!tvVercel.headers) tvVercel.headers = [];
    const hasRobots = tvVercel.headers.some(h => h.source === '/robots.txt');
    if (!hasRobots) {
      tvVercel.headers.push({
        source: '/robots.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' }
        ]
      });
      tvVercel.headers.push({
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' }
        ]
      });
      fs.writeFileSync(tvVercelPath, JSON.stringify(tvVercel, null, 2), 'utf8');
      console.log('✓ Updated YKN-TV vercel.json');
    }
  }
}

// ==========================================
// 2. FIX C:/diaz/ykn-card
// ==========================================
const yknCardPath = 'C:/diaz/ykn-card';

if (fs.existsSync(yknCardPath)) {
  console.log('Processing ykn-card at:', yknCardPath);

  // A. Update index.html with crawlable fallback inside <div id="root">
  let cardIndexHtml = fs.readFileSync(path.join(yknCardPath, 'index.html'), 'utf8');

  if (cardIndexHtml.includes('<div id="root"></div>')) {
    const crawlableCardContent = `<div id="root">
    <!-- Crawlable Pre-rendered Content for Googlebot before React mounts -->
    <header style="padding: 24px 20px; border-bottom: 1px solid #18181b; max-width: 1200px; margin: 0 auto; color: #fff; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="font-size: 2rem; font-weight: 800; color: #E50914; margin: 0 0 10px 0;">YKN HUB - Portal Hiburan Resmi YKN Media</h1>
      <p style="color: #a1a1aa; margin: 0; font-size: 1.1rem;">Akses Cepat Menuju YKN Movies (Streaming Film HD), YKN TV (Live Sports &amp; TV Nasional), dan YKN Anime.</p>
      <nav style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap;">
        <a href="https://movies.ykn.my.id/" style="color: #E50914; text-decoration: none; font-weight: 600;">YKN Movies (Film Bioskop)</a>
        <a href="https://tv.ykn.my.id/" style="color: #d4af37; text-decoration: none; font-weight: 600;">YKN TV (Siaran Bola &amp; TV Live)</a>
        <a href="https://anime.ykn.my.id/" style="color: #3b82f6; text-decoration: none; font-weight: 600;">YKN Anime (Sub Indo)</a>
      </nav>
    </header>
    <main style="max-width: 1200px; margin: 30px auto; padding: 0 20px; color: #d4d4d8; font-family: system-ui, -apple-system, sans-serif;">
      <section>
        <h2 style="color: #fff; font-size: 1.4rem;">Pusat Layanan Streaming Gratis Kualitas HD</h2>
        <p style="line-height: 1.6; color: #a1a1aa;">YKN HUB adalah portal gerbang utama dari seluruh platform streaming YKN Media. Seluruh layanan dapat dinikmati 100% gratis tanpa biaya langganan.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
          <div style="background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px;">
            <h3 style="color: #E50914; margin-top: 0;">🎬 YKN Movies</h3>
            <p style="color: #a1a1aa; font-size: 0.95rem;">Streaming ribuan judul film bioskop box office terbaru dan drama series dengan subtitle bahasa Indonesia berkualitas tinggi.</p>
            <a href="https://movies.ykn.my.id/" style="color: #fff; font-weight: bold; text-decoration: underline;">Buka YKN Movies &rarr;</a>
          </div>
          <div style="background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px;">
            <h3 style="color: #d4af37; margin-top: 0;">⚽ YKN TV</h3>
            <p style="color: #a1a1aa; font-size: 0.95rem;">Siaran langsung sepak bola liga top eropa dan dunia, jadwal pertandingan live harian, dan channel TV hiburan 24 jam.</p>
            <a href="https://tv.ykn.my.id/" style="color: #fff; font-weight: bold; text-decoration: underline;">Buka YKN TV &rarr;</a>
          </div>
          <div style="background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px;">
            <h3 style="color: #3b82f6; margin-top: 0;">⚡ YKN Anime</h3>
            <p style="color: #a1a1aa; font-size: 0.95rem;">Koleksi anime ongoing dan tamat episode terlengkap sub Indo dengan update rilis tercepat setiap minggunya.</p>
            <a href="https://anime.ykn.my.id/" style="color: #fff; font-weight: bold; text-decoration: underline;">Buka YKN Anime &rarr;</a>
          </div>
        </div>
      </section>
    </main>
  </div>
  <noscript>
    <div style="background: #09090b; color: #fff; padding: 20px; text-align: center; font-family: sans-serif;">
      <p>Aktifkan JavaScript di browser Anda untuk menjelajahi semua layanan di <strong>YKN HUB</strong>.</p>
    </div>
  </noscript>`;
    cardIndexHtml = cardIndexHtml.replace('<div id="root"></div>', crawlableCardContent);
    fs.writeFileSync(path.join(yknCardPath, 'index.html'), cardIndexHtml, 'utf8');
    console.log('✓ Updated ykn-card index.html with crawlable fallback and noscript');
  }

  // B. Update vercel.json in ykn-card
  const cardVercelPath = path.join(yknCardPath, 'vercel.json');
  if (fs.existsSync(cardVercelPath)) {
    const cardVercel = JSON.parse(fs.readFileSync(cardVercelPath, 'utf8'));
    if (!cardVercel.headers) cardVercel.headers = [];
    const hasRobots = cardVercel.headers.some(h => h.source === '/robots.txt');
    if (!hasRobots) {
      cardVercel.headers.push({
        source: '/robots.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' }
        ]
      });
      cardVercel.headers.push({
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' }
        ]
      });
      fs.writeFileSync(cardVercelPath, JSON.stringify(cardVercel, null, 2), 'utf8');
      console.log('✓ Updated ykn-card vercel.json');
    }
  }
}

console.log('--- All SEO Fixes Applied Successfully ---');
