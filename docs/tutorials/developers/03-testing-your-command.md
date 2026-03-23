# Test Your Command

Write tests for a slash command using the bot's testing infrastructure: mock Discord interactions, test against a real [PostgreSQL](https://www.postgresql.org/) database, and intercept HTTP requests.

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- [Docker](https://www.docker.com/) running (for [testcontainers](https://node.testcontainers.org/))
- Familiarity with [Vitest](https://vitest.dev/) basics

## Part 1: Test a Simple Command

Create a test file next to your command, e.g. `src/slash-commands/ping/index.test.ts`:

```typescript
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

describe('ping', () => {
  chatInputCommandInteractionTest('should reply with Pong!', async ({ interaction }) => {
    const { execute } = await import('./index');
    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Pong!');
  });
});
```

Mock option values like this:

```typescript
interaction.options.getString.mockReturnValueOnce('hello');
interaction.options.getUser.mockReturnValueOnce({ id: '123', displayName: 'Sam' } as any);
interaction.options.getNumber.mockReturnValueOnce(42);
```

See [Testing Utilities](../../reference/07-testing-utilities.md) for the full fixture API reference.

## Part 2: Test Database Interactions

Database tests run against a real PostgreSQL container automatically. Seed test data, run the command, and assert the result:

```typescript
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedUser } from '../../../test/fixtures/db-seed';

describe('my-db-command', () => {
  chatInputCommandInteractionTest('should read from the database', async ({ interaction }) => {
    await seedUser('user-1', 10);

    await myCommand(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('10'));
  });
});
```

See [Testing Utilities](../../reference/07-testing-utilities.md) for all available seed helpers.

## Part 3: Test HTTP Requests with MSW

For commands that call external APIs, use [MSW](https://mswjs.io/) to intercept requests:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/msw/server';

describe('weather command', () => {
  chatInputCommandInteractionTest('should display weather', async ({ interaction }) => {
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

## Part 4: Mock Complex Discord Objects

```typescript
import { Collection, type GuildMember } from 'discord.js';

chatInputCommandInteractionTest('should handle guild members', async ({ interaction }) => {
  const mockMembers = new Collection<string, GuildMember>();
  mockMembers.set('user-1', { nickname: 'Sam', displayName: 'Sammy' } as GuildMember);

  interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

  await myCommand(interaction);

  expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('Sam'));
});
```

## Part 5: Run the Tests

```bash
pnpm test src/slash-commands/ping/index.test.ts
```

You should see all tests pass. Try running the full suite:

```bash
pnpm test
```

## What's Next

- [Testing Utilities](../../reference/07-testing-utilities.md) — full API reference for fixtures and seed helpers
- [Testing Strategy](../../explanation/03-testing-strategy.md) — design decisions behind the testing approach
- [pnpm Scripts](../../reference/02-pnpm-scripts.md) — all test-related scripts
