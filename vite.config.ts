import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MyTradingJournal',
        short_name: 'FX Journal',
        description: 'A modern trading journal app for tracking your trades and performance.',
        start_url: '.',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#2563eb',
        icons: [
          {
            src: '/pwa-512x512pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512pwa-192x192.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    })
  ],
})
