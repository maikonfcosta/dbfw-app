import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.jpg', 'dbfw_data.json'],
      manifest: {
        name: 'DBFW Pro',
        short_name: 'DBFW Pro',
        description: 'O melhor construtor de decks e base de dados para Dragon Ball Fusion World',
        theme_color: '#0a0e17',
        background_color: '#0a0e17',
        display: 'standalone',
        icons: [
          {
            src: '/icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ]
})
