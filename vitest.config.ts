import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.js', 'scripts/lib/__tests__/**/*.test.js'],
    environment: 'node',
  },
})
