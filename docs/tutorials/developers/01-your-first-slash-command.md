# Build Your First Slash Command

In this tutorial, you will create a simple slash command from scratch, register it, and test it in your Discord server.

## What You Will Build

A `/ping` command that replies with "Pong!" when a user runs it. This covers the core pattern used by every command in the bot.

## Prerequisites

- Completed the [Quick Start](../../how-to/01-quick-start.md) setup
- Bot running locally with `pnpm start`

## Step 1: Create the Command Directory

Create a new directory for your command:

```
src/slash-commands/ping/
```

## Step 2: Write the Command

Create `src/slash-commands/ping/index.ts`:

```typescript
import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check if the bot is alive')
  .setContexts(InteractionContextType.Guild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply('Pong!');
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
```

Let's break this down:

1. **`data`** — uses [discord.js](https://discord.js.org/) `SlashCommandBuilder` to define the command name, description, and where it can be used (guild only)
2. **`execute`** — the async function that handles the interaction. It receives a `ChatInputCommandInteraction` and must reply to the user
3. **`command`** — the exported `SlashCommand` object that the bot uses to register and route the command

## Step 3: Register the Command

Open `src/slash-commands/index.ts` and add your command:

```typescript
import ping from './ping';

export const commands: SlashCommand[] = [
  // ... existing commands
  ping,
];
```

## Step 4: Add an Option

Let's make the command more interesting by adding a `message` option:

```typescript
const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check if the bot is alive')
  .addStringOption((option) =>
    option.setName('message').setDescription('Optional message to echo back').setRequired(false)
  )
  .setContexts(InteractionContextType.Guild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  const message = interaction.options.getString('message');
  const reply = message ? `Pong! You said: ${message}` : 'Pong!';
  await interaction.reply(reply);
};
```

Options are added via builder methods:
- `.addStringOption()` — text input
- `.addUserOption()` — user mention
- `.addNumberOption()` — numeric input
- `.addBooleanOption()` — true/false toggle

See the [discord.js builder docs](https://discord.js.org/docs/packages/builders/main) for all available option types.

## Step 5: Deploy and Test

Deploy the command to your test server:

```bash
pnpm run deploy:command
```

> Remember: only run this once per command registration change. See [Deploy Commands](../../how-to/03-deploy-commands.md).

Open Discord, type `/ping`, and you should see your command in the autocomplete. Run it to see the response.

## Step 6: Write a Test

Create `src/slash-commands/ping/index.test.ts`:

```typescript
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

// Import your execute function directly
import { execute } from './index';

describe('ping', () => {
  chatInputCommandInteractionTest('should reply with Pong!', async ({ interaction }) => {
    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Pong!');
  });

  chatInputCommandInteractionTest('should echo the message if provided', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('hello');

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith('Pong! You said: hello');
  });
});
```

Run the test:

```bash
pnpm test src/slash-commands/ping/index.test.ts
```

## What's Next

- [Add a Database-Backed Feature](./02-database-backed-feature.md) — learn how to persist data with Prisma
- [Test Your Command](./03-testing-your-command.md) — deeper dive into the testing patterns
- [Bot Commands Design](../../explanation/02-bot-commands-design.md) — understand the design rationale

## Reference: The 8ball Command

The `8ball` command (`src/slash-commands/8ball/index.ts`) is the real-world example of this pattern. It adds a required string option, picks a random reply, logs the interaction, and responds. Study it as a model for simple stateless commands.
