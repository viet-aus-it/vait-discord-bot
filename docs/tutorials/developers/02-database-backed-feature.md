# Add a Database-Backed Feature

Build a `/kudos` command with two subcommands that reads from and writes to [PostgreSQL](https://www.postgresql.org/) using [Prisma](https://www.prisma.io/).

The finished command has:
- `/kudos give @user` — give kudos to someone (writes to DB)
- `/kudos check @user` — check someone's kudos count (reads from DB)

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- [Docker](https://www.docker.com/) running (for the local database)
- Bot running with `pnpm start`

## Step 1: Update the Schema

For this tutorial, reuse the existing `User` model and its `reputation` field. If your feature needs a new model, edit `prisma/schema.prisma` and run:

```bash
pnpm prisma:migrate
pnpm prisma:gen
```

See [Database Schema](../../reference/04-database-schema.md) for the full model reference.

## Step 2: Create Utility Functions

Create `src/slash-commands/kudos/utils.ts`:

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

> **Tracing note:** Wrap DB utility functions with `tracer.startActiveSpan('db.<entity>.<operation>', ...)` to create spans that appear as children of the calling command's span. For example, `getOrCreateUser` would use `tracer.startActiveSpan('db.user.getOrCreate', async (span) => { try { ... } finally { span.end(); } })`. Prisma queries within the span are auto-instrumented, but the application-level span adds context about _why_ the query ran.

## Step 3: Create the Check Subcommand

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

## Step 4: Create the Give Subcommand

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

## Step 5: Create the Parent Command

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

For details on the `Subcommand` interface and routing pattern, see [Command Interfaces](../../reference/06-command-interfaces.md).

## Step 6: Register and Deploy

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

Open Discord and run `/kudos check`. You should see "YourName has 0 kudos."

Run `/kudos give @someone`. You should see "Gave kudos to someone! They now have 1."

## Step 7: Write a Test

Create `src/slash-commands/kudos/check.test.ts`:

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

You should see the test pass.

## What's Next

- [Test Your Command](./03-testing-your-command.md)
- The `reputation` command (`src/slash-commands/reputation/`) is the production version of this pattern with 5 subcommands and admin permission checks
