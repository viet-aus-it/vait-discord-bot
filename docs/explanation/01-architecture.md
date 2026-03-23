# Architecture

Design decisions and rationale behind the VAIT Discord Bot's structure.

## Why Modular Commands

The bot uses a modular, command-based architecture where each slash command is a self-contained directory. This was chosen over a monolithic handler because:

- **Isolation** — each command can be developed, tested, and reviewed independently
- **Discoverability** — new contributors can find and understand a command by looking at one directory
- **Scalability** — adding a command does not require modifying shared logic, only registering it in the index

See [Project Structure](../reference/03-project-structure.md) and [Command Interfaces](../reference/06-command-interfaces.md) for the factual layout and API reference.

## Why the Subcommand Pattern

Complex features like `reputation` (5 operations) and `reminder` (5 operations) use [discord.js](https://discord.js.org/) subcommands rather than separate top-level commands. This keeps the Discord command namespace clean and groups related functionality under a single entry point for users.

The trade-off is that the parent command needs a routing function to dispatch to subcommands, but this is a small cost compared to polluting the global command list.

See [Bot Commands Design](./02-bot-commands-design.md) for the full categorisation of commands.

## Why Prisma with PrismaPg

[Prisma](https://www.prisma.io/) was chosen as the ORM for type-safe database queries that integrate well with TypeScript. The `PrismaPg` adapter connects directly to [PostgreSQL](https://www.postgresql.org/) without an intermediate query engine binary.

The database client uses a singleton pattern with lazy initialisation. This means the Prisma instance is only created when the first database query is made, avoiding unnecessary connections during bot startup for commands that do not use the database.

## Why Result Types Over Exceptions

The codebase prefers `Ok`/`Err` from [oxide.ts](https://www.npmjs.com/package/oxide.ts) over thrown exceptions. This makes error paths explicit in the type system — a function returning `Result<User, string>` clearly communicates that it can fail, unlike a function that silently throws.

The trade-off is more verbose call sites (checking `isOk()`/`isErr()`), but this is preferable to unhandled exceptions crashing the bot process. Errors are logged via [Winston](https://www.npmjs.com/package/winston), and user-facing error messages are sent as ephemeral Discord replies.

See [Error Handling](../reference/08-error-handling.md) for the API reference.

## Why Lazy User Creation

Database-backed commands (reputation, referral, reminder) create user records on first interaction rather than requiring pre-registration. This was chosen because Discord does not provide a reliable "user joined" event for all cases, and requiring users to register before using the bot would add friction.

The `getOrCreateUser` pattern (find or create) trades a potential extra database read for a simpler user experience.

## Why Winston with Axiom

Logging uses [Winston](https://www.npmjs.com/package/winston) locally (console with pretty-printing) and [Axiom](https://axiom.co/) in production (centralised log aggregation). This split allows development debugging without external dependencies while providing searchable, persistent logs in production.

## Deployment Model

The bot runs as a single [Node.js](https://nodejs.org/) process in a [Docker](https://www.docker.com/) container alongside a PostgreSQL container. Command registration is a separate step (`pnpm deploy:command`) because the Discord API rate-limits registration calls, so commands should only be deployed when their definition changes, not on every bot restart.
