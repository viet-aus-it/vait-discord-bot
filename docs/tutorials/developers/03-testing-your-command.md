# Test Your Command

In this tutorial, you will learn the full testing toolkit used in the VAIT Discord Bot: mocking Discord interactions, testing database queries against real PostgreSQL, and intercepting HTTP requests.

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- Docker running (for testcontainers)
- Familiarity with [Vitest](https://vitest.dev/) basics

## The Testing Stack

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev/) | Test runner |
| [Testcontainers](https://node.testcontainers.org/) | Real PostgreSQL for database tests |
| [vitest-mock-extended](https://www.npmjs.com/package/vitest-mock-extended) | Deep mocking for Discord interactions |
| [MSW](https://mswjs.io/) | HTTP request interception |

## Part 1: Testing a Simple Command

For stateless commands (no database, no HTTP), you only need the interaction mock.

Create a test file next to your command (e.g. `src/slash-commands/ping/index.test.ts`):

```typescript
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

describe('ping', () => {
  chatInputCommandInteractionTest('should reply with Pong!', async ({ interaction }) => {
    // Import and call your command's execute function
    const { execute } = await import('./index');
    await execute(interaction);

    // Assert the bot replied correctly
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Pong!');
  });
});
```

**What `chatInputCommandInteractionTest` provides:**
- A deeply mocked `ChatInputCommandInteraction` with `guildId` pre-set
- A mocked `Message` and `PublicThreadChannel`
- Automatic mock reset between tests (no state leaks)

**Mocking option values:**

```typescript
// String option
interaction.options.getString.mockReturnValueOnce('hello');

// User option
interaction.options.getUser.mockReturnValueOnce({ id: '123', displayName: 'Sam' } as any);

// Number option
interaction.options.getNumber.mockReturnValueOnce(42);
```

## Part 2: Testing Database Interactions

Database tests run against a real PostgreSQL container. The test infrastructure handles this automatically.

### How It Works

1. **Global setup** starts a PostgreSQL container and applies the Prisma schema (once)
2. **Per-file setup** creates an isolated database for each test file (from a template)
3. **`beforeEach`** calls `cleanDb()` to truncate all tables before each test
4. **`afterAll`** disconnects Prisma and drops the worker database

You don't need to configure any of this, it happens automatically via `vitest.config.mts`.

### Writing a Database Test

```typescript
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedUser } from '../../../test/fixtures/db-seed';

describe('my-db-command', () => {
  chatInputCommandInteractionTest('should read from the database', async ({ interaction }) => {
    // Arrange: seed test data
    await seedUser('user-1', 10);

    // Act: run the command
    await myCommand(interaction);

    // Assert: check the reply
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('10'));
  });
});
```

### Available Seed Helpers

From `test/fixtures/db-seed.ts`:

```typescript
seedUser(id: string, reputation?: number)
seedServerSettings(guildId: string, overrides?: Record<string, unknown>)
seedReferralCode({ userId, guildId, service, code, expiry_date })
seedReminder({ userId, guildId, onTimestamp, message })
cleanDb()  // called automatically before each test
```

### Important Rules

- **Do NOT mock database calls.** Tests hit the real database. This catches query errors and constraint violations that mocks would miss.
- **Use `vi.spyOn` only for error paths** that cannot be triggered naturally (e.g. forcing a database connection failure).
- **Each test file gets its own database.** Tests in different files never conflict, even when running in parallel.

## Part 3: Testing HTTP Requests with MSW

For commands that call external APIs (weather, Advent of Code), use [MSW](https://mswjs.io/) to intercept requests.

The MSW server is started automatically via `test/mocks/msw/setup.ts`. Add handlers for your specific API:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/msw/setup';

describe('weather command', () => {
  chatInputCommandInteractionTest('should display weather', async ({ interaction }) => {
    // Set up the mock API response
    server.use(
      http.get('https://api.weather.example/current', () => {
        return HttpResponse.json({ temp: 25, condition: 'Sunny' });
      })
    );

    await weatherCommand(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('25'));
  });
});
```

MSW handlers are reset after each test, so you can define different responses per test case.

## Part 4: Mocking Complex Discord Objects

Sometimes you need to mock more complex Discord.js structures:

```typescript
import { Collection, type GuildMember } from 'discord.js';

chatInputCommandInteractionTest('should handle guild members', async ({ interaction }) => {
  // Create a mock member collection
  const mockMembers = new Collection<string, GuildMember>();
  mockMembers.set('user-1', { nickname: 'Sam', displayName: 'Sammy' } as GuildMember);

  // Mock the guild members fetch
  interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

  await myCommand(interaction);

  expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('Sam'));
});
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run a specific test file
pnpm test src/slash-commands/ping/index.test.ts

# Run tests in a directory
pnpm test src/slash-commands/reputation/

# Run without console output
pnpm test:silent
```

## Test Structure Recap

```
src/slash-commands/your-command/
├── index.ts          # Command implementation
├── index.test.ts     # Co-located tests
└── utils.ts          # Helpers (if needed)
```

Follow the **Arrange-Act-Assert** pattern:
1. **Arrange** — seed data, configure mocks
2. **Act** — call the command's execute function
3. **Assert** — verify the interaction reply and any side effects

## What's Next

- [Testing Strategy](../../explanation/03-testing-strategy.md) — the "why" behind these patterns
- [pnpm Scripts](../../reference/02-pnpm-scripts.md) — all test-related scripts
