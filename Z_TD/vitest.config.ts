import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/vite-env.d.ts', 'src/main.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
    },
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
      'pixi.js': resolve(__dirname, '__mocks__/pixi.js'),
    },
  },
});
