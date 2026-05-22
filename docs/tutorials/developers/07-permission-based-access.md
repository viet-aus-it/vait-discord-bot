# Restrict a Command to Admins

Build a slash command that only server administrators can see and use, with a runtime permission check as a fallback.

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- Bot running locally with `pnpm run start`
- An admin role on your test Discord server

## Step 1: Create the Command with Permission Restriction

Create `src/slash-commands/announce/index.ts`:

```typescript
import { type ChatInputCommandInteraction, type GuildMember, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { isAdmin } from '../../utils/permission';
import type { SlashCommand } from '../builder';

const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Send an announcement to the channel')
  .addStringOption((option) => option.setName('message').setDescription('Announcement text').setRequired(true))
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

const execute = async (interaction: ChatInputCommandInteraction) => {
  const member = interaction.member as GuildMember;
  if (!isAdmin(member)) {
    await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    return;
  }

  const message = interaction.options.getString('message', true);
  await interaction.reply(message);
};

const command: SlashCommand = {
  data,
  execute,
};

export default command;
```

`.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)` hides the command from users who lack the ManageChannels permission. Discord enforces this at the client level.

The `isAdmin()` check inside `execute` is a runtime fallback. See [Command Interfaces](../../reference/06-command-interfaces.md) for the full `SlashCommand` API.

## Step 2: Use the Permission Helpers

The project provides two helpers in `src/utils/permission.ts`:

```typescript
import { isAdmin, isModerator } from '../../utils/permission';

// Check if the member has Administrator permission
isAdmin(interaction.member as GuildMember);

// Check if the member has a role named "moderator"
isModerator(interaction.member as GuildMember);
```

## Step 3: Register and Deploy

Add to `src/slash-commands/index.ts`:

```typescript
import announce from './announce';

export const commands: SlashCommand[] = [
  // ... existing commands
  announce,
];
```

```bash
pnpm run deploy:command
```

## Step 4: Test It

Open Discord as an admin and type `/announce`. You should see the command in autocomplete. Run it — the bot posts your message.

Switch to a non-admin account (or remove your admin role temporarily). Type `/announce`. You should not see the command in the autocomplete list.

## Step 5: Write a Test

Create `src/slash-commands/announce/index.test.ts`:

```typescript
import { PermissionsBitField } from 'discord.js';
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

describe('announce', () => {
  chatInputCommandInteractionTest('should reject non-admin users', async ({ interaction }) => {
    const member = { permissions: new PermissionsBitField() } as any;
    Object.defineProperty(interaction, 'member', { value: member });

    const { execute } = await import('./index');
    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: 'You do not have permission to use this command.', ephemeral: true }));
  });
});
```

Run:

```bash
pnpm test src/slash-commands/announce/
```

You should see the test pass.

## What's Next

- The `server-settings` and `autobump-threads` commands are production examples of this pattern
- [Bot Commands Reference](../../reference/01-commands-list.md) for all admin commands
