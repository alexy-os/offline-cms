/**
 * Test adapter factory and utilities.
 * Creates test-ready storage adapters with cleanup.
 * @module __tests__/helpers/adapters.helper
 */
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import type { StorageAdapter, CachedCollections } from '../../adapters/core';
import { JsonAdapter } from '../../adapters/json';
import { TEST_TMP_DIR } from '../config/test-env';

/** Supported adapter types for testing */
export type TestAdapterType = 'json' | 'lmdb' | 'sqlite' | 'memory';

/** Configuration for creating test adapters */
export interface TestAdapterConfig {
  type: TestAdapterType;
  /** Custom path for adapter storage */
  path?: string;
  /** Auto-cleanup on dispose (default: true) */
  cleanup?: boolean;
}

/** Test adapter with cleanup method */
export interface TestableAdapter<T = CachedCollections> extends StorageAdapter<T> {
  /** Cleanup adapter resources and temp files */
  dispose(): Promise<void>;
}

/**
 * In-memory storage adapter for fast unit tests.
 * No I/O operations - all data stored in memory.
 */
export class MemoryAdapter<T = CachedCollections> implements TestableAdapter<T> {
  public name = 'memory';
  private data: T | null = null;

  /**
   * Gets all stored data.
   * @returns Stored collections or throws if empty
   */
  async getAll(): Promise<T> {
    if (this.data === null) {
      throw new Error('Memory store is empty');
    }
    return structuredClone(this.data);
  }

  /**
   * Saves data to memory.
   * @param data - Collections to store
   */
  async saveAll(data: T): Promise<void> {
    this.data = structuredClone(data);
  }

  /**
   * Checks if data exists in memory.
   * @returns True if data is stored
   */
  async health(): Promise<boolean> {
    return this.data !== null;
  }

  /**
   * Clears memory storage.
   */
  async dispose(): Promise<void> {
    this.data = null;
  }

  /**
   * Checks if memory store is empty.
   */
  isEmpty(): boolean {
    return this.data === null;
  }
}

/**
 * Generates unique temp path for test adapter.
 * @param type - Adapter type
 * @returns Unique temp path
 */
export function getTempPath(type: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return join(TEST_TMP_DIR, `test-${type}-${timestamp}-${random}`);
}

/**
 * Ensures temp directory exists.
 */
export function ensureTempDir(): void {
  if (!existsSync(TEST_TMP_DIR)) {
    mkdirSync(TEST_TMP_DIR, { recursive: true });
  }
}

/**
 * Cleans up temp directory.
 */
export function cleanupTempDir(): void {
  if (existsSync(TEST_TMP_DIR)) {
    rmSync(TEST_TMP_DIR, { recursive: true, force: true });
  }
}

/**
 * Wraps adapter with cleanup functionality.
 * @param adapter - Base adapter
 * @param path - Path to cleanup
 * @returns Adapter with dispose method
 */
function wrapWithCleanup<T>(
  adapter: StorageAdapter<T>,
  path: string
): TestableAdapter<T> {
  return {
    ...adapter,
    name: adapter.name,
    getAll: () => adapter.getAll(),
    saveAll: (data: T) => adapter.saveAll(data),
    health: () => adapter.health(),
    async dispose() {
      if (existsSync(path)) {
        rmSync(path, { recursive: true, force: true });
      }
    },
  };
}

/**
 * Creates a test adapter instance.
 * Use for unit and integration tests.
 * @param config - Adapter configuration
 * @returns Testable adapter with cleanup
 * @example
 * ```ts
 * const adapter = createTestAdapter({ type: 'memory' });
 * await adapter.saveAll(sampleCollections);
 * const data = await adapter.getAll();
 * await adapter.dispose();
 * ```
 */
export function createTestAdapter(
  config: TestAdapterConfig
): TestableAdapter<CachedCollections> {
  const { type, path } = config;

  switch (type) {
    case 'memory':
      return new MemoryAdapter<CachedCollections>();

    case 'json': {
      ensureTempDir();
      const jsonPath = path || getTempPath('data.json');
      const adapter = new JsonAdapter(jsonPath);
      return wrapWithCleanup(adapter, jsonPath);
    }

    case 'lmdb': {
      // LMDB requires dynamic import due to native bindings
      // Use memory adapter as fallback in tests
      console.warn('LMDB adapter not available in test environment, using memory adapter');
      return new MemoryAdapter<CachedCollections>();
    }

    case 'sqlite': {
      // SQLite adapter for integration tests (future implementation)
      console.warn('SQLite adapter not implemented, using memory adapter');
      return new MemoryAdapter<CachedCollections>();
    }

    default:
      throw new Error(`Unknown adapter type: ${type}`);
  }
}

/**
 * Creates a memory adapter for fast unit tests.
 * Shorthand for createTestAdapter({ type: 'memory' }).
 * @returns Memory adapter instance
 */
export function createMemoryAdapter(): MemoryAdapter<CachedCollections> {
  return new MemoryAdapter<CachedCollections>();
}

