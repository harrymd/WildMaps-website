import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/wildmaps/',
  plugins: [react()],
  test: {
    // Vitest configuration — run tests in a browser-like DOM environment
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
