import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    manifest: {
      name: 'Yuk Kita Nonton (YKN)',
      short_name: 'YKN',
      description: 'Streaming Film & Serial Premium',
      theme_color: '#E50914',
      background_color: '#000000',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
  navigateFallbackDenylist: [
  /^\/api\//,
  /^\/watch\.html/,
  /^\/watch/,
],
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname === '/watch.html',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'watch-html',
        networkTimeoutSeconds: 2,
        expiration: {
          maxEntries: 3,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'watch-assets',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
}
  }), {
    name: 'rewrite-watch',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/watch') && !req.url.includes('.html')) {
          const url = new URL(req.url, `http://${req.headers.host}`);
          req.url = '/watch.html' + url.search;
        }
        next();
      });
    }
  }, cloudflare()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        watch: resolve(__dirname, 'watch.html'),
      },
    },
  },
})