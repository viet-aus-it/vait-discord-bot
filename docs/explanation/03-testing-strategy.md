# Testing Strategy

Why the VAIT Discord Bot tests the way it does.

## Tooling

- **[Vitest](https://vitest.dev/)** — test runner with native TypeScript support and ESM
- **[Testcontainers](https://node.testcontainers.org/)** — spins up real PostgreSQL containers for database tests
- **[MSW](https://mswjs.io/)** (Mock Service Worker) — intercepts HTTP requests for external API mocking
- **[vitest-mock-extended](https://www.npmjs.com/package/vitest-mock-extended)** — deep mocking for complex TypeScript interfaces (Discord interactions)

## Why Testcontainers Over Mocked Databases

The project previously used mocked database calls, but this approach had a critical flaw: mocked tests could pass while the actual database queries failed in production. By using testcontainers, every database test runs against a real PostgreSQL instance with the actual Prisma schema applied.

**Trade-offs:**
- Slower than mocks (container startup adds ~5-10 seconds to the first test run)
- Requires Docker to be running locally
- More realistic: catches query errors, constraint violations, and migration issues that mocks would miss

## Database Test Isolation

The testing infrastructure uses a template database pattern for isolation without redundant schema setup:

### Global Setup (`test/mocks/database/globalSetup.ts`)

Runs once before all tests:
1. Starts a PostgreSQL container via testcontainers (or uses a GitHub Actions service container in CI)
2. Runs `pnpm run prisma:push` to apply the schema, creating a **template database**
3. Returns a teardown function that stops the container

### Per-File Setup (`test/mocks/database/per-file-db.ts`)

Runs for each test file:
1. Creates a unique database for the test worker by cloning the template: `CREATE DATABASE "test_<worker_id>" TEMPLATE "test"`
2. Registers a `beforeEach` hook that calls `cleanDb()` to truncate all tables
3. Registers an `afterAll` hook that disconnects Prisma and drops the worker database

This means each test file gets its own isolated database, and each test within a file starts with a clean slate. Tests can run in parallel without interfering with each other.

## Mocking Discord Interactions

Discord.js interaction objects are complex, deeply nested interfaces. The project uses `vitest-mock-extended`'s `mockDeep` to create full mock objects without manually stubbing every property.

The `chatInputCommandInteractionTest` fixture (`test/fixtures/chat-input-command-interaction.ts`) is a Vitest test extension that provides:
- A pre-configured `interaction` mock with `guildId` set
- A `message` mock
- A `thread` mock
- Automatic mock reset between tests

Usage:

```typescript
chatInputCommandInteractionTest('should reply with result', async ({ interaction }) => {
  await myCommand(interaction);
  expect(interaction.reply).toHaveBeenCalledWith('expected response');
});
```

## MSW for HTTP Mocking

External API calls (weather, Advent of Code) are intercepted by MSW at the network level. The setup (`test/mocks/msw/setup.ts`) starts a mock server before all tests, resets handlers after each test, and shuts down after all tests.

This approach is preferable to mocking `fetch` directly because it catches issues with URL construction, headers, and request/response serialisation.

## Test Data Seeding

The `test/fixtures/db-seed.ts` module provides helper functions for creating test data:

- `seedUser(id, reputation?)` — create a user with optional reputation
- `seedServerSettings(guildId, overrides?)` — create server configuration
- `seedReferralCode(data)` — create a referral code
- `seedReminder(data)` — create a reminder
- `cleanDb()` — delete all records from all tables (called before each test)

## When to Mock vs When to Use Real Dependencies

| Scenario | Approach |
|----------|----------|
| Database queries | Real database via testcontainers |
| Discord interactions | `mockDeep` via vitest-mock-extended |
| External HTTP APIs | MSW request interception |
| Error paths that cannot be triggered naturally | `vi.spyOn` on the specific function |

The guiding principle: use real dependencies when possible, mock only at the boundary where the real dependency is impractical (Discord gateway) or unreliable (external APIs).
