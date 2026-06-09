import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { apiDevPlugin } from './dev-server/apiPlugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      host: true,
      port: 5173,
    },
    plugins: [
      react(),
      tailwindcss(),
      apiDevPlugin(env),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/icon.svg'],
        manifest: {
          name: 'Rhythm Repeat',
          short_name: 'RhythmRepeat',
          description: '英語・ドイツ語フレーズをネイティブ発音のリズムで反復練習',
          theme_color: '#1e1b4b',
          background_color: '#030712',
          display: 'standalone',
          orientation: 'portrait',
          lang: 'ja',
          start_url: '/',
          icons: [
            {
              src: 'icons/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'icons/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/texttospeech\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tts-audio-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  }
})
