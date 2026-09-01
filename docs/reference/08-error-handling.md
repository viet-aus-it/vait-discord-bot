# Error Handling

Error handling APIs and conventions used in the VAIT Discord Bot.

## Result Types

The codebase uses [oxide.ts](https://www.npmjs.com/package/oxide.ts) `Ok` and `Err` types for explicit error handling.

```typescript
import { Ok, Err, type Result } from 'oxide.ts';
```

### Result API

| Method               | Description                          |
| -------------------- | ------------------------------------ |
| `Ok(value)`          | Create a success result              |
| `Err(error)`         | Create a failure result              |
| `result.isOk()`      | Returns `true` if the result is Ok   |
| `result.isErr()`     | Returns `true` if the result is Err  |
| `result.unwrap()`    | Extract the Ok value (throws if Err) |
| `result.unwrapErr()` | Extract the Err value (throws if Ok) |

### Example

```typescript
const fetchData = async (id: string): Promise<Result<Data, string>> => {
  const data = await db.query.data.findFirst({ where: { id } });
  if (!data) {
    return Err('Data not found');
  }
  return Ok(data);
};

const result = await fetchData('123');
if (result.isOk()) {
  const data = result.unwrap();
}
```

## Logger

Errors are logged via [Winston](https://www.npmjs.com/package/winston) using `src/utils/logger.ts`.

```typescript
import { logger } from '../../utils/logger';
```

### Log Methods

| Method                     | Level | Description                    |
| -------------------------- | ----- | ------------------------------ |
| `logger.debug(msg, meta?)` | debug | Detailed debugging information |
| `logger.info(msg, meta?)`  | info  | General operational events     |
| `logger.warn(msg, meta?)`  | warn  | Potential issues               |
| `logger.error(msg, meta?)` | error | Failures requiring attention   |

### Transports

| Environment | Transports                                                                        |
| ----------- | --------------------------------------------------------------------------------- |
| Development | Console with pretty-printing and colours                                          |
| Production  | Console + [Axiom](https://axiom.co/) (including exception and rejection handlers) |

## Span Error Recording

When a command handler catches an error internally (via `Result.safe`), it must record the error on the active OTel span so it appears in traces. Use `recordSpanError` from `src/utils/tracer.ts` before logging.

```typescript
import { recordSpanError } from '../../utils/tracer';

if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-command-action-failed');
  logger.error('[command]: Error message', op.unwrapErr());
  await interaction.reply('Something went wrong.');
  return;
}
```

Error slugs follow the pattern `err-<command>-<action>-failed` (e.g., `err-reminder-in-failed`, `err-referral-delete-failed`). See [Telemetry](./09-telemetry.md) for the full attribute reference.

### Business conditions are not errors

Conditions that look like failures but are normal user-facing outcomes must use `warn` or `info`, NOT `logger.error`, and must NOT create an error span. Examples: empty autobump list, duplicate referral code, server not configured, blank message to expand. Every `logger.error` in `src/`/`bin/` must sit next to a `recordSpanError` call (real failure); business conditions are the documented exception.

This follows the OpenTelemetry [recording errors](https://opentelemetry.io/docs/specs/semconv/general/recording-errors/) semantic convention: errors that are handled (allowing the operation to complete gracefully) are not recorded as error spans, and successful operations carry no `error.type` attribute. Only real failures set the span status to `Error` and `error.type`.

## Fatal Process Signals

Uncaught exceptions and unhandled rejections are recorded as fatal spans (`fatal-uncaught-exception`, `fatal-unhandled-rejection`) by handlers in `bin/main.ts`, then the process exits with code 1. See [Telemetry](./09-telemetry.md#fatal-process-signals).

## Pre-boot Env Failure

`loadEnv()` runs at module scope of `bin/telemetry.ts` and `src/utils/logger.ts` before the fatal handlers exist. If env validation fails there, the process dies during import and only the `console.error` in `src/utils/load-env.ts` reaches stderr. This is intentional and the only pre-boot mechanism: do not try to route it through `uncaughtException` handlers or OTel, they are not registered yet.

## Discord Error Replies

Ephemeral replies are visible only to the invoking user:

```typescript
await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
```

See [Bot Commands Design](../explanation/02-bot-commands-design.md) for the design rationale behind error handling choices.
