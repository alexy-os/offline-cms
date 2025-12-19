/**
 * Unit tests for GraphQL utilities.
 * Tests API communication and offline handling.
 * @module __tests__/unit/lib/graphql.test
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getGraphQLEndpoint,
  getApiBaseUrl,
  fetchGraphQL,
  fetchApiHealth,
  syncLocalDatabase,
  getLocalData,
  flushMutationQueue,
  getQueuedMutations,
} from '../../../lib/graphql';
import {
  createOfflineContext,
  createMockResponse,
  createMockGraphQLResponse,
} from '../../helpers/offline.helper';

describe('GraphQL utilities', () => {
  describe('getGraphQLEndpoint()', () => {
    it('should return endpoint from env if set', () => {
      const endpoint = getGraphQLEndpoint();
      // Will use VITE_GRAPHQL_ENDPOINT if set, otherwise proxy path
      expect(typeof endpoint).toBe('string');
      expect(endpoint.length).toBeGreaterThan(0);
    });

    it('should return valid URL format', () => {
      const endpoint = getGraphQLEndpoint();
      // Either full URL or relative path
      expect(endpoint).toMatch(/^(https?:\/\/|\/)/);
    });
  });

  describe('getApiBaseUrl()', () => {
    it('should return base URL without /graphql', () => {
      const baseUrl = getApiBaseUrl();
      expect(baseUrl).not.toContain('/graphql');
    });
  });
});

describe('fetchGraphQL()', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should make POST request to GraphQL endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse({ data: { posts: [] } })
    );
    globalThis.fetch = mockFetch;

    await fetchGraphQL({ query: 'query { posts { id } }' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      })
    );
  });

  it('should send query in request body', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse({ data: {} })
    );
    globalThis.fetch = mockFetch;

    const query = 'query GetPosts { posts { id title } }';
    await fetchGraphQL({ query });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.query).toBe(query);
  });

  it('should send variables in request body', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse({ data: {} })
    );
    globalThis.fetch = mockFetch;

    const variables = { first: 10 };
    await fetchGraphQL({ query: 'query { posts }', variables });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.variables).toEqual(variables);
  });

  it('should return GraphQL response with data', async () => {
    const mockData = { posts: [{ id: 1, title: 'Test' }] };
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({ data: mockData })
    );

    const result = await fetchGraphQL({ query: 'query { posts { id title } }' });

    expect(result.data).toEqual(mockData);
  });

  it('should return GraphQL response with errors', async () => {
    const mockErrors = [{ message: 'Field not found' }];
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({ errors: mockErrors })
    );

    const result = await fetchGraphQL({ query: 'invalid' });

    expect(result.errors).toEqual(mockErrors);
  });

  it('should pass AbortSignal to fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse({ data: {} })
    );
    globalThis.fetch = mockFetch;

    const controller = new AbortController();
    await fetchGraphQL({ query: 'query {}', signal: controller.signal });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal })
    );
  });
});

describe('fetchApiHealth()', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return health status when API is available', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({ status: 'ok', uptime: 1000 })
    );

    const result = await fetchApiHealth();

    expect(result.status).toBe('ok');
  });

  it('should return offline status when API is unavailable', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await fetchApiHealth();

    expect(result.status).toBe('offline');
    expect(result.message).toBeDefined();
  });

  it('should return offline status on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({}, { status: 500, ok: false })
    );

    const result = await fetchApiHealth();

    expect(result.status).toBe('offline');
  });
});

describe('syncLocalDatabase()', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return success on successful sync', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({ success: true, count: 10 })
    );

    const result = await syncLocalDatabase();

    expect(result.success).toBe(true);
  });

  it('should return error when API unavailable', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await syncLocalDatabase();

    expect(result.success).toBe(false);
    expect(result.error).toContain('offline');
  });
});

describe('getLocalData()', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return data when available', async () => {
    const mockData = { posts: [], categories: [] };
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse(mockData)
    );

    const result = await getLocalData();

    expect(result).toEqual(mockData);
  });

  it('should return offline status when unavailable', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await getLocalData();

    expect(result.offline).toBe(true);
    expect(result.data).toBeNull();
  });
});

describe('flushMutationQueue()', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return success on flush', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({ success: true, flushed: 5 })
    );

    const result = await flushMutationQueue();

    expect(result.success).toBe(true);
  });

  it('should return error when offline', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await flushMutationQueue();

    expect(result.success).toBe(false);
  });
});

describe('getQueuedMutations()', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return queue when available', async () => {
    const mockQueue = [{ id: 1, mutation: 'createPost' }];
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({ queue: mockQueue })
    );

    const result = await getQueuedMutations();

    expect(result.queue).toEqual(mockQueue);
  });

  it('should return empty queue when offline', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await getQueuedMutations();

    expect(result.queue).toEqual([]);
    expect(result.offline).toBe(true);
  });
});

describe('Offline mode integration', () => {
  const offlineCtx = createOfflineContext();

  afterEach(() => {
    offlineCtx.restore();
  });

  it('should handle offline mode gracefully', async () => {
    offlineCtx.goOffline();

    const health = await fetchApiHealth();
    expect(health.status).toBe('offline');

    const sync = await syncLocalDatabase();
    expect(sync.success).toBe(false);

    const data = await getLocalData();
    expect(data.offline).toBe(true);
  });

  it('should recover when going back online', async () => {
    // Start offline
    offlineCtx.goOffline();
    const offlineHealth = await fetchApiHealth();
    expect(offlineHealth.status).toBe('offline');

    // Go back online with mock
    offlineCtx.goOnline();
    globalThis.fetch = vi.fn().mockResolvedValue(
      createMockResponse({ status: 'ok' })
    );

    const onlineHealth = await fetchApiHealth();
    expect(onlineHealth.status).toBe('ok');
  });
});

