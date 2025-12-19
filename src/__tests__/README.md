# Offline CMS TDD Guide (Level 101)

This guide teaches you how to set up and run tests for the Offline CMS project. Tests help ensure code works correctly and prevent bugs.

## What is TDD?

**TDD** = **Test-Driven Development**. This means:
- Write tests **first**
- Then write code to make tests pass
- Tests become your safety net

## Quick Start

### 1. Install Dependencies

```bash
# Install testing libraries
bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-v8
```

This installs:
- **vitest** - Test runner (like Jest but faster)
- **@testing-library/react** - Test React components
- **jsdom** - Simulate browser environment
- **@vitest/coverage-v8** - Show test coverage

### 2. Run All Tests

```bash
# Run tests once
bun run test:run

# Or run in watch mode (auto-restart when files change)
bun run test
```

**Expected output:**
```
✓ src/__tests__/unit/adapters/core/adapter-name.test.ts (20 tests) 16ms
✓ src/__tests__/unit/adapters/json-adapter.test.ts (16 tests) 55ms
✓ src/__tests__/unit/adapters/storage-adapter.contract.test.ts (37 tests) 121ms
✓ src/__tests__/unit/lib/graphql.test.ts (22 tests) 25ms
✓ src/__tests__/integration/offline-mode.test.ts (15 tests) 138ms

Test Files  5 passed (5)
Tests  110 passed (110)
```

**What this means:**
- ✅ = Test passed
- ❌ = Test failed
- `110 passed (110)` = All 110 tests work
- `5 passed (5)` = All 5 test files work

### 3. Check Test Coverage

```bash
bun run test:coverage
```

Shows which code is tested:
```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
src/adapters/core  |   77.77 |      100 |     100 |   77.77 |
  adapter-name.ts  |     100 |      100 |     100 |     100 |     ✅ Perfect!
  types.ts         |       0 |        0 |       0 |       0 |     ⚠️  Not tested yet
```

**Coverage meanings:**
- **Statements** - Lines of code executed
- **Branches** - If/else paths tested
- **Functions** - Functions called
- **Lines** - Lines executed

## Test Structure Explained

```
src/__tests__/
├── config/           # Test setup (don't touch)
├── helpers/          # Reusable test tools
├── unit/             # Test one function/class
└── integration/      # Test how parts work together
```

### Unit Tests

Test **one thing** in isolation. Example:

```typescript
// src/__tests__/unit/adapters/core/adapter-name.test.ts
describe('normalizeAdapterName', () => {
  it('should return "LMDB" for "lmdb" input', () => {
    expect(normalizeAdapterName('lmdb')).toBe('LMDB');
  });
});
```

### Integration Tests

Test how **multiple parts** work together:

```typescript
// src/__tests__/integration/offline-mode.test.ts
describe('Offline mode integration', () => {
  it('should serve cached data when offline', async () => {
    // Setup offline mode
    offlineCtx.goOffline();

    // Save data while online
    await adapter.saveAll(sampleCollections);

    // Should still work offline
    const data = await adapter.getAll();
    expect(data.posts).toEqual(sampleCollections.posts);
  });
});
```

## Writing Your First Test

### 1. Create Test File

```bash
# Create test file for a new function
touch src/__tests__/unit/lib/new-function.test.ts
```

### 2. Write Basic Test

```typescript
// src/__tests__/unit/lib/new-function.test.ts
import { describe, it, expect } from 'vitest';
import { myNewFunction } from '../../../lib/my-new-function';

describe('myNewFunction', () => {
  it('should return true for valid input', () => {
    const result = myNewFunction('valid');
    expect(result).toBe(true);
  });

  it('should return false for invalid input', () => {
    const result = myNewFunction('invalid');
    expect(result).toBe(false);
  });
});
```

### 3. Run Test

```bash
bun run test:run
```

If test fails, fix your code. If test passes, add more test cases!

## Common Test Patterns

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await myAsyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it('should throw error for invalid input', () => {
  expect(() => myFunction(null)).toThrow('Invalid input');
});
```

### Testing with Mocks

```typescript
import { vi } from 'vitest';

it('should call external API', async () => {
  // Mock the fetch function
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: 'mocked' })
  });

  await myApiFunction();

  // Check that fetch was called
  expect(global.fetch).toHaveBeenCalledWith('/api/data');
});
```

## Using Test Helpers

The project includes helpers for common tasks:

### Testing Adapters

```typescript
import { createTestAdapter } from '../../helpers';

