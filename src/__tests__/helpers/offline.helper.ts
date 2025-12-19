/**
 * Offline mode testing utilities.
 * Simulates network conditions for testing offline-first behavior.
 * @module __tests__/helpers/offline.helper
 */

/** Network state for offline testing */
export interface NetworkState {
  /** Is network offline */
  offline: boolean;
  /** Simulated network delay in ms */
  delay: number;
  /** Simulated error rate (0-1) */
  errorRate: number;
}

/** Offline test context with control methods */
export interface OfflineTestContext {
  /** Simulate going offline */
  goOffline(): void;
  /** Simulate going online */
  goOnline(): void;
  /** Check current offline state */
  isOffline(): boolean;
  /** Simulate network error */
  mockNetworkError(): void;
  /** Simulate slow network with delay */
  mockSlowNetwork(delayMs: number): void;
  /** Set random error rate */
  setErrorRate(rate: number): void;
  /** Restore original fetch */
  restore(): void;
  /** Get current network state */
  getState(): NetworkState;
}

/**
 * Creates offline test context for simulating network conditions.
 * Intercepts global fetch to simulate offline mode.
 * @returns Offline test context
 * @example
 * ```ts
 * const offline = createOfflineContext();
 * offline.goOffline();
 * await expect(fetchData()).rejects.toThrow();
 * offline.goOnline();
 * ```
 */
export function createOfflineContext(): OfflineTestContext {
  const state: NetworkState = {
    offline: false,
    delay: 0,
    errorRate: 0,
  };

  const originalFetch = globalThis.fetch;

  const interceptedFetch: typeof fetch = async (...args) => {
    // Simulate offline
    if (state.offline) {
      throw new TypeError('Failed to fetch');
    }

    // Simulate random errors
    if (state.errorRate > 0 && Math.random() < state.errorRate) {
      throw new TypeError('Network request failed');
    }

    // Simulate network delay
    if (state.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, state.delay));
    }

    return originalFetch(...args);
  };

  return {
    goOffline() {
      state.offline = true;
      globalThis.fetch = interceptedFetch;
    },

    goOnline() {
      state.offline = false;
      state.delay = 0;
      state.errorRate = 0;
      globalThis.fetch = originalFetch;
    },

    isOffline() {
      return state.offline;
    },

    mockNetworkError() {
      this.goOffline();
    },

    mockSlowNetwork(delayMs: number) {
      state.delay = delayMs;
      globalThis.fetch = interceptedFetch;
    },

    setErrorRate(rate: number) {
      state.errorRate = Math.max(0, Math.min(1, rate));
      globalThis.fetch = interceptedFetch;
    },

    restore() {
      state.offline = false;
      state.delay = 0;
      state.errorRate = 0;
      globalThis.fetch = originalFetch;
    },

    getState() {
      return { ...state };
    },
  };
}

/**
 * Creates mock fetch response.
 * @param data - Response data
 * @param options - Response options
 * @returns Mock Response object
 */
export function createMockResponse(
  data: unknown,
  options: { status?: number; ok?: boolean } = {}
): Response {
  const { status = 200, ok = true } = options;

  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    clone: () => createMockResponse(data, options),
  } as Response;
}

/**
 * Creates mock GraphQL response.
 * @param data - GraphQL data
 * @param errors - GraphQL errors
 * @returns Mock GraphQL response
 */
export function createMockGraphQLResponse<T>(
  data: T | null,
  errors?: Array<{ message: string }>
) {
  return {
    data,
    errors,
  };
}

