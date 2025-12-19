import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

/**
 * Vitest configuration for TDD workflow.
 * Portable setup - can be adapted to Jest for SSR projects.
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/__tests__/config/vitest.setup.ts'],

    // Test patterns
    include: [
      'src/__tests__/**/*.test.ts',
      'src/__tests__/**/*.test.tsx',
    ],

    // Exclusions
    exclude: [
      'node_modules',
      'dist',
      'src/__tests__/config/*',
      'src/__tests__/helpers/*',
    ],

    // Global test APIs (describe, it, expect)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },

    // Timeouts for integration tests
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode settings
    watch: true,
    watchExclude: ['node_modules', 'dist', 'coverage'],
  },
});

