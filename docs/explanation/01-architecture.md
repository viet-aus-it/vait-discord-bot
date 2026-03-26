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

When OpenTelemetry is enabled (`ENABLE_OTEL=true`), `@opentelemetry/instrumentation-winston` (bundled in auto-instrumentations) automatically patches Winston to send logs through the OTel pipeline. The direct `@axiomhq/winston` transport is kept as a fallback when OTel is disabled, ensuring production log aggregation is never lost. Once OTel is stable in production, the `@axiomhq/winston` fallback will be removed.

## Why OpenTelemetry

The bot uses [OpenTelemetry](https://opentelemetry.io/) (OTel) for instrumenting, generating, collecting and exporting telemetry data (like traces, metrics and logs).OTel is a vendor-neutral observability standard — telemetry data can be exported to any compatible backend without changing application code.

This was chosen over vendor-specific SDKs (e.g., Axiom's own SDK) because:

- **Vendor independence** — switching backends (Axiom, Grafana, Datadog) requires only a config change, not a complete code rewrite, as long as the provider accepts the [OpenTelemtry Protocol](https://opentelemetry.io/docs/specs/otlp/) (or OTLP)
- **Standardised semantic conventions** — attributes like `messaging.system`, `enduser.id`, and `error.type` follow an industry standard, making traces readable by anyone familiar with OTel

Locally, [Jaeger](https://www.jaegertracing.io/) provides a lightweight trace viewer with span graph visualisation. In production, traces export to [Axiom](https://axiom.co/) for centralised observability. The `FilteringSpanProcessor` reduces production costs by dropping unprocessed messages entirely and sampling success spans at 1%, while always exporting error spans.

OTel is disabled by default (`ENABLE_OTEL=false`) and has no impact on bot behaviour when off.

### Wide Events Pattern

The bot follows the "wide events" approach to tracing — one rich span per unit of work (command execution, message processing, background task) rather than deep span hierarchies with many child spans. Each span is enriched with OTel semantic conventions (`messaging.system`, `messaging.operation.name`, `enduser.id`) and Discord-specific attributes (`discord.guild.id`, `discord.interaction.type`, `discord.message.processed`).

Command handlers enrich the active span from anywhere in the call stack using `setSpanAttributes()`, which is a no-op when OTel is disabled. This keeps trace volume low while capturing all the context needed for debugging.

## Why In-Memory Caching for Honeypot

The honeypot feature checks every incoming message to see if it was posted in a honeypot channel. Querying the database on every message would be expensive, so honeypot channels are loaded from the database into an in-memory `Map<guildId, channelId>` at startup. The map is updated immediately when an admin sets a new honeypot channel via the slash command, so changes take effect without a bot restart.

The trade-off is that the in-memory state can drift if the database is modified outside the bot process, but this is acceptable because the only writer is the bot's own slash command.


## Deployment Model

The bot runs as a single [Node.js](https://nodejs.org/) process in a [Docker](https://www.docker.com/) container alongside a PostgreSQL container. Command registration is a separate step (`pnpm deploy:command`) because the Discord API rate-limits registration calls, so commands should only be deployed when their definition changes, not on every bot restart.
