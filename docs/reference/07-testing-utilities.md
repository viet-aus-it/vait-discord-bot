# Testing Utilities

API reference for all test fixtures, seed helpers, and mock infrastructure.

## Test Fixtures

### chatInputCommandInteractionTest

[Vitest](https://vitest.dev/) test extension providing a deeply mocked `ChatInputCommandInteraction`.

**File:** `test/fixtures/chat-input-command-interaction.ts`

```typescript
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

chatInputCommandInteractionTest('description', async ({ interaction, message, thread }) => {
  // interaction: DeepMockProxy<ChatInputCommandInteraction>
  // message: DeepMockProxy<Message<true>>
  // thread: DeepMockProxy<PublicThreadChannel>
});
```

| Fixture | Type | Description |
|---------|------|-------------|
| `interaction` | `DeepMockProxy<ChatInputCommandInteraction>` | Mocked slash command interaction with `guildId` pre-set |
| `message` | `DeepMockProxy<Message<true>>` | Mocked guild message with `guildId` pre-set |
| `thread` | `DeepMockProxy<PublicThreadChannel>` | Mocked public thread channel |

All mocks are automatically reset between tests via [vitest-mock-extended](https://www.npmjs.com/package/vitest-mock-extended) `mockReset`.

### contextMenuCommandTest

Test extension for context menu command interactions.

**File:** `test/fixtures/context-menu-command-interaction.ts`

```typescript
import { contextMenuCommandTest } from '../../../test/fixtures/context-menu-command-interaction';

contextMenuCommandTest('description', async ({ interaction }) => {
  // interaction: DeepMockProxy<MessageContextMenuCommandInteraction>
});
```

| Fixture | Type | Description |
|---------|------|-------------|
| `interaction` | `DeepMockProxy<MessageContextMenuCommandInteraction>` | Mocked context menu interaction |

### autocompleteInteractionTest

Test extension for autocomplete interactions.

**File:** `test/fixtures/autocomplete-interaction.ts`

```typescript
import { autocompleteInteractionTest } from '../../../test/fixtures/autocomplete-interaction';

autocompleteInteractionTest('description', async ({ interaction }) => {
  // interaction: DeepMockProxy<AutocompleteInteraction>
});
```

| Fixture | Type | Description |
|---------|------|-------------|
| `interaction` | `DeepMockProxy<AutocompleteInteraction>` | Mocked autocomplete interaction with `guildId` pre-set |

## Database Seed Helpers

**File:** `test/fixtures/db-seed.ts`

All helpers interact with the real [PostgreSQL](https://www.postgresql.org/) database via [Prisma](https://www.prisma.io/).

| Function | Signature | Description |
|----------|-----------|-------------|
| `seedUser` | `(id: string, reputation?: number) => Promise<User>` | Create a user with optional reputation (default: 0) |
| `seedServerSettings` | `(guildId: string, overrides?: Record<string, unknown>) => Promise<ServerChannelsSettings>` | Create server config with optional field overrides |
| `seedReferralCode` | `(data: { userId, guildId, service, code, expiry_date }) => Promise<ReferralCode>` | Create a referral code |
| `seedReminder` | `(data: { userId, guildId, onTimestamp, message }) => Promise<Reminder>` | Create a reminder |
| `cleanDb` | `() => Promise<void>` | Delete all records from all tables (called automatically before each test) |

## MSW Mock Server

[MSW](https://mswjs.io/) (Mock Service Worker) intercepts HTTP requests at the network level.

**Setup file:** `test/mocks/msw/setup.ts`

The mock server starts before all tests, resets handlers after each test, and shuts down after all tests. This is configured automatically in `vitest.config.mts`.

### Available Handlers

| File | API Mocked |
|------|------------|
| `test/mocks/msw/weather-handlers.ts` | Weather API responses |
| `test/mocks/msw/qotd-handlers.ts` | Quote of the Day API responses |
| `test/mocks/msw/aoc-handlers.ts` | Advent of Code API responses |

### Adding Custom Handlers

Use `server.use()` within a test to add one-off handlers:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/msw/server';

server.use(
  http.get('https://api.example.com/data', () => {
    return HttpResponse.json({ key: 'value' });
  })
);
```

Handlers added via `server.use()` are reset after each test.

## Database Isolation

See [Testing Strategy](../explanation/03-testing-strategy.md) for the full explanation of testcontainer setup and per-file database isolation.

**Key files:**
- `test/mocks/database/globalSetup.ts` — starts PostgreSQL container, applies schema
- `test/mocks/database/per-file-db.ts` — creates isolated DB per test file, registers `beforeEach(cleanDb)` and `afterAll` cleanup
