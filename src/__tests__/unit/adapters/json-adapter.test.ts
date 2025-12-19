/**
 * Unit tests for JsonAdapter.
 * Tests JSON file storage operations.
 * @module __tests__/unit/adapters/json-adapter.test
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { JsonAdapter } from '../../../adapters/json';
import { sampleCollections, emptyCollections } from '../../helpers/fixtures';
import { TEST_TMP_DIR } from '../../config/test-env';

describe('JsonAdapter', () => {
  let adapter: JsonAdapter;
  let testPath: string;

  beforeEach(() => {
    // Create unique test path
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    testPath = join(TEST_TMP_DIR, `json-test-${timestamp}-${random}.json`);
    
    // Ensure temp directory exists
    if (!existsSync(TEST_TMP_DIR)) {
      mkdirSync(TEST_TMP_DIR, { recursive: true });
    }
    
    adapter = new JsonAdapter(testPath);
  });

  afterEach(() => {
    // Cleanup test file
    if (existsSync(testPath)) {
      rmSync(testPath, { force: true });
    }
  });

  describe('constructor', () => {
    it('should create adapter with custom path', () => {
      const customPath = join(TEST_TMP_DIR, 'custom.json');
      const customAdapter = new JsonAdapter(customPath);
      expect(customAdapter.name).toBe('json');
    });

    it('should have name property set to "json"', () => {
      expect(adapter.name).toBe('json');
    });
  });

  describe('saveAll()', () => {
    it('should save data to JSON file', async () => {
      await adapter.saveAll(sampleCollections);
      expect(existsSync(testPath)).toBe(true);
    });

    it('should create parent directories if not exist', async () => {
      const nestedPath = join(TEST_TMP_DIR, 'nested', 'deep', 'data.json');
      const nestedAdapter = new JsonAdapter(nestedPath);
      
      await nestedAdapter.saveAll(sampleCollections);
      
      expect(existsSync(nestedPath)).toBe(true);
      
      // Cleanup
      rmSync(join(TEST_TMP_DIR, 'nested'), { recursive: true, force: true });
    });

    it('should save empty collections', async () => {
      await adapter.saveAll(emptyCollections);
      expect(existsSync(testPath)).toBe(true);
    });

    it('should overwrite existing data', async () => {
      await adapter.saveAll({ posts: [{ id: 1 }] } as any);
      await adapter.saveAll({ posts: [{ id: 2 }] } as any);
      
      const result = await adapter.getAll();
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe(2);
    });
  });

  describe('getAll()', () => {
    it('should retrieve saved data correctly', async () => {
      await adapter.saveAll(sampleCollections);
      const result = await adapter.getAll();
      
      expect(result).toEqual(sampleCollections);
    });

    it('should throw error when file does not exist', async () => {
      await expect(adapter.getAll()).rejects.toThrow('JSON store missing');
    });

    it('should preserve all collection properties', async () => {
      await adapter.saveAll(sampleCollections);
      const result = await adapter.getAll();
      
      expect(result.posts).toBeDefined();
      expect(result.categories).toBeDefined();
      expect(result.tags).toBeDefined();
      expect(result.authors).toBeDefined();
      expect(result.pages).toBeDefined();
      expect(result.site).toBeDefined();
      expect(result.menu).toBeDefined();
    });

    it('should return deep copy of data', async () => {
      await adapter.saveAll(sampleCollections);
      const result1 = await adapter.getAll();
      const result2 = await adapter.getAll();
      
      // Different references
      expect(result1).not.toBe(result2);
      expect(result1.posts).not.toBe(result2.posts);
    });
  });

  describe('health()', () => {
    it('should return false when file does not exist', async () => {
      const health = await adapter.health();
      expect(health).toBe(false);
    });

    it('should return true when file exists', async () => {
      await adapter.saveAll(emptyCollections);
      const health = await adapter.health();
      expect(health).toBe(true);
    });

    it('should return true after saveAll', async () => {
      expect(await adapter.health()).toBe(false);
      await adapter.saveAll(sampleCollections);
      expect(await adapter.health()).toBe(true);
    });
  });

  describe('data integrity', () => {
    it('should handle special characters in content', async () => {
      const dataWithSpecialChars = {
        ...emptyCollections,
        posts: [{ id: 1, content: 'Hello "world" & <test> 🎉' }],
      };
      
      await adapter.saveAll(dataWithSpecialChars as any);
      const result = await adapter.getAll();
      
      expect(result.posts[0].content).toBe('Hello "world" & <test> 🎉');
    });

    it('should handle unicode content', async () => {
      const unicodeData = {
        ...emptyCollections,
        posts: [{ id: 1, title: '日本語タイトル', content: 'Контент на русском' }],
      };
      
      await adapter.saveAll(unicodeData as any);
      const result = await adapter.getAll();
      
      expect(result.posts[0].title).toBe('日本語タイトル');
      expect(result.posts[0].content).toBe('Контент на русском');
    });

    it('should handle large collections', async () => {
      const largeData = {
        ...emptyCollections,
        posts: Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          title: `Post ${i + 1}`,
          content: 'x'.repeat(1000),
        })),
      };
      
      await adapter.saveAll(largeData as any);
      const result = await adapter.getAll();
      
      expect(result.posts).toHaveLength(1000);
    });
  });
});

