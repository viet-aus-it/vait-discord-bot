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
    await myCommand.execute(interaction);

    // Assert: Verify the response
    expect(interaction.reply).toHaveBeenCalledOnce();
  });
});
```

#### Available Test Fixtures

| Fixture                             | Use For                                      |
| ----------------------------------- | -------------------------------------------- |
| `chatInputCommandInteractionTest`   | Slash commands (ChatInputCommandInteraction) |
| `contextMenuCommandInteractionTest` | Context menu commands                        |
| `autocompleteInteractionTest`       | Autocomplete handlers                        |

#### Test Guidelines

- Use `vitest-mock-extended` with `mockDeep` for Discord objects
- Use `@faker-js/faker` for generating test data
- Follow Arrange-Act-Assert pattern
- Test both success and error cases
- Mock external dependencies (databases, APIs)

### 6. Run Tests

```bash
pnpm test
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

- Use `Result` type from `oxide.ts` for operations that can fail
- Always log errors with the winston logger
- Reply with ephemeral messages for errors

```typescript
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';

const op = await Result.safe(someOperation());
if (op.isErr()) {
  logger.error(op.err());
  await interaction.reply('An error occurred. Please try again.');
  return;
}
```

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
- Database operations with Prisma
- Error handling with Result types

### Command with Autocomplete

See `src/slash-commands/referral/referral-autocomplete.ts`:

- Autocomplete handler implementation
- Register autocomplete in command

## Files Reference

- Command builder types: `src/slash-commands/builder.ts`
- Command registration: `src/slash-commands/index.ts`
- Test fixtures: `test/fixtures/`
- Discord.js docs: https://discord.js.org/#/docs/discord.js/main/general/welcome
