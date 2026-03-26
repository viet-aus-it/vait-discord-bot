# Build a Scheduled Background Task

Create a standalone script that runs on a schedule, outside the main bot process, to perform maintenance or notifications.

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- Familiarity with [Database Schema](../../reference/04-database-schema.md)

## Step 1: Create the Script

Create `bin/cleanup-old-logs.ts`:

```typescript
import { Result } from 'oxide.ts';
import { getDbClient } from '../src/clients';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';

const cleanup = async () => {
  loadEnv();
  logger.info('[cleanup-old-logs]: Starting cleanup');

  const db = getDbClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await Result.safe(
    db.reputationLog.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    })
  );

  if (result.isErr()) {
    logger.error('[cleanup-old-logs]: Failed to clean up', { error: result.unwrapErr() });
    process.exit(1);
  }

  logger.info(`[cleanup-old-logs]: Removed ${result.unwrap().count} old logs`);
  process.exit(0);
};

cleanup();
```

Key parts:
- `loadEnv()` loads the `.env` file (the script runs standalone, not inside the bot)
- `process.exit(0)` on success, `process.exit(1)` on failure
- Wrap the operation in `Result.safe()` for error handling

See [Error Handling](../../reference/08-error-handling.md) for the Result type API reference.

## Step 2: Add a pnpm Script

Add to `package.json` under `"scripts"`:

```json
"cleanup:old-logs": "tsx bin/cleanup-old-logs.ts"
```

Run it manually to verify:

```bash
pnpm run cleanup:old-logs
```

You should see the log output: "Starting cleanup" followed by "Removed X old logs".

## Step 3: Script That Uses the Discord Client

For tasks that need to send messages (reminders, thread bumps), initialise the Discord client:

```typescript
import { getDiscordClient } from '../src/clients';
import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';

const notify = async () => {
  loadEnv();
  const token = process.env.TOKEN;
  const client = await getDiscordClient({ token });

  const channel = client.channels.cache.get('CHANNEL_ID');
  if (channel?.isTextBased()) {
    await channel.send('Scheduled notification!');
  }

  logger.info('[notify]: Done');
  process.exit(0);
};

notify();
```

## Step 4: Schedule It

These scripts are run by external schedulers, not by the bot process. Use cron, [GitHub Actions](https://docs.github.com/en/actions) scheduled workflows, or any task scheduler.

Example GitHub Actions cron workflow (`.github/workflows/cleanup.yml`):

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # daily at midnight
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm run cleanup:old-logs
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## What's Next

- [Permission-Based Access Control](./07-permission-based-access.md)
- The `bin/` directory has production examples: `autobump.ts`, `broadcast-reminder.ts`, `cleanup-expired-referrals.ts`
- [pnpm Scripts](../../reference/02-pnpm-scripts.md) for all available scripts
