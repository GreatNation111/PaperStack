import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'PaperStack',
        short_name: 'PaperStack',
        description: 'Your Ultimate Past Questions Repository',
        theme_color: '#0A2540',
        background_color: '#0F1115',
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
      // Ensure SW never intercepts Firebase Auth handlers/iframes
      workbox: {
        // Do not apply SPA navigation fallback to auth handlers
        navigateFallbackDenylist: [/^\/__\/auth\//],
        runtimeCaching: [
          {
            // Bypass same-origin requests to /__/auth/* (if any)
            urlPattern: ({ url }) => url.pathname.startsWith('/__/auth/'),
            handler: 'NetworkOnly',
            options: {
              cacheName: 'firebase-auth-bypass-local',
            },
          },
          {
            // Bypass cross-origin Firebase Auth handler/iframe
            urlPattern: /^https?:\/\/([a-zA-Z0-9-]+\.)?firebaseapp\.com\/__\/auth\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'firebase-auth-bypass',
            },
          },
          {
            // As a safeguard, bypass all requests to *.firebaseapp.com
            urlPattern: /^https?:\/\/([a-zA-Z0-9-]+\.)?firebaseapp\.com\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'firebaseapp-bypass',
            },
          },
        ],
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
