# Error Handling

Error handling APIs and conventions used in the VAIT Discord Bot.

## Result Types

The codebase uses [oxide.ts](https://www.npmjs.com/package/oxide.ts) `Ok` and `Err` types for explicit error handling.

```typescript
import { Ok, Err, type Result } from 'oxide.ts';
```

### Result API

| Method | Description |
|--------|-------------|
| `Ok(value)` | Create a success result |
| `Err(error)` | Create a failure result |
| `result.isOk()` | Returns `true` if the result is Ok |
| `result.isErr()` | Returns `true` if the result is Err |
| `result.unwrap()` | Extract the Ok value (throws if Err) |
| `result.unwrapErr()` | Extract the Err value (throws if Ok) |

### Example

```typescript
const fetchData = async (id: string): Promise<Result<Data, string>> => {
  const data = await db.data.findUnique({ where: { id } });
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

| Method | Level | Description |
|--------|-------|-------------|
| `logger.debug(msg, meta?)` | debug | Detailed debugging information |
| `logger.info(msg, meta?)` | info | General operational events |
| `logger.warn(msg, meta?)` | warn | Potential issues |
| `logger.error(msg, meta?)` | error | Failures requiring attention |

### Transports

| Environment | Transports |
|-------------|------------|
| Development | Console with pretty-printing and colours |
| Production (OTEL enabled) | Console + [OpenTelemetry log bridge](https://www.npmjs.com/package/@opentelemetry/winston-transport) to [Axiom](https://axiom.co/) (including exception and rejection handlers) |
| Production (OTEL disabled) | Console only |

## Discord Error Replies

Ephemeral replies are visible only to the invoking user:

```typescript
await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
```

See [Bot Commands Design](../explanation/02-bot-commands-design.md) for the design rationale behind error handling choices.
