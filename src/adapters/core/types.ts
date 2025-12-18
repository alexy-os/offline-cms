// Core adapter interfaces and shared types.
// No runtime-specific dependencies (no fs, no lmdb).

export type AdapterName = 'LMDB' | 'IndexedDB' | 'ContextDB' | 'JsonDB' | 'FALSE';
export type GraphQLMode = 'GETMODE' | 'SETMODE' | 'CRUDMODE';

/**
 * Simple storage adapter for caching site data.
 * Used by SSR to persist GraphQL data locally for offline access.
 */
export interface StorageAdapter<TCollections = unknown> {
  name: string;
  getAll(): Promise<TCollections>;
  saveAll(data: TCollections): Promise<void>;
  health(): Promise<boolean>;
}

/**
 * Data collections structure cached from WordPress GraphQL.
 * This is the single source of truth schema from upstream.
 */
export interface CachedCollections {
  posts: any[];
  categories: any[];
  tags: any[];
  authors: any[];
  pages: any[];
  site?: {
    title: string;
    description: string;
    url: string;
  };
  menu?: any[];
}
