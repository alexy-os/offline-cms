/**
 * Test environment configuration.
 * Shared constants and env variables for tests.
 * @module __tests__/config/test-env
 */

/** Default GraphQL endpoint for tests */
export const TEST_GRAPHQL_ENDPOINT = 'http://localhost:5001/graphql';

/** Default API base URL for tests */
export const TEST_API_BASE_URL = 'http://localhost:5001';

/** Temp directory for test artifacts */
export const TEST_TMP_DIR = './tmp';

/** Test database paths */
export const TEST_PATHS = {
  json: `${TEST_TMP_DIR}/test-data.json`,
  lmdb: `${TEST_TMP_DIR}/test-lmdb`,
  sqlite: `${TEST_TMP_DIR}/test.sqlite`,
} as const;

