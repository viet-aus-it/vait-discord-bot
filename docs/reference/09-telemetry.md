# Telemetry

Reference for the bot's [OpenTelemetry](https://opentelemetry.io/) (OTel) instrumentation. See [Why OpenTelemetry](../explanation/01-architecture.md#why-opentelemetry) for the design rationale.

## Tracer Utilities (`src/utils/tracer.ts`)

| Export                          | Description                                                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `tracer`                        | The OTel tracer instance, used to create spans via `tracer.startActiveSpan()`                                                                  |
| `recordSpanError(error, slug)`  | Records an error on the active span: sets status to ERROR and `error.type` to the given slug. No-op when OTel is disabled.                     |
| `setSpanAttributes(attributes)` | Sets multiple attributes on the active span in one call. Accepts a `Record<string, string \| number \| boolean>`. No-op when OTel is disabled. |

## Span Lifecycle

- Every span opened with `tracer.startActiveSpan()` **must** be ended gracefully via `span.end()`.
- Wrap the span callback body in `Result.safe` so `span.end()` always runs without `try/finally`. Extract the logic into a named function at module level.
- Calling `process.exit()` in a script before `span.end()` will drop the span — it will never be exported. In bin scripts, return an exit code from the span callback and call `process.exit()` after the span ends.
- In production, background tasks use `BatchSpanProcessor`, which buffers spans and flushes on shutdown. The SIGTERM handler in `bin/telemetry.ts` handles graceful flush.

```typescript
// Long-running process (bot, server)
const handleOperation = async (span: Span) => {
  span.setAttribute('bot.key', 'value');
  const op = await Result.safe(doWork());
  if (op.isErr()) {
    recordSpanError(op.unwrapErr(), 'err-operation-failed');
    return;
  }
  // ... use op.unwrap()
};

return tracer.startActiveSpan('operationName', async (span) => {
  await Result.safe(handleOperation(span));
  span.end();
});

// Bin script (exits after completion)
const result = await tracer.startActiveSpan('taskName', async (span) => {
  const op = await Result.safe(handleTask(span));
  span.end();
  return op;
});
const exitCode = result.isOk() ? result.unwrap() : 1;
process.exit(exitCode);
```

## Attribute Namespaces

