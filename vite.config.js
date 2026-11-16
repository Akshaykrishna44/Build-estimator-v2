import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' lets the built site work from any GitHub Pages path.
export default defineConfig({
  plugins: [react()],
  base: './',
  // SINGLE=1 builds one bundle (used by build:single to make a single self-contained HTML file).
  build: { rollupOptions: { output: { inlineDynamicImports: process.env.SINGLE === '1' } } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: { provider: 'v8', include: ['src/**/*.{js,jsx}'], exclude: ['src/main.jsx', 'src/data/**', 'src/test/**'] },
  },
});
