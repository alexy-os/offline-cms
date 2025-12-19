/**
 * Vitest setup file.
 * Configures global test environment and cleanup.
 * @module __tests__/config/vitest.setup
 */
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// Global mocks
beforeAll(() => {
  // Mock import.meta.env if not set
  if (!import.meta.env.VITE_GRAPHQL_ENDPOINT) {
    vi.stubEnv('VITE_GRAPHQL_ENDPOINT', 'http://localhost:5001/graphql');
  }
});

// Cleanup temp files after all tests
afterAll(async () => {
  const { rmSync, existsSync } = await import('fs');
  const tmpDir = './tmp';
  if (existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

