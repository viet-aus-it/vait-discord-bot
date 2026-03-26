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

## Why Winston with OpenTelemetry

Logging uses [Winston](https://www.npmjs.com/package/winston) with an [OpenTelemetry log bridge](https://www.npmjs.com/package/@opentelemetry/winston-transport). In development, logs go to console only (pretty-printed for readability). In production with OpenTelemetry enabled, logs are routed through the OTEL pipeline to [Axiom](https://axiom.co/) alongside traces, giving automatic trace-log correlation. When OpenTelemetry is disabled, production falls back to console-only.

For local observability, [OpenObserve](https://openobserve.ai/) provides a single-binary solution for viewing traces, logs, and metrics via its built-in UI at `http://localhost:5080`.

## Why Wide Events Over Deep Traces

The app uses [OpenTelemetry](https://opentelemetry.io/) following a **wide events** philosophy: one rich span per unit of work, packed with all the context needed for debugging, rather than a deep tree of narrow child spans.

Each entry point — `processInteraction` for Discord commands, `processMessage` for message handlers, or a bin script's `main` function — creates a single root span and attaches all relevant attributes to it. Downstream command handlers enrich the same span with domain-specific attributes using `setSpanAttributes()` from `src/utils/tracer.ts`, which grabs the active span via `trace.getActiveSpan()`. No child spans are created manually.

**Attribute naming follows [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/):**

| Category | Attributes | Source |
|----------|-----------|--------|
| OTEL Messaging | `messaging.system` (`"discord"`), `messaging.operation.type`, `messaging.operation.name`, `messaging.destination.name`, `messaging.message.id` | [Messaging Conventions](https://opentelemetry.io/docs/specs/semconv/messaging/) |
| OTEL EndUser | `enduser.id` | [General Conventions](https://opentelemetry.io/docs/specs/semconv/general/attributes/) |
| OTEL Error | `error.type` (low-cardinality slug like `err-command-rep-failed`) | [Error Conventions](https://opentelemetry.io/docs/specs/semconv/general/attributes/) |
| Discord custom | `discord.guild.id`, `discord.interaction.type`, `discord.message.processed`, `discord.message.honeypot` | Custom, `discord.*` namespace |
| Command custom | `discord.rep.*`, `discord.referral.*`, `discord.reminder.*`, `discord.weather.*`, etc. | Custom, set by command handlers via `setSpanAttributes()` |
| Service (resource) | `service.name`, `service.version` | Set once on the OTEL resource in `bin/telemetry.ts`, auto-attached to all spans |

This means any single span in the tracing backend contains enough information to understand what happened, who triggered it, where it ran, and whether it succeeded — without clicking through a span waterfall.

**Enriching spans from command handlers:**

Any function called within a span's scope can enrich it:

```typescript
import { setSpanAttributes } from '../../utils/tracer';

// Inside a command handler — the active span is the processInteraction wide event
setSpanAttributes({
  'discord.rep.target_user_id': targetUser.id,
  'discord.rep.new_value': updatedUser.reputation,
});
```

`setSpanAttributes()` is a no-op when OTEL is disabled (no active span), so command handlers don't need any conditional checks.

**FilteringSpanProcessor** (`src/utils/filtering-span-processor.ts`) implements tail-based sampling, deciding _after_ a span ends whether to export it:

- **Errors** — always exported (100%). Every failed request reaches the backend.
- **Unprocessed messages** — spans where `discord.message.processed === false` (messages that did not trigger a honeypot and did not match any keyword) are sampled at 1:10,000 to avoid noise.
- **Success spans** — sampled at 1% to keep costs manageable while still providing a statistical picture of normal traffic.

**Auto-instrumentation** — Prisma/PostgreSQL queries and Node.js HTTP calls are automatically captured by `@opentelemetry/auto-instrumentations-node`. These appear as child spans beneath the wide root span, providing low-level timing without any manual instrumentation code.

### References

- [A Practitioner's Guide to Wide Events](https://jeremymorrell.dev/blog/a-practitioners-guide-to-wide-events/)
- [All You Need Is Wide Events, Not Metrics](https://isburmistrov.substack.com/p/all-you-need-is-wide-events-not-metrics)
- [Observability Wide Events 101](https://boristane.com/blog/observability-wide-events-101/)
- [Is It Time to Version Observability?](https://charity.wtf/2024/08/07/is-it-time-to-version-observability-signs-point-to-yes/)
- [One Key Difference: Observability 1.0 vs 2.0](https://www.honeycomb.io/blog/one-key-difference-observability1dot0-2dot0)
- [AWS: Instrumenting Distributed Systems](https://aws.amazon.com/builders-library/instrumenting-distributed-systems-for-operational-visibility/)

## Why In-Memory Caching for Honeypot

The honeypot feature checks every incoming message to see if it was posted in a honeypot channel. Querying the database on every message would be expensive, so honeypot channels are loaded from the database into an in-memory `Map<guildId, channelId>` at startup. The map is updated immediately when an admin sets a new honeypot channel via the slash command, so changes take effect without a bot restart.

The trade-off is that the in-memory state can drift if the database is modified outside the bot process, but this is acceptable because the only writer is the bot's own slash command.

## Deployment Model

The bot runs as a single [Node.js](https://nodejs.org/) process in a [Docker](https://www.docker.com/) container alongside a PostgreSQL container. Command registration is a separate step (`pnpm deploy:command`) because the Discord API rate-limits registration calls, so commands should only be deployed when their definition changes, not on every bot restart.
