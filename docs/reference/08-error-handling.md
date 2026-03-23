# Error Handling

Patterns and conventions for error handling in the VAIT Discord Bot.

## Result Types with oxide.ts

The codebase uses [oxide.ts](https://www.npmjs.com/package/oxide.ts) `Ok` and `Err` types instead of thrown exceptions for explicit, type-safe error handling.

### Basic Usage

```typescript
import { Ok, Err, type Result } from 'oxide.ts';

const fetchData = async (id: string): Promise<Result<Data, string>> => {
  const data = await db.data.findUnique({ where: { id } });
  if (!data) {
    return Err('Data not found');
  }
  return Ok(data);
};

// Consuming a Result
const result = await fetchData('123');
if (result.isOk()) {
  const data = result.unwrap();
  // use data
} else {
  const error = result.unwrapErr();
  // handle error
}
```

### When to Use Result Types

| Scenario | Approach |
|----------|----------|
| Database queries that may return nothing | `Ok(data)` / `Err('not found')` |
| Validation failures | `Err('validation message')` |
| External API failures | `Err('api error details')` |
| Unexpected errors (bugs) | Throw — these should crash and be logged |

### When to Throw Instead

- Programming errors that should never happen in correct code
- Unrecoverable failures where the bot cannot continue

## Logging

Errors are logged via [Winston](https://www.npmjs.com/package/winston) using `src/utils/logger.ts`.

```typescript
import { logger } from '../../utils/logger';

logger.error('Failed to fetch user', { userId, error });
logger.warn('Rate limit approaching', { remaining });
logger.info('Command executed', { command: '8ball' });
logger.debug('Query result', { data });
```

### Log Levels

| Level | Environment | Description |
|-------|-------------|-------------|
| `debug` | Development | Detailed debugging information |
| `info` | Development, Production | General operational events |
| `warn` | Development, Production | Potential issues to investigate |
| `error` | Development, Production | Failures requiring attention |

### Transports

- **Development:** Console output with pretty-printing and colours
- **Production:** Console output + [Axiom](https://axiom.co/) for centralised log aggregation (including exception and rejection handlers)

## Discord Error Responses

User-facing errors should be sent as ephemeral replies (only visible to the user):

```typescript
await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
```

Guidelines:
- Be friendly and guide users to correct usage
- Do not expose internal error details to users
- Log the full error server-side for debugging
