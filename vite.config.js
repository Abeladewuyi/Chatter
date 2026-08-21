import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { FaceAngry } from 'lucide-react'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Chatter',
        short_name: 'Chatter',
        description: 'A modern social media app',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f0f14',
        theme_color: '#7c5cff',
        orientation: 'portrait-primary',

        icons: [
          {
            src: '/icons/chatter-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/chatter-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/chatter-icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      workbox: {
        cleanupOutdatedCaches: true
      },

      devOptions: {
        enabled: true
      }
    })
  ]
})