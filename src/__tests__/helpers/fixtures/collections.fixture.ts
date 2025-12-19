/**
 * Test fixtures for CachedCollections data.
 * Provides reusable test data for adapter tests.
 * @module __tests__/helpers/fixtures/collections.fixture
 */
import type { CachedCollections } from '../../../adapters/core';

/**
 * Empty collections fixture.
 * Use for testing initial/empty state.
 */
export const emptyCollections: CachedCollections = {
  posts: [],
  categories: [],
  tags: [],
  authors: [],
  pages: [],
};

/**
 * Sample collections with minimal test data.
 * Use for basic CRUD operation tests.
 */
export const sampleCollections: CachedCollections = {
  posts: [
    { id: 1, title: 'First Post', slug: 'first-post', content: 'Content 1', status: 'publish' },
    { id: 2, title: 'Second Post', slug: 'second-post', content: 'Content 2', status: 'draft' },
  ],
  categories: [
    { id: 1, name: 'Technology', slug: 'technology', description: 'Tech articles' },
    { id: 2, name: 'News', slug: 'news', description: 'Latest news' },
  ],
  tags: [
    { id: 1, name: 'JavaScript', slug: 'javascript' },
    { id: 2, name: 'TypeScript', slug: 'typescript' },
  ],
  authors: [
    { id: 1, name: 'John Doe', slug: 'john-doe' },
  ],
  pages: [
    { id: 1, title: 'About', slug: 'about', content: 'About page content', status: 'publish' },
  ],
  site: {
    title: 'Test Site',
    description: 'A test site for unit tests',
    url: 'https://test.local',
  },
  menu: [
    { id: 1, label: 'Home', url: '/' },
    { id: 2, label: 'About', url: '/about' },
  ],
};

/**
 * Large collections for performance tests.
 * Contains 100 items per collection.
 */
export const largeCollections: CachedCollections = {
  posts: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `Post ${i + 1}`,
    slug: `post-${i + 1}`,
    content: `Content for post ${i + 1}`,
    status: i % 2 === 0 ? 'publish' : 'draft',
  })),
  categories: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Category ${i + 1}`,
    slug: `category-${i + 1}`,
  })),
  tags: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Tag ${i + 1}`,
    slug: `tag-${i + 1}`,
  })),
  authors: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Author ${i + 1}`,
    slug: `author-${i + 1}`,
  })),
  pages: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Page ${i + 1}`,
    slug: `page-${i + 1}`,
    content: `Page content ${i + 1}`,
  })),
};

/**
 * Creates a single test post with optional overrides.
 * @param overrides - Partial post properties to override
 * @returns Test post object
 */
export function createTestPost(overrides: Record<string, unknown> = {}) {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    title: 'Test Post',
    slug: 'test-post',
    content: 'Test post content',
    status: 'draft',
    ...overrides,
  };
}

/**
 * Creates a single test category with optional overrides.
 * @param overrides - Partial category properties to override
 * @returns Test category object
 */
export function createTestCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test category description',
    ...overrides,
  };
}

/**
 * Creates a single test tag with optional overrides.
 * @param overrides - Partial tag properties to override
 * @returns Test tag object
 */
export function createTestTag(overrides: Record<string, unknown> = {}) {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    name: 'Test Tag',
    slug: 'test-tag',
    ...overrides,
  };
}

/**
 * Creates a single test page with optional overrides.
 * @param overrides - Partial page properties to override
 * @returns Test page object
 */
export function createTestPage(overrides: Record<string, unknown> = {}) {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    title: 'Test Page',
    slug: 'test-page',
    content: 'Test page content',
    status: 'draft',
    ...overrides,
  };
}

/**
 * Creates test collections with custom item counts.
 * @param counts - Object with collection sizes
 * @returns Custom-sized collections
 */
export function createTestCollections(counts: {
  posts?: number;
  categories?: number;
  tags?: number;
  authors?: number;
  pages?: number;
} = {}): CachedCollections {
  return {
    posts: Array.from({ length: counts.posts ?? 0 }, (_, i) => createTestPost({ id: i + 1 })),
    categories: Array.from({ length: counts.categories ?? 0 }, (_, i) => createTestCategory({ id: i + 1 })),
    tags: Array.from({ length: counts.tags ?? 0 }, (_, i) => createTestTag({ id: i + 1 })),
    authors: Array.from({ length: counts.authors ?? 0 }, (_, i) => ({
      id: i + 1,
      name: `Author ${i + 1}`,
      slug: `author-${i + 1}`,
    })),
    pages: Array.from({ length: counts.pages ?? 0 }, (_, i) => createTestPage({ id: i + 1 })),
  };
}