Prefer constants from [`@opentelemetry/semantic-conventions`](https://opentelemetry.io/docs/specs/semconv/) when the attribute matches an existing convention. For custom attributes:

| Namespace     | Usage                                                                                               | Examples                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| OTel standard | Attributes defined in the [OTel Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) | `enduser.id`, `error.type`                                                                         |
| `error.*`     | Error classification. `error.type` is the slug                                                      | `error.type=err-weather-fetch-failed`                                                              |
| `discord.*`   | Data received from the Discord API                                                                  | `discord.guild.id`, `discord.channel.id`, `discord.message.id`, `discord.interaction.type`         |
| `bot.*`       | Bot-specific logic and state                                                                        | `bot.command.name`, `bot.message.processed`, `bot.message.honeypot`, `bot.rep.*`, `bot.reminder.*` |

Business conditions (empty lists, missing config, duplicate entries) are logged at `warn`/`info` and do NOT become error spans.

## Span Enrichment

Command handlers enrich the wide event span with domain-specific attributes via `setSpanAttributes()`. Errors caught internally (via `Result.safe`) are recorded on the span with `recordSpanError()` so they appear in OTel even when the handler replies gracefully to the user.

### Interaction Processor (set on every command span)

| Attribute                  | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `enduser.id`               | Discord user ID of the invoking user                        |
| `discord.guild.id`         | Guild where the interaction occurred                        |
| `discord.channel.id`       | Channel where the interaction occurred                      |
| `bot.command.name`         | Slash command name                                          |
| `discord.interaction.type` | `chatInputCommand`, `contextMenuCommand`, or `autocomplete` |

### Command-Specific Attributes

| Command                           | Attributes                                                             |
| --------------------------------- | ---------------------------------------------------------------------- |
| **reputation** (give/set/take)    | `bot.rep.actor_user_id`, `bot.rep.target_user_id`, `bot.rep.new_value` |
| **reputation** (check)            | `bot.rep.actor_user_id`, `bot.rep.value`                               |
| **reputation** (leaderboard)      | `bot.rep.leaderboard_size`, `bot.rep.result_count`                     |
| **reminder** (in/on)              | `bot.reminder.target_timestamp`                                        |
| **reminder** (list)               | `bot.reminder.count`                                                   |
| **reminder** (delete/update)      | `bot.reminder.id`                                                      |
| **referral** (new/delete/update)  | `bot.referral.service`                                                 |
| **referral** (list)               | `bot.referral.count`                                                   |
| **referral** (random)             | `bot.referral.service`, `bot.referral.count`                           |
| **weather**                       | `bot.weather.location`                                                 |
| **aoc-leaderboard**               | `bot.aoc.cached`                                                       |
| **server-settings**               | `bot.settings.type`, `bot.settings.channel_id`                         |
| **autobump-threads** (add/remove) | `bot.autobump.thread_id`                                               |
| **autobump-threads** (list)       | `bot.autobump.thread_count`                                            |
| **moderate-users**                | `bot.moderate.role_id`, `bot.moderate.members_removed`                 |

### Message Processor (set on every message span)

| Attribute                      | Description                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `enduser.id`                   | Discord user ID of the message author                        |
| `discord.guild.id`             | Guild where the message was sent                             |
| `discord.channel.id`           | Channel where the message was sent                           |
| `discord.message.id`           | Discord message ID                                           |
| `bot.message.processed`        | Whether any keyword matched                                  |
| `bot.message.fromBot`          | `true` when the message author is a bot (processing skipped) |
| `bot.message.matched_keywords` | Comma-separated list of matched keywords (when processed)    |
| `bot.message.honeypot`         | `true` when the message was in a honeypot channel            |

### Message Handler Attributes

| Handler                     | Attributes                                       |
| --------------------------- | ------------------------------------------------ |
| **thankUserInMessage**      | `bot.rep.actor_user_id`, `bot.rep.mention_count` |
| **honeypot trigger**        | `bot.honeypot.user_id`, `bot.honeypot.timestamp` |
| **loadHoneypots** (startup) | `bot.honeypot.channel_count`                     |

## Fatal Process Signals (`bin/main.ts`)

Uncaught exceptions and unhandled rejections crash the process. Handlers registered before `main()` emit a fatal span so the crash is visible in OTel, log it, flush telemetry, then exit with code 1:

| Event                | Span name                   | `error.type`              |
| -------------------- | --------------------------- | ------------------------- |
| `uncaughtException`  | `fatal-uncaught-exception`  | `err-uncaught-exception`  |
| `unhandledRejection` | `fatal-unhandled-rejection` | `err-unhandled-rejection` |

Both use `recordSpanError` (no `span.recordException`, matching the internal error path) and call `shutdownTelemetry().finally(() => process.exit(1))` so the buffered span is flushed before exit. Pre-boot env failures (`loadEnv` throwing at module scope in `bin/telemetry.ts`/`src/utils/logger.ts`) cannot reach these handlers; they fail to stderr only. See [Error Handling](./08-error-handling.md#pre-boot-env-failure).

## FilteringSpanProcessor (`src/utils/filtering-span-processor.ts`)

Tail-based sampling that decides after a span ends whether to export it:

| Rule                 | Condition                         | Action                 |
| -------------------- | --------------------------------- | ---------------------- |
| Unprocessed messages | `bot.message.processed === false` | Dropped entirely       |
| Errors               | Span status is ERROR              | Always exported (100%) |
| Success              | Everything else                   | Sampled at 1%          |

Sampling is deterministic per trace ID — the same trace always gets the same sampling decision across restarts.