it('should save and load data', async () => {
  const adapter = createTestAdapter({ type: 'memory' });

  await adapter.saveAll({ posts: [{ id: 1, title: 'Test' }] });
  const data = await adapter.getAll();

  expect(data.posts[0].title).toBe('Test');

  await adapter.dispose(); // Cleanup
});
```

### Testing Offline Mode

```typescript
import { createOfflineContext } from '../../helpers';

it('should work offline', async () => {
  const offline = createOfflineContext();

  // Simulate going offline
  offline.goOffline();

  // Your offline test logic here
  // ...

  // Restore network
  offline.goOnline();
});
```

### Using Test Data

```typescript
import { sampleCollections, createTestPost } from '../../helpers';

it('should handle sample data', async () => {
  const adapter = createTestAdapter({ type: 'memory' });
  await adapter.saveAll(sampleCollections);

  expect(await adapter.health()).toBe(true);
});
```

## Debugging Tests

### Test Fails - What to Do

1. **Read the error message carefully**
2. **Check the stack trace** (shows where error happened)
3. **Add console.log()** to see values
4. **Run single test** to isolate issue

```bash
# Run only one test file
bun run test:run src/__tests__/unit/adapters/core/adapter-name.test.ts

# Run only one test (by name)
bun run test:run -t "should return LMDB for lmdb input"
```

### Common Issues

**Test times out:**
```typescript
// Add timeout for slow tests
it('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

**Mock not working:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Migrating to Jest (for SSR)

This TDD setup is **portable**. To use with Jest:

### 1. Install Jest

```bash
npm install --save-dev jest @types/jest ts-jest
```

### 2. Create jest.config.js

```javascript
// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node', // For SSR
  setupFilesAfterEnv: ['./src/__tests__/config/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};
```

### 3. Create jest.setup.ts

```typescript
// src/__tests__/config/jest.setup.ts
import '@testing-library/jest-dom';

// Global test setup
beforeAll(() => {
  // Jest-specific setup
});
```

### 4. Update Imports

The `test-runner.ts` helper makes migration easy:

```typescript
// Before (Vitest)
import { vi } from 'vitest';

// After (Jest) - handled automatically by test-runner.ts
import { mockFn } from '../../helpers/test-runner';
```

## Advanced Topics

### Contract Tests

Test that all adapters follow the same interface:

```typescript
// src/__tests__/unit/adapters/storage-adapter.contract.test.ts
function runAdapterContractTests(adapterType: string) {
  // Tests that work for ANY adapter implementation
}
```

### Performance Tests

```typescript
it('should handle large datasets quickly', async () => {
  const start = Date.now();

  await adapter.saveAll(largeCollections);

  const duration = Date.now() - start;
  expect(duration).toBeLessThan(100); // Less than 100ms
});
```

### Snapshot Tests

```typescript
it('should match expected GraphQL response', () => {
  const response = createGraphQLResponse(data);
  expect(response).toMatchSnapshot();
});
```

## Best Practices

### Test Organization
- **One concept per test**
- **Clear test names** (what, why, how)
- **Arrange, Act, Assert** pattern

### Test Maintenance
- **Delete obsolete tests**
- **Update tests when code changes**
- **Keep tests fast** (< 100ms each)

### Code Quality
- **DRY principle** (Don't Repeat Yourself)
- **Use helpers** for common patterns
- **Document complex tests**

## Troubleshooting

### Tests Won't Run
```bash
# Check if dependencies are installed
bun install

# Check if scripts exist in package.json
cat package.json | grep test
```

### Import Errors
```bash
# Check TypeScript compilation
bun run build

# Check file paths
ls src/__tests__/helpers/
```

### Coverage Not Working
```bash
# Clear coverage cache
rm -rf coverage/

# Run with verbose output
bun run test:coverage --reporter=verbose
```

## Next Steps

1. **Read existing tests** to understand patterns
2. **Add tests for new features** before writing code
3. **Run tests frequently** during development
4. **Check coverage regularly** to find untested code

## Need Help?

- **Read test error messages** carefully
- **Check existing tests** for examples
- **Use helpers** from `src/__tests__/helpers/`
- **Ask questions** about specific failures

Remember: Tests are your safety net. More tests = fewer bugs!
