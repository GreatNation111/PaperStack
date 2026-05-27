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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'pdf.worker.min.mjs'],
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
        // Force the new service worker to activate immediately
        skipWaiting: true,
        clientsClaim: true,
        // Remove outdated precache entries so old hashed filenames don't linger
        cleanupOutdatedCaches: true,
        // Include .mjs files (pdf.js worker) in precache – this is THE fix for offline PDF rendering
        globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB – pdf.worker.min.mjs is ~1.5MB
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('node_modules/@tiptap/')) {
            return 'tiptap-vendor';
          }
          if (
            id.includes('node_modules/jszip') ||
            id.includes('node_modules/pako') ||
            id.includes('node_modules/readable-stream')
          ) {
            return 'docx-zip-vendor';
          }
          if (
            id.includes('node_modules/@xmldom') ||
            id.includes('node_modules/xmlbuilder') ||
            id.includes('node_modules/underscore') ||
            id.includes('node_modules/bluebird') ||
            id.includes('node_modules/argparse') ||
            id.includes('node_modules/base64-js') ||
            id.includes('node_modules/dingbat-to-unicode') ||
            id.includes('node_modules/lop') ||
            id.includes('node_modules/path-is-absolute')
          ) {
            return 'docx-support-vendor';
          }
          if (id.includes('node_modules/mammoth')) {
            return 'mammoth';
          }
          if (id.includes('node_modules/firebase/app')) return 'firebase-core';
          if (id.includes('node_modules/firebase/auth')) return 'firebase-auth';
          if (id.includes('node_modules/firebase/firestore')) return 'firebase-firestore';
          if (id.includes('node_modules/firebase/storage')) return 'firebase-storage';
          if (id.includes('node_modules/firebase/messaging')) return 'firebase-messaging';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/motion') || id.includes('node_modules/recharts')) {
            return 'ui-vendor';
          }
          return undefined;
        }
      }
    }
  }
})
