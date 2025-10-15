import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: false, // Disabled to prevent duplicate instances when debugging
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@managers': resolve(__dirname, 'src/managers'),
      '@objects': resolve(__dirname, 'src/objects'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@config': resolve(__dirname, 'src/config'),
      '@renderers': resolve(__dirname, 'src/renderers'),
    },
  },
  esbuild: {
    sourcemap: true,
  },
});
