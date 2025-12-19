/**
 * Contract tests for StorageAdapter interface.
 * Validates that all adapter implementations follow the contract.
 * These tests ensure portability across different storage backends.
 * @module __tests__/unit/adapters/storage-adapter.contract.test
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { StorageAdapter, CachedCollections } from '../../../adapters/core';
import {
  createTestAdapter,
  MemoryAdapter,
  type TestableAdapter,
  type TestAdapterType,
} from '../../helpers/adapters.helper';
import { sampleCollections, emptyCollections } from '../../helpers/fixtures';

/**
 * Runs contract tests for a specific adapter type.
 * Use this to validate any StorageAdapter implementation.
 * @param adapterType - Type of adapter to test
 */
function runAdapterContractTests(adapterType: TestAdapterType) {
  describe(`StorageAdapter contract: ${adapterType}`, () => {
    let adapter: TestableAdapter<CachedCollections>;

    beforeEach(() => {
      adapter = createTestAdapter({ type: adapterType });
    });

    afterEach(async () => {
      await adapter.dispose();
    });

    describe('interface compliance', () => {
      it('should have name property', () => {
        expect(adapter.name).toBeDefined();
        expect(typeof adapter.name).toBe('string');
        expect(adapter.name.length).toBeGreaterThan(0);
      });

      it('should have getAll method', () => {
        expect(typeof adapter.getAll).toBe('function');
      });

      it('should have saveAll method', () => {
        expect(typeof adapter.saveAll).toBe('function');
      });

      it('should have health method', () => {
        expect(typeof adapter.health).toBe('function');
      });
    });

    describe('saveAll() contract', () => {
      it('should accept CachedCollections data', async () => {
        await expect(adapter.saveAll(sampleCollections)).resolves.not.toThrow();
      });

      it('should accept empty collections', async () => {
        await expect(adapter.saveAll(emptyCollections)).resolves.not.toThrow();
      });

      it('should return void/undefined', async () => {
        const result = await adapter.saveAll(sampleCollections);
        expect(result).toBeUndefined();
      });
    });

    describe('getAll() contract', () => {
      it('should return CachedCollections after save', async () => {
        await adapter.saveAll(sampleCollections);
        const result = await adapter.getAll();

        expect(result).toBeDefined();
        expect(result.posts).toBeDefined();
        expect(result.categories).toBeDefined();
        expect(result.tags).toBeDefined();
        expect(result.authors).toBeDefined();
        expect(result.pages).toBeDefined();
      });

      it('should return exact data that was saved', async () => {
        await adapter.saveAll(sampleCollections);
        const result = await adapter.getAll();

        expect(result.posts).toEqual(sampleCollections.posts);
        expect(result.categories).toEqual(sampleCollections.categories);
        expect(result.tags).toEqual(sampleCollections.tags);
        expect(result.authors).toEqual(sampleCollections.authors);
        expect(result.pages).toEqual(sampleCollections.pages);
      });

      it('should preserve optional fields (site, menu)', async () => {
        await adapter.saveAll(sampleCollections);
        const result = await adapter.getAll();

        expect(result.site).toEqual(sampleCollections.site);
        expect(result.menu).toEqual(sampleCollections.menu);
      });
    });

    describe('health() contract', () => {
      it('should return boolean', async () => {
        const health = await adapter.health();
        expect(typeof health).toBe('boolean');
      });

      it('should return true after successful save', async () => {
        await adapter.saveAll(sampleCollections);
        const health = await adapter.health();
        expect(health).toBe(true);
      });
    });

    describe('data persistence', () => {
      it('should persist data across multiple getAll calls', async () => {
        await adapter.saveAll(sampleCollections);

        const result1 = await adapter.getAll();
        const result2 = await adapter.getAll();

        expect(result1.posts).toEqual(result2.posts);
      });

      it('should overwrite previous data on saveAll', async () => {
        const firstData = { ...emptyCollections, posts: [{ id: 1, title: 'First' }] };
        const secondData = { ...emptyCollections, posts: [{ id: 2, title: 'Second' }] };

        await adapter.saveAll(firstData as any);
        await adapter.saveAll(secondData as any);

        const result = await adapter.getAll();
        expect(result.posts).toHaveLength(1);
        expect(result.posts[0].id).toBe(2);
      });
    });

    describe('immutability', () => {
      it('should not mutate input data on saveAll', async () => {
        const originalData = JSON.parse(JSON.stringify(sampleCollections));
        await adapter.saveAll(sampleCollections);

        expect(sampleCollections).toEqual(originalData);
      });

      it('should return independent copies on getAll', async () => {
        await adapter.saveAll(sampleCollections);

        const result1 = await adapter.getAll();
        const result2 = await adapter.getAll();

        // Modify result1
        result1.posts.push({ id: 999, title: 'New' } as any);

        // result2 should be unaffected
        expect(result2.posts).not.toContainEqual({ id: 999, title: 'New' });
      });
    });
  });
}

// Run contract tests for Memory adapter
runAdapterContractTests('memory');

// Run contract tests for JSON adapter
runAdapterContractTests('json');

// Additional Memory adapter specific tests
describe('MemoryAdapter specific', () => {
  let adapter: MemoryAdapter<CachedCollections>;

  beforeEach(() => {
    adapter = new MemoryAdapter<CachedCollections>();
  });

  afterEach(async () => {
    await adapter.dispose();
  });

  it('should be empty initially', () => {
    expect(adapter.isEmpty()).toBe(true);
  });

  it('should not be empty after save', async () => {
    await adapter.saveAll(sampleCollections);
    expect(adapter.isEmpty()).toBe(false);
  });

  it('should throw when getting from empty store', async () => {
    await expect(adapter.getAll()).rejects.toThrow('Memory store is empty');
  });

  it('should return false health when empty', async () => {
    const health = await adapter.health();
    expect(health).toBe(false);
  });

  it('should clear data on dispose', async () => {
    await adapter.saveAll(sampleCollections);
    await adapter.dispose();
    expect(adapter.isEmpty()).toBe(true);
  });
});

