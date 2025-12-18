import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import type { StorageAdapter } from '../core';
import { DEFAULT_JSON_PATH } from './paths';

/**
 * JSON file storage adapter for caching site data.
 * Used as MAINDB or BACKUPDB for offline access.
 */
export class JsonAdapter<TCollections = unknown> implements StorageAdapter<TCollections> {
  public name = 'json';
  private filePath: string;

  constructor(path = process.env.JSON_DATA_PATH || DEFAULT_JSON_PATH) {
    this.filePath = path;
  }

  async getAll(): Promise<TCollections> {
    if (!existsSync(this.filePath)) {
      throw new Error(`JSON store missing: ${this.filePath}`);
    }
    const raw = readFileSync(this.filePath, 'utf8');
    return JSON.parse(raw) as TCollections;
  }

  async saveAll(data: TCollections): Promise<void> {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async health(): Promise<boolean> {
    return existsSync(this.filePath);
  }
}

