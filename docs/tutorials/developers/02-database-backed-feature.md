# Add a Database-Backed Feature

In this tutorial, you will build a slash command with subcommands that reads from and writes to the PostgreSQL database using [Prisma](https://www.prisma.io/).

## What You Will Build

A `/kudos` command with two subcommands:
- `/kudos give @user` — give kudos to someone (writes to DB)
- `/kudos check @user` — check someone's kudos count (reads from DB)

This tutorial uses the same patterns as the `reputation` command.

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- Docker running (for the local database)
- Bot running with `pnpm start`

## Step 1: Update the Schema (Optional)

If your feature needs a new database model, edit `prisma/schema.prisma`. For this tutorial, we will reuse the existing `User` model and its `reputation` field.

When you do need to add a model:

```prisma
model YourModel {
  id     String @id @default(cuid())
  // ... fields
}
```

Then run:

```bash
pnpm prisma:migrate
pnpm prisma:gen
```

## Step 2: Create Utility Functions

Create `src/slash-commands/kudos/utils.ts` with database helpers:

```typescript
import { getDbClient } from '../../clients';

export const getOrCreateUser = async (userId: string) => {
  const db = getDbClient();

  let user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await db.user.create({ data: { id: userId } });
  }

  return user;
};
```

Key points:
- `getDbClient()` returns the Prisma singleton (see [Architecture](../../explanation/01-architecture.md))
- Users are lazily created on first interaction, no pre-registration needed
- Prisma provides type-safe queries, your IDE will autocomplete model fields

## Step 3: Create Subcommands

Create `src/slash-commands/kudos/check.ts`:

```typescript
import { type ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import type { Subcommand } from '../builder';
import { getOrCreateUser } from './utils';

const data = new SlashCommandSubcommandBuilder()
  .setName('check')
  .setDescription('Check kudos for a user')
  .addUserOption((option) => option.setName('user').setDescription('User to check').setRequired(false));

const execute = async (interaction: ChatInputCommandInteraction) => {
  const targetUser = interaction.options.getUser('user') ?? interaction.user;
  const user = await getOrCreateUser(targetUser.id);

  await interaction.reply(`${targetUser.displayName} has ${user.reputation} kudos.`);
};

const subcommand: Subcommand = { data, execute };
export default subcommand;
```

Create `src/slash-commands/kudos/give.ts`:

```typescript
import { type ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { getDbClient } from '../../clients';
import type { Subcommand } from '../builder';
import { getOrCreateUser } from './utils';

const data = new SlashCommandSubcommandBuilder()
  .setName('give')
  .setDescription('Give kudos to someone')
  .addUserOption((option) => option.setName('user').setDescription('User to give kudos to').setRequired(true));

const execute = async (interaction: ChatInputCommandInteraction) => {
  const targetUser = interaction.options.getUser('user', true);

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({ content: "You can't give kudos to yourself!", ephemeral: true });
    return;
  }

  await getOrCreateUser(interaction.user.id);
  await getOrCreateUser(targetUser.id);

  const db = getDbClient();
  const updated = await db.user.update({
    where: { id: targetUser.id },
    data: { reputation: { increment: 1 } },
  });

  await interaction.reply(`Gave kudos to ${targetUser.displayName}! They now have ${updated.reputation}.`);
};

const subcommand: Subcommand = { data, execute };
export default subcommand;
```

Note the patterns:
- **Ephemeral replies** for error messages (only the user sees them)
- **Self-action prevention** — users cannot give kudos to themselves
- **Lazy user creation** — both users are created if they do not exist
- **Prisma `increment`** — atomic database operation, no read-then-write race condition

## Step 4: Create the Parent Command

Create `src/slash-commands/kudos/index.ts`:

```typescript
import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';
import check from './check';
import give from './give';

const data = new SlashCommandBuilder()
  .setName('kudos')
  .setDescription('Kudos module')
  .setContexts(InteractionContextType.Guild)
  .addSubcommand(check.data)
  .addSubcommand(give.data);

const subcommands = [check, give];

const execute = async (interaction: ChatInputCommandInteraction) => {
  const requested = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find((cmd) => cmd.data.name === requested);
  return subcommand?.execute(interaction);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
```

The parent command:
1. Registers all subcommands via `.addSubcommand()`
2. Routes to the correct subcommand based on the user's selection
3. Exports the combined `SlashCommand` object

## Step 5: Register and Deploy

Add to `src/slash-commands/index.ts`:

```typescript
import kudos from './kudos';

export const commands: SlashCommand[] = [
  // ... existing commands
  kudos,
];
```

Deploy:

```bash
pnpm run deploy:command
```

## Step 6: Test It

Test the database interaction with real testcontainers. Create `src/slash-commands/kudos/check.test.ts`:

```typescript
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { seedUser } from '../../../test/fixtures/db-seed';
import check from './check';

describe('kudos check', () => {
  chatInputCommandInteractionTest('should show reputation for a seeded user', async ({ interaction }) => {
    await seedUser('123', 5);

    const mockUser = { id: '123', displayName: 'TestUser' };
    interaction.options.getUser.mockReturnValueOnce(mockUser as any);

    await check.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith('TestUser has 5 kudos.');
  });
});
```

Run:

```bash
pnpm test src/slash-commands/kudos/
```

## What's Next

- [Test Your Command](./03-testing-your-command.md) — comprehensive testing patterns
- [Database Schema](../../reference/04-database-schema.md) — all available models
- [Testing Strategy](../../explanation/03-testing-strategy.md) — why testcontainers over mocks

## Reference: The Reputation Command

The `reputation` command (`src/slash-commands/reputation/`) is the production version of this pattern with 5 subcommands, admin permission checks, a leaderboard with table formatting, and a full audit log via `ReputationLog`. Study it as the canonical database-backed command.
