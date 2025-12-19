/**
 * Abstract test runner utilities.
 * Provides portable helpers that work with both Vitest and Jest.
 * @module __tests__/helpers/test-runner
 */
import { vi } from 'vitest';

/**
 * Detects if running in Vitest environment.
 */
export const isVitest = typeof vi !== 'undefined';

/**
 * Detects if running in Jest environment.
 */
export const isJest = typeof jest !== 'undefined';

/**
 * Creates a mock function (works with both Vitest and Jest).
 * @returns Mock function instance
 */
export function mockFn<T extends (...args: any[]) => any>(): T {
  if (isVitest) {
    return vi.fn() as unknown as T;
  }
  // Jest fallback
  return jest.fn() as unknown as T;
}

/**
 * Creates a spy on object method.
 * @param obj - Target object
 * @param method - Method name to spy on
 * @returns Spy instance
 */
export function spyOn<T extends object, K extends keyof T>(
  obj: T,
  method: K
) {
  if (isVitest) {
    return vi.spyOn(obj, method as any);
  }
  return jest.spyOn(obj, method as any);
}

/**
 * Mocks a module.
 * @param modulePath - Path to module
 * @param factory - Mock factory function
 */
export function mockModule(modulePath: string, factory: () => unknown) {
  if (isVitest) {
    vi.mock(modulePath, factory);
  } else {
    jest.mock(modulePath, factory);
  }
}

/**
 * Clears all mocks.
 */
export function clearAllMocks() {
  if (isVitest) {
    vi.clearAllMocks();
  } else {
    jest.clearAllMocks();
  }
}

/**
 * Resets all mocks to initial state.
 */
export function resetAllMocks() {
  if (isVitest) {
    vi.resetAllMocks();
  } else {
    jest.resetAllMocks();
  }
}

/**
 * Waits for specified milliseconds.
 * @param ms - Milliseconds to wait
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

