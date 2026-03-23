# Architecture

How the VAIT Discord Bot is structured and why.

## Overview

The bot is a [Node.js](https://nodejs.org/) application built with [discord.js](https://discord.js.org/) v14, [Prisma](https://www.prisma.io/) ORM, and [PostgreSQL](https://www.postgresql.org/). It follows a modular, command-based architecture where each slash command is a self-contained unit.

## Startup Flow

1. **Entry point** (`bin/`) loads environment variables and initialises the Discord client
2. **Discord client** (`src/clients/discord.ts`) connects to the Discord gateway with required intents (Guilds, GuildMessages, MessageContent) and partial message support
3. **Database client** (`src/clients/db.ts`) provides a lazy-initialised Prisma singleton using the `PrismaPg` adapter
4. **Command registration** — slash commands and context menu commands are registered in their respective `index.ts` files and deployed via `pnpm deploy:command`
5. **Event handling** — the bot listens for interaction events and routes them to the appropriate command handler

## Command Architecture

Commands follow a consistent pattern defined by the `SlashCommand` interface in `src/slash-commands/builder.ts`:

```typescript
interface SlashCommand {
  data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: SlashCommandHandler;
  autocomplete?: AutocompleteHandler;
}
```

Each command lives in its own directory under `src/slash-commands/[command-name]/` with:
- `index.ts` — command definition, builder configuration, and execute handler
- `index.test.ts` — co-located tests
- `utils.ts` — command-specific helper functions (when needed)

### Simple Commands

Commands like `8ball` or `cowsay` are stateless. They receive an interaction, process it, and reply. No database needed.

### Database-Backed Commands

Commands like `reputation`, `referral`, and `reminder` interact with PostgreSQL via Prisma. They follow this flow:

1. Receive the interaction
2. Extract options from the interaction
3. Call the database via `getDbClient()`
4. Return a result using `Ok`/`Err` from [oxide.ts](https://www.npmjs.com/package/oxide.ts)
5. Reply to the user based on the result

### Subcommand Pattern

Complex features use subcommands. The parent command routes to the correct subcommand based on `interaction.options.getSubcommand(true)`:

```typescript
const subcommands = [checkRep, giveRep, takeRep, setRep, leaderboard];

const execute = async (interaction) => {
  const requested = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find((cmd) => cmd.data.name === requested);
  return subcommand?.execute(interaction);
};
```

## Database Layer

The database client uses a singleton pattern with lazy initialisation:
- `getDbClient()` returns a shared Prisma instance
- The `PrismaPg` adapter connects directly to PostgreSQL
- Sensitive fields (e.g. `aocKey`) are omitted from default queries
- `disconnectDb()` handles cleanup on shutdown

## Error Handling Philosophy

The codebase prefers Result types (`Ok`/`Err`) from oxide.ts over thrown exceptions. This makes error paths explicit and type-safe. Errors are logged via [Winston](https://www.npmjs.com/package/winston) and user-facing error messages are sent as ephemeral Discord replies.

## Deployment Pipeline

1. **Command deployment** (`pnpm deploy:command`) registers slash commands with the Discord API for a specific guild (development) or globally (production)
2. **Bot process** (`pnpm start`) runs database migrations and starts the bot
3. **Production** uses Docker Compose to orchestrate the bot and database containers
