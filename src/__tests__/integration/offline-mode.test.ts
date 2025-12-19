/**
 * Integration tests for offline mode.
 * Tests real offline scenarios with storage adapters.
 * @module __tests__/integration/offline-mode.test
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createOfflineContext,
  createMockResponse,
  type OfflineTestContext,
} from '../helpers/offline.helper';
import {
  createTestAdapter,
  type TestableAdapter,
} from '../helpers/adapters.helper';
import { sampleCollections, emptyCollections } from '../helpers/fixtures';
import type { CachedCollections } from '../../adapters/core';
import { fetchApiHealth, getLocalData } from '../../lib/graphql';

describe('Offline mode integration', () => {
  let offlineCtx: OfflineTestContext;
  let adapter: TestableAdapter<CachedCollections>;

  beforeEach(() => {
    offlineCtx = createOfflineContext();
    adapter = createTestAdapter({ type: 'memory' });
  });

  afterEach(async () => {
    offlineCtx.restore();
    await adapter.dispose();
  });

  describe('Offline-first data access', () => {
    it('should serve cached data when offline', async () => {
      // Save data while online
      await adapter.saveAll(sampleCollections);

      // Go offline
      offlineCtx.goOffline();

      // Should still access local data
      const data = await adapter.getAll();
      expect(data.posts).toEqual(sampleCollections.posts);
    });

    it('should handle empty cache when offline', async () => {
      offlineCtx.goOffline();

      // Memory adapter throws when empty
      await expect(adapter.getAll()).rejects.toThrow();
    });

    it('should allow writes while offline', async () => {
      offlineCtx.goOffline();

      // Should be able to save locally
      await adapter.saveAll(sampleCollections);
      const data = await adapter.getAll();

      expect(data.posts).toHaveLength(2);
    });
  });

  describe('Network state transitions', () => {
    it('should detect offline state', async () => {
      offlineCtx.goOffline();
      expect(offlineCtx.isOffline()).toBe(true);

      const health = await fetchApiHealth();
      expect(health.status).toBe('offline');
    });

    it('should detect online state', async () => {
      offlineCtx.goOffline();
      offlineCtx.goOnline();

      expect(offlineCtx.isOffline()).toBe(false);
    });

    it('should handle rapid state changes', async () => {
      offlineCtx.goOffline();
      offlineCtx.goOnline();
      offlineCtx.goOffline();
      offlineCtx.goOnline();

      expect(offlineCtx.isOffline()).toBe(false);
    });
  });

  describe('Slow network simulation', () => {
    it('should handle slow network delays', async () => {
      // Store original fetch before mocking
      const originalFetch = globalThis.fetch;
      
      // Create mock that simulates delay
      const delayMs = 100;
      globalThis.fetch = vi.fn().mockImplementation(async (...args) => {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return createMockResponse({ status: 'ok' });
      });

      const start = Date.now();
      await fetchApiHealth();
      const duration = Date.now() - start;

      // Restore fetch
      globalThis.fetch = originalFetch;

      // Should have delay (allow some margin for execution time)
      expect(duration).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Data synchronization patterns', () => {
    it('should cache remote data locally', async () => {
      // Simulate fetching from remote
      const remoteData = { ...sampleCollections };

      // Cache locally
      await adapter.saveAll(remoteData);

      // Verify cached
      const cached = await adapter.getAll();
      expect(cached).toEqual(remoteData);

      // Go offline - data should still be available
      offlineCtx.goOffline();
      const offlineData = await adapter.getAll();
      expect(offlineData).toEqual(remoteData);
    });

    it('should preserve local changes during offline', async () => {
      // Initial sync
      await adapter.saveAll(sampleCollections);

      // Go offline and modify
      offlineCtx.goOffline();

      const modified = await adapter.getAll();
      modified.posts.push({ id: 999, title: 'Offline Post' } as any);
      await adapter.saveAll(modified);

      // Verify changes persisted
      const result = await adapter.getAll();
      expect(result.posts).toHaveLength(3);
      expect(result.posts.find((p: any) => p.id === 999)).toBeDefined();
    });

    it('should handle multiple offline sessions', async () => {
      // First session
      await adapter.saveAll(sampleCollections);
      offlineCtx.goOffline();

      const session1Data = await adapter.getAll();
      session1Data.posts[0].title = 'Modified in session 1';
      await adapter.saveAll(session1Data);

      // Simulate session end (go online)
      offlineCtx.goOnline();

      // Second offline session
      offlineCtx.goOffline();

      const session2Data = await adapter.getAll();
      expect(session2Data.posts[0].title).toBe('Modified in session 1');
    });
  });

  describe('Error recovery', () => {
    it('should recover from network errors', async () => {
      // Start with data
      await adapter.saveAll(sampleCollections);

      // Simulate network error
      offlineCtx.mockNetworkError();

      // Local access should work
      const localData = await adapter.getAll();
      expect(localData.posts).toBeDefined();

      // Recover
      offlineCtx.goOnline();
      expect(offlineCtx.isOffline()).toBe(false);
    });

    it('should maintain data integrity after errors', async () => {
      const originalData = { ...sampleCollections };
      await adapter.saveAll(originalData);

      // Cause error
      offlineCtx.mockNetworkError();

      // Data should be intact
      const data = await adapter.getAll();
      expect(data.posts).toEqual(originalData.posts);
    });
  });
});

describe('Adapter failover', () => {
  let primaryAdapter: TestableAdapter<CachedCollections>;
  let backupAdapter: TestableAdapter<CachedCollections>;

  beforeEach(() => {
    primaryAdapter = createTestAdapter({ type: 'memory' });
    backupAdapter = createTestAdapter({ type: 'memory' });
  });

  afterEach(async () => {
    await primaryAdapter.dispose();
    await backupAdapter.dispose();
  });

  it('should use backup when primary is empty', async () => {
    // Only backup has data
    await backupAdapter.saveAll(sampleCollections);

    // Primary is empty, should fail
    await expect(primaryAdapter.getAll()).rejects.toThrow();

    // Backup should work
    const data = await backupAdapter.getAll();
    expect(data.posts).toBeDefined();
  });

  it('should sync data between adapters', async () => {
    // Save to primary
    await primaryAdapter.saveAll(sampleCollections);

    // Sync to backup
    const primaryData = await primaryAdapter.getAll();
    await backupAdapter.saveAll(primaryData);

    // Both should have same data
    const backupData = await backupAdapter.getAll();
    expect(backupData).toEqual(primaryData);
  });

  it('should restore from backup', async () => {
    // Backup has data
    await backupAdapter.saveAll(sampleCollections);

    // Restore to primary
    const backupData = await backupAdapter.getAll();
    await primaryAdapter.saveAll(backupData);

    // Primary should now have data
    const primaryData = await primaryAdapter.getAll();
    expect(primaryData.posts).toEqual(sampleCollections.posts);
  });
});

