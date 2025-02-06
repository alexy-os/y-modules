/// <reference types="vite" />
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@y-modules/core': resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['@y-modules/core'],
    force: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    commonjsOptions: {
      include: [/@y-modules\/core/, /node_modules/],
    },
  },
}); 