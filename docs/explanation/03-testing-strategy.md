# Testing Strategy

Design decisions behind the VAIT Discord Bot's testing approach.

## Why Testcontainers Over Mocked Databases

The project previously used mocked database calls, but this approach had a critical flaw: mocked tests could pass while the actual database queries failed in production. Mocks cannot catch query errors, constraint violations, or migration issues.

By using [testcontainers](https://node.testcontainers.org/), every database test runs against a real [PostgreSQL](https://www.postgresql.org/) instance with the actual [Prisma](https://www.prisma.io/) schema applied. The trade-off is speed — container startup adds ~5-10 seconds to the first test run and requires [Docker](https://www.docker.com/) to be running locally. The reliability gain is worth it.

## Why Template Database Isolation

Running all tests against a single shared database would cause test interference. Running full schema migrations per test file would be slow.

The template database pattern solves both problems: the schema is applied once to a template database during global setup, then each test file gets its own database cloned from the template via `CREATE DATABASE ... TEMPLATE`. This gives full isolation without redundant migration runs.

Each test within a file starts with a clean slate because `cleanDb()` truncates all tables before each test.

See [Testing Utilities](../reference/07-testing-utilities.md) for the API reference of seed helpers and fixtures.

## Why Deep Mocks for Discord Interactions

[Discord.js](https://discord.js.org/) interaction objects are deeply nested interfaces with dozens of properties and methods. Manually stubbing each one would be fragile and verbose.

[vitest-mock-extended](https://www.npmjs.com/package/vitest-mock-extended)'s `mockDeep` creates a complete mock object where every property and method is a mock function by default. The `chatInputCommandInteractionTest` fixture wraps this in a [Vitest](https://vitest.dev/) test extension that pre-sets `guildId` and auto-resets between tests.

This approach trades some type safety (mocked properties may not match runtime behaviour) for developer ergonomics. It works well because the tests focus on verifying command logic, not Discord.js internals.

## Why MSW Over Mocking Fetch

External API calls (weather, Advent of Code) are intercepted by [MSW](https://mswjs.io/) at the network level rather than mocking `fetch` directly. MSW catches issues with URL construction, headers, and request/response serialisation that direct mocking would miss.

The trade-off is a slightly more complex setup (mock server lifecycle), but the MSW server is managed automatically by the test infrastructure.

## The Guiding Principle

Use real dependencies when possible, mock only at the boundary where the real dependency is impractical (Discord gateway) or unreliable (external APIs). This gives the highest confidence that tests reflect production behaviour.
