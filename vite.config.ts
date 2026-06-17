import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { remAdapter } from './plugins/rem-adapter'

export default defineConfig({
  base: '/mingli-research/',
  plugins: [remAdapter(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'page-flip': resolve(
        __dirname,
        'node_modules/.pnpm/page-flip@2.0.7/node_modules/page-flip/dist/js/page-flip.module.js'
      ),
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@base-ui/react', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
    assetsDir: 'assets',
    ssrManifest: false,
  },
})
