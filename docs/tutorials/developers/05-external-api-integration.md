# Fetch from an External API

Build a slash command that calls an external HTTP API, handles slow responses with deferred replies, and manages errors with [oxide.ts](https://www.npmjs.com/package/oxide.ts) Result types.

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- Bot running locally with `pnpm start`

## Step 1: Create the Fetch Function

Create `src/slash-commands/joke/fetch-joke.ts`:

```typescript
import wretch from 'wretch';

const jokeApi = wretch('https://official-joke-api.appspot.com');

export const fetchJoke = async () => {
  const response = await jokeApi
    .get('/random_joke')
    .json<{ setup: string; punchline: string }>();

  return response;
};
```

The project uses [wretch](https://github.com/elbywan/wretch) as the HTTP client.

> **Tracing note:** Wrap HTTP fetch functions with `tracer.startActiveSpan('http.<service>', ...)` to create spans for external API calls. For example, `fetchJoke` would use `tracer.startActiveSpan('http.joke-api', async (span) => { try { ... } finally { span.end(); } })`. This makes slow or failing third-party calls visible in traces.

## Step 2: Create the Command with Deferred Reply

Create `src/slash-commands/joke/index.ts`:

```typescript
import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommand } from '../builder';
import { fetchJoke } from './fetch-joke';

const data = new SlashCommandBuilder()
  .setName('joke')
  .setDescription('Get a random joke')
  .setContexts(InteractionContextType.Guild);

export const joke = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const result = await Result.safe(fetchJoke());
  if (result.isErr()) {
    logger.error('[joke]: Error fetching joke', result.unwrapErr());
    await interaction.editReply('Could not fetch a joke right now.');
    return;
  }

  const { setup, punchline } = result.unwrap();
  await interaction.editReply(`${setup}\n\n||${punchline}||`);
};

const command: SlashCommand = {
  data,
  execute: joke,
};

export default command;
```

Key parts:
- `deferReply()` tells Discord the bot is working. Without it, the interaction times out after 3 seconds.
- After deferring, use `editReply()` instead of `reply()` to send the response.
- `Result.safe()` wraps the async call — if it throws, you get an `Err` instead of a crash.

See [Error Handling](../../reference/08-error-handling.md) for the Result type API reference.

## Step 3: Register and Deploy

Add to `src/slash-commands/index.ts`:

```typescript
import joke from './joke';

export const commands: SlashCommand[] = [
  // ... existing commands
  joke,
];
```

```bash
pnpm run deploy:command
```

## Step 4: Test It

Open Discord and run `/joke`. You should see "Bot is thinking..." for a moment, then a joke appears with the punchline hidden in a spoiler tag.

## Step 5: Write a Test with MSW

Create `src/slash-commands/joke/index.test.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { server } from '../../../test/mocks/msw/server';
import { joke } from './index';

describe('joke', () => {
  chatInputCommandInteractionTest('should reply with a joke', async ({ interaction }) => {
    server.use(
      http.get('https://official-joke-api.appspot.com/random_joke', () => {
        return HttpResponse.json({ setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side' });
      })
    );

    await joke(interaction);

    expect(interaction.deferReply).toHaveBeenCalledOnce();
    expect(interaction.editReply).toHaveBeenCalledWith(
      'Why did the chicken cross the road?\n\n||To get to the other side||'
    );
  });

  chatInputCommandInteractionTest('should handle API errors', async ({ interaction }) => {
    server.use(
      http.get('https://official-joke-api.appspot.com/random_joke', () => {
        return HttpResponse.error();
      })
    );

    await joke(interaction);

    expect(interaction.editReply).toHaveBeenCalledWith('Could not fetch a joke right now.');
  });
});
```

Run:

```bash
pnpm test src/slash-commands/joke/
```

You should see both tests pass.

## What's Next

- [Scheduled Background Tasks](./06-scheduled-background-tasks.md)
- The `weather` command (`src/slash-commands/weather/`) is the production example of this pattern
- [Testing Utilities](../../reference/07-testing-utilities.md) for MSW handler reference
