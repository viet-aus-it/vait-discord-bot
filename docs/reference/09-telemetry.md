# Telemetry

Reference for the bot's [OpenTelemetry](https://opentelemetry.io/) (OTel) instrumentation. See [Why OpenTelemetry](../explanation/01-architecture.md#why-opentelemetry) for the design rationale.

## Tracer Utilities (`src/utils/tracer.ts`)

| Export | Description |
|--------|-------------|
| `tracer` | The OTel tracer instance, used to create spans via `tracer.startActiveSpan()` |
| `recordSpanError(error, slug)` | Records an error on the active span: sets status to ERROR, records the exception, and sets `error.type` to the given slug. No-op when OTel is disabled. |

## Span Lifecycle

- Every span opened with `tracer.startActiveSpan()` **must** be ended gracefully via `span.end()`. If the code is wrapped in a `try/catch` block, there must be a `span.end()` in the `finally` to handle that.
- Calling `process.exit()` in a script before `span.end()` will drop the span — it will never be exported.
- In production, background tasks use `BatchSpanProcessor`, which buffers spans and flushes on shutdown. The SIGTERM handler in `bin/telemetry.ts` handles graceful flush.

```typescript
return tracer.startActiveSpan('operationName', async (span) => {
  try {
    // ... task logic
  } catch (error) {
    recordSpanError(error, 'err-operation-failed');
    throw error;
  } finally {
    span.end();
  }
});
```

## Attribute Namespaces

Prefer constants from [`@opentelemetry/semantic-conventions`](https://opentelemetry.io/docs/specs/semconv/) when the attribute matches an existing convention. For custom attributes:

| Namespace | Usage | Examples |
|-----------|-------|---------|
| OTel standard | Attributes defined in the [OTel Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) | `enduser.id`, `error.type` |
| `discord.*` | Data received from the Discord API | `discord.guild.id`, `discord.channel.id`, `discord.message.id`, `discord.interaction.type` |
| `bot.*` | Bot-specific logic and state | `bot.command.name`, `bot.message.processed`, `bot.message.honeypot`, `bot.rep.*`, `bot.reminder.*` |

## FilteringSpanProcessor (`src/utils/filtering-span-processor.ts`)

Tail-based sampling that decides after a span ends whether to export it:

| Rule | Condition | Action |
|------|-----------|--------|
| Unprocessed messages | `bot.message.processed === false` | Dropped entirely |
| Errors | Span status is ERROR | Always exported (100%) |
| Success | Everything else | Sampled at 1% |

Sampling is deterministic per trace ID — the same trace always gets the same sampling decision across restarts.
