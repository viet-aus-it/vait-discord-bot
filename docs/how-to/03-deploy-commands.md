# Deploy Commands

Deploy slash commands and context menu commands to a test Discord server.

## Prerequisites

Ensure your `.env` file has `GUILD_ID`, `TOKEN`, and `CLIENT_ID` filled in.

## Register Your Commands

Add your commands to the appropriate index file:

```ts
// src/slash-commands/index.ts
import yourCommand from './your-command';

export const commands: SlashCommand[] = [yourCommand];
```

```ts
// src/context-menu-commands/index.ts
import yourCommand from './your-command';

export const commandList: ContextMenuCommand[] = [yourCommand];
```

Then run:

```bash
pnpm run deploy:command
```

Run this command only once per registration change.

## Fix "Error: Cannot deploy commands"

Authorise the bot with the `bot` and `applications.commands` scopes:

```
https://discord.com/api/oauth2/authorize?client_id=$CLIENT_ID&permissions=0&scope=bot%20applications.commands
```

Replace `$CLIENT_ID` with your actual client ID.

## Fix Authentication Failure

Open your `.env` file and verify `TOKEN`, `PUBLIC_KEY`, and `CLIENT_ID`.

## Fix "Bot Cannot Read Message Content"

In the [Discord Developer Portal](https://discord.com/developers/applications), go to **Bot** and enable **Privileged Gateway Intents > Message Content Intent**.
