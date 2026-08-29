---
name: create-slash-command
description: Create Discord slash commands for the VAIT bot. Use when the user wants to add a new slash command, context menu command, or modify existing Discord commands. This skill handles command structure, discord.js builders, registration, and unit tests.
---

# Creating Slash Commands

This skill guides you through creating new Discord slash commands for the VAIT bot.

## When to Use This Skill

Use this skill when:

- Creating a new slash command (e.g., `/8ball`, `/reminder`)
- Adding a new subcommand to an existing command group
- Creating a context menu command
- Adding new options to existing commands
- Any work involving `SlashCommandBuilder`, `SlashCommandSubcommandBuilder`, or Discord interactions

## Step-by-Step Process

### 1. Determine Command Structure

**Simple Command**: Single command with options (like `/8ball`)

```
src/slash-commands/<command-name>/
├── index.ts          # Command implementation
└── index.test.ts    # Unit tests
```

**Command with Subcommands**: Parent command routing to subcommands (like `/reminder`)

```
src/slash-commands/<command-name>/
├── index.ts              # Parent command with router
├── <subcommand1>.ts      # Subcommand implementation
├── <subcommand1>.test.ts # Subcommand tests
├── <subcommand2>.ts
├── <subcommand2>.test.ts
└── utils.ts              # Shared utilities (if needed)
```

### 2. Create Command File

Use the templates in `templates/` directory:

- `templates/simple-command.ts` - For single commands
- `templates/subcommand.ts` - For subcommands within a group

### 3. Implement the Command

```typescript
import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('command-name')
  .setDescription('What this command does')
  .setContexts(InteractionContextType.Guild)
  // Add options: addStringOption, addIntegerOption, addUserOption, etc.
  .addStringOption((option) => option.setName('option-name').setDescription('Description').setRequired(true));

const execute = async (interaction: ChatInputCommandInteraction) => {
  // Get options
  const value = interaction.options.getString('option-name', true);

  // Implementation

  // Reply to user
  await interaction.reply('Response message');
};

const command: SlashCommand = { data, execute };
export default command;
```

### 4. Register the Command

Add your command to `src/slash-commands/index.ts`:

```typescript
import myCommand from './my-command';

// Add to the commands array
export const commands: SlashCommand[] = [
  // ... existing commands
  myCommand,
];
```

For context menu commands, register in `src/context-menu-commands/index.ts` instead (exports `commandList: ContextMenuCommand[]`).

### 5. Create Unit Tests (Required)

Every slash command must have a corresponding `.test.ts` file.

#### Test Pattern

Use the test fixtures from `test/fixtures/`:

```typescript
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { myCommand } from '.';

describe('my command tests', () => {
  chatInputCommandInteractionTest('Should do something specific', async ({ interaction }) => {
    // Arrange: Mock option returns
    interaction.options.getString.mockReturnValueOnce(faker.lorem.words());

    // Act: Execute the command
    await myCommand(interaction);

    // Assert: Verify the response
    expect(interaction.reply).toHaveBeenCalledOnce();
  });
});
```

Export the handler as a named export from the command file (e.g. `export const ask8Ball = async (interaction) => ...`) so tests can import and invoke it directly.

#### Available Test Fixtures

| Fixture                             | Use For                                      |
| ----------------------------------- | -------------------------------------------- |
| `chatInputCommandInteractionTest`   | Slash commands (ChatInputCommandInteraction) |
| `contextMenuCommandInteractionTest` | Context menu commands                        |
| `autocompleteInteractionTest`       | Autocomplete handlers                        |

Also available:

- **DB seed helpers** (`test/fixtures/db-seed.ts`): `seedUser`, `seedServerSettings`, `seedReferralCode`, `seedReminder` for seeding a real [PostgreSQL](https://www.postgresql.org/) test database
- **MSW** ([Mock Service Worker](https://mswjs.io/)): `server.use(...)` from `test/mocks/msw/server` to intercept HTTP requests in external-API tests

#### Test Guidelines

- Use `vitest-mock-extended` with `mockDeep` for Discord objects
- Use `@faker-js/faker` for generating test data
- Follow Arrange-Act-Assert pattern
- Test both success and error cases
- Mock external dependencies (e.g. API calls) via MSW `server.use()`
- For database-backed commands, seed data with `db-seed.ts` helpers and assert against the real DB

### 6. Run Tests

```bash
pnpm run test
```

Ensure all tests pass before committing.

## Important Conventions

### Types

Import types from `src/slash-commands/builder.ts`:

- `SlashCommand` - Complete command with data and execute
- `SlashCommandHandler` - The execute function type
- `Subcommand` - Subcommand type for command groups
- `AutocompleteHandler` - Autocomplete handler type

### Error Handling

- Use the `Result` type from [oxide.ts](https://www.npmjs.com/package/oxide.ts) for operations that can fail
- Record errors on the active OTel span with `recordSpanError` **before** logging
- Log errors with the winston logger
- Reply with ephemeral messages for errors

```typescript
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import { recordSpanError } from '../../utils/tracer';

const op = await Result.safe(someOperation());
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-command-action-failed');
  logger.error('[command]: Error message', op.unwrapErr());
  await interaction.reply({
    content: 'Something went wrong.',
    ephemeral: true,
  });
  return;
}
```

Error slugs follow the pattern `err-<command>-<action>-failed` (e.g. `err-reminder-in-failed`).

### Telemetry

Adding telemetry instrumentation is a **compulsory** step when creating a new command (see `.agents/rules/patterns.md`).

- Import `recordSpanError` and `setSpanAttributes` from `src/utils/tracer.ts`. Both are no-ops when OTel is disabled, so they have no impact on regular operation.
- The interaction processor auto-sets `enduser.id`, `discord.guild.id`, `discord.channel.id`, `bot.command.name`, and `discord.interaction.type` on every command span — you don't need to set these.
- Enrich the span with command-specific attributes via `setSpanAttributes()` using the `bot.*`/`discord.*` namespaces (e.g. `bot.weather.location`).
- Don't create or end spans yourself — the interaction processor owns the root span. You only enrich and record errors on the active span.

### Permissions

- Check user permissions before executing sensitive operations
- Use `interaction.memberPermissions` to verify

### Context Types

Always set appropriate context:

```typescript
.setContexts(InteractionContextType.Guild)        // Guild only
.setContexts(InteractionContextType.BotDM)       // Bot DM only
.setContexts([InteractionContextType.Guild, InteractionContextType.BotDM]) // Both
```

## Examples

### Simple Command (8ball)

See `src/slash-commands/8ball/index.ts`:

- Single command with string option
- Simple random response logic
- Basic test with fixture

### Command with Subcommands (reminder)

See `src/slash-commands/reminder/`:

- Parent command routes to subcommands
- Multiple subcommand files
- Database operations with Drizzle (`db.query.<table>`, `getDbClient()` from `src/clients/db`)
- Error handling with Result types and `recordSpanError`

### Command with Autocomplete

See `src/slash-commands/referral/referral-autocomplete.ts`:

- Autocomplete handler implementation
- Register autocomplete in command

## Files Reference

- Command builder types: `src/slash-commands/builder.ts`
- Command registration: `src/slash-commands/index.ts`
- Test fixtures: `test/fixtures/`
- Discord.js docs: https://discord.js.org/#/docs/discord.js/main/general/welcome
