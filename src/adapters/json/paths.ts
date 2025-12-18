import { resolve } from 'path';

// Default path for JSON data storage
export const DEFAULT_JSON_PATH = resolve(process.cwd(), 'src/data/json/full.json');

// Legacy alias for backwards compatibility
export const DEFAULT_LEGACY_JSON_PATH = DEFAULT_JSON_PATH;
