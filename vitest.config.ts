import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.js',
      'scripts/lib/__tests__/**/*.test.js',
      'src/components/ModalReader/**/*.test.ts',
    ],
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    setupFiles: ['tests/setup-dom.ts'],
  },
})
