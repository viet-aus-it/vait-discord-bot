# Build Your First Slash Command

Create a `/ping` command from scratch, register it, deploy it, and write a test for it.

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

Commands are plain async functions — no tracing imports or span wrapping needed. The `processInteraction` handler creates a single wide event span that captures all context (user, guild, command name, errors) automatically.

If your command does external work (DB queries, API calls), you can enrich the span with domain-specific attributes:

```typescript
import { setSpanAttributes } from '../../utils/tracer';

const execute = async (interaction: ChatInputCommandInteraction) => {
  const message = interaction.options.getString('message');
  setSpanAttributes({ 'discord.ping.has_message': !!message });
  await interaction.reply(message ? `Pong! You said: ${message}` : 'Pong!');
};
```

`setSpanAttributes()` grabs the active span from the call stack and is a no-op when OTEL is disabled. Use the `discord.*` namespace for custom attributes. See [Architecture — Wide Events](../../explanation/01-architecture.md#why-wide-events-over-deep-traces) for the full attribute naming conventions.

For details on the `SlashCommand` interface and builder types, see [Command Interfaces](../../reference/06-command-interfaces.md).

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

Update the command to accept an optional message:

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

See the [discord.js builder docs](https://discord.js.org/docs/packages/builders/main) for all available option types.

## Step 5: Deploy and Test

Deploy the command to your test server:

```bash
pnpm run deploy:command
```

Open Discord and type `/ping`. You should see your command in the autocomplete. Run it — the bot replies with "Pong!".

Try `/ping message: hello` — you should see "Pong! You said: hello".

## Step 6: Write a Test

Create `src/slash-commands/ping/index.test.ts`:

```typescript
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
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

You should see both tests pass.

## What's Next

- [Add a Database-Backed Feature](./02-database-backed-feature.md)
- [Test Your Command](./03-testing-your-command.md)
- The `8ball` command (`src/slash-commands/8ball/index.ts`) is the production example of this pattern
