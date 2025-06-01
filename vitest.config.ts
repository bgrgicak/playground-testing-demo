import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@wp-playground/cli': path.resolve(__dirname, 'node_modules/@wp-playground/cli/index.js'),
    },
  },
  test: {
    include: ['tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})