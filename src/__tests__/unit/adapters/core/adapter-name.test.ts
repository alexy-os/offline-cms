/**
 * Unit tests for adapter-name utilities.
 * Tests normalizeAdapterName function behavior.
 * @module __tests__/unit/adapters/core/adapter-name.test
 */
import { describe, it, expect } from 'vitest';
import { normalizeAdapterName } from '../../../../adapters/core/adapter-name';
import type { AdapterName } from '../../../../adapters/core/types';

describe('normalizeAdapterName', () => {
  describe('valid adapter names', () => {
    it('should return "LMDB" for "lmdb" input', () => {
      expect(normalizeAdapterName('lmdb')).toBe('LMDB');
    });

    it('should return "LMDB" for "LMDB" input', () => {
      expect(normalizeAdapterName('LMDB')).toBe('LMDB');
    });

    it('should return "IndexedDB" for "indexeddb" input', () => {
      expect(normalizeAdapterName('indexeddb')).toBe('IndexedDB');
    });

    it('should return "IndexedDB" for "INDEXEDDB" input', () => {
      expect(normalizeAdapterName('INDEXEDDB')).toBe('IndexedDB');
    });

    it('should return "ContextDB" for "contextdb" input', () => {
      expect(normalizeAdapterName('contextdb')).toBe('ContextDB');
    });

    it('should return "JsonDB" for "jsondb" input', () => {
      expect(normalizeAdapterName('jsondb')).toBe('JsonDB');
    });

    it('should return "FALSE" for "false" input', () => {
      expect(normalizeAdapterName('false')).toBe('FALSE');
    });
  });

  describe('case insensitivity', () => {
    const testCases: Array<[string, AdapterName]> = [
      ['Lmdb', 'LMDB'],
      ['LmDb', 'LMDB'],
      ['IndexedDb', 'IndexedDB'],
      ['CONTEXTDB', 'ContextDB'],
      ['Jsondb', 'JsonDB'],
      ['False', 'FALSE'],
    ];

    testCases.forEach(([input, expected]) => {
      it(`should normalize "${input}" to "${expected}"`, () => {
        expect(normalizeAdapterName(input)).toBe(expected);
      });
    });
  });

  describe('invalid/unknown values', () => {
    it('should return "FALSE" for empty string', () => {
      expect(normalizeAdapterName('')).toBe('FALSE');
    });

    it('should return "FALSE" for undefined', () => {
      expect(normalizeAdapterName(undefined)).toBe('FALSE');
    });

    it('should return "FALSE" for null', () => {
      expect(normalizeAdapterName(null)).toBe('FALSE');
    });

    it('should return "FALSE" for unknown adapter name', () => {
      expect(normalizeAdapterName('mysql')).toBe('FALSE');
    });

    it('should return "FALSE" for random string', () => {
      expect(normalizeAdapterName('random-value')).toBe('FALSE');
    });

    it('should return "FALSE" for whitespace', () => {
      expect(normalizeAdapterName('  ')).toBe('FALSE');
    });
  });

  describe('type safety', () => {
    it('should return valid AdapterName type', () => {
      const result = normalizeAdapterName('lmdb');
      const validNames: AdapterName[] = ['LMDB', 'IndexedDB', 'ContextDB', 'JsonDB', 'FALSE'];
      expect(validNames).toContain(result);
    });
  });
});

