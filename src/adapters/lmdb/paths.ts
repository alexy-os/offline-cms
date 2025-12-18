import { resolve } from 'path';

// Default path for LMDB data storage
export const DEFAULT_LMDB_PATH = resolve(process.cwd(), 'data/db');

// Legacy alias for backwards compatibility
export const DEFAULT_LEGACY_LMDB_PATH = DEFAULT_LMDB_PATH;
