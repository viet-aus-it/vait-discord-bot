# Deploy Commands

Deploy slash commands and context menu commands to a test Discord server.

## Prerequisites

Ensure your `.env` file has these values filled in:
- `GUILD_ID`
- `TOKEN`
- `CLIENT_ID`

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

> **Warning:** Only deploy commands **once** after changing command registrations (adding a new command, editing options of an existing one). Running this too often in a short period will cause the Discord API to **rate-limit your bot**.

## Troubleshooting

### "Error: Cannot deploy commands"

Your bot likely lacks the required permissions. Authorise it with the `bot` and `applications.commands` scopes:

```
https://discord.com/api/oauth2/authorize?client_id=$CLIENT_ID&permissions=0&scope=bot%20applications.commands
```

Replace `$CLIENT_ID` with your actual client ID.

### Authentication Failure

Open your `.env` file and verify that your `TOKEN`, `PUBLIC_KEY`, and `CLIENT_ID` are correct.

### Bot Cannot Read Message Content

In the [Discord Developer Portal](https://discord.com/developers/applications), go to **Bot** and enable **Privileged Gateway Intents > Message Content Intent**.
