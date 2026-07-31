import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base './' gjør at appen fungerer på GitHub Pages uansett repo-navn,
// og sammen med HashRouter gir en sideoppdatering aldri 404.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['skylleviga-kart.jpg', 'icon.svg'],
      manifest: {
        name: 'Skylleviga Hagefest',
        short_name: 'Skylleviga',
        description: 'Skylleviga Hagefest',
        theme_color: '#0e7490',
        background_color: '#fff7e6',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: undefined,
        // Kartfliser caches så GPS-kartet tåler dårlig dekning underveis.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(server\.arcgisonline\.com|tile\.openstreetmap\.org)\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kart-fliser',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
