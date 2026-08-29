# Error-Trigger Research — Site Inventory

Raw findings for [`plan.md`](./plan.md). Every error-signaling site, grouped by signal type, verbatim call-site excerpts — readable without opening repo.

Line numbers current working tree (verified by re-reading each file).

**Conventions:**

- **OTel span error** = `recordSpanError(error, slug)` → active span `status=ERROR` + `error.type` slug. Single choke `src/utils/tracer.ts:6`. Guaranteed 100% export via `FilteringSpanProcessor` (`src/utils/filtering-span-processor.ts:58`).
- **Log error** = `logger.error` / `console.error` → winston record (→ OTel logs prod via `instrumentation-winston`, or direct Axiom transport OTel off).
- **OTel on/off**: `bin/telemetry.ts:18` boots SDK only `env.ENABLE_OTEL` (default `false`, `src/utils/load-env.ts:19`). Real prod sets in deployment env (outside repo — committed `.env.production` only local docker-reproduction copy).

### Two choke points (verbatim)

`src/utils/tracer.ts:6-12` — every OTel error signal:

```ts
export function recordSpanError(error: unknown, slug: string): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
  span.recordException(error instanceof Error ? error : new Error(String(error)));
  span.setAttribute(ATTR_ERROR_TYPE, slug);
}
```

`src/utils/filtering-span-processor.ts:51-65` — error spans always exported, rest sampled 1%:

```ts
private shouldExport(span: ReadableSpan): boolean {
  // Rule 1: Drop unprocessed messages entirely
  if (span.attributes['bot.message.processed'] === false) return false;
  // Rule 2: Always keep error spans (100%)
  if (span.status.code === SpanStatusCode.ERROR) return true;
  // Rule 3: Sample success spans at successRate
  const ratio = this.traceIdToRatio(span.spanContext().traceId);
  return ratio < this.successRate;
}
```

**Trigger implication:** site calls `recordSpanError` → triggerable on `error.type=<slug>` 100% fidelity. Site only `logger.error` (§4.2 gap) → log record, no error span — invisible to span triggers.

---

## 1. Error logged as warning

**Zero** error objects at `warn`. Only `warn` in repo:

| Location             | What                                    |
| -------------------- | --------------------------------------- |
| `bin/autobump.ts:23` | No existing bot message found in thread |

`bin/autobump.ts:22-26`:

```ts
if (botMessages.size === 0) {
  logger.warn(`[autobump]: No existing bot message found in thread ${thread.id}`);
} else {
  await Promise.all(botMessages.map((m) => m.delete()));
}
```

## 2. Explicit fatal error

**Zero** `.fatal(` calls. Near-fatal / unguarded sites:

| Location                                                                                             | Signal                                            | Catchable by OTel?                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/logger.ts:40-41`                                                                          | winston `exceptionHandlers` + `rejectionHandlers` | **Only when OTel OFF.** Wired to Axiom transport only in non-OTel branch. OTel ON (prod) → neither handler exists → `unhandledRejection` / `uncaughtException` **export nothing**. |
| `src/utils/load-env.ts:62`                                                                           | `console.error` on env load failure → throws      | Logged before logger/OTel exist. Invisible in prod.                                                                                                                                |
| `bin/telemetry.ts:97`                                                                                | `console.error` on SDK shutdown (SIGTERM)         | Pre-shutdown, effectively lost.                                                                                                                                                    |
| `scripts/deploy-guild-commands.ts:31`, `delete-guild-commands.ts:28`, `delete-global-commands.ts:23` | `logger.error` + `process.exit(1)`                | OTel boots via `--import` (`package.json:32-34`), log record exports if lands before exit — but manual ops, accepted un-triggered.                                                 |
| `bin/main.ts:43-44`                                                                                  | `process.exit(1)`                                 | Error already logged before exit (`main.ts:22-23`, `:50-51`).                                                                                                                      |

`src/utils/logger.ts:21-43` — fatal handlers exist **only** OTel-off branch:

```ts
if (env.ENABLE_OTEL) {
  return {
    level: 'info',
    defaultMeta: { service: 'vait-chatbot' },
    transports: [consoleTransport],
    format: prodFormat,
  };
}

const axiomTransport = new AxiomTransport({ dataset, token, orgId });

return {
  level: 'info',
  defaultMeta: { service: 'vait-chatbot' },
  transports: [consoleTransport, axiomTransport],
  exceptionHandlers: [axiomTransport],
  rejectionHandlers: [axiomTransport],
  format: prodFormat,
};
```

`src/utils/load-env.ts:59-65`:

```ts
const validatedEnv = ConfigSchema.safeParse(process.env);
if (!validatedEnv.success) {
  console.error(`Error loading environment details. ${validatedEnv.error.message}`);
  throw new Error('INVALID CONFIG!', { cause: validatedEnv.error.issues });
}
return validatedEnv.data;
```

`bin/telemetry.ts:88-98`:

```ts
process.on('SIGTERM', () => {
  traceExporter.forceFlush();
  traceExporter.shutdown();
  logExporter.forceFlush();
  logExporter.shutdown();
  sdk!
    .shutdown()
    .then(() => console.log('Telemetry SDK shut down gracefully'))
    .catch((error) => console.error('Error shutting down telemetry SDK', error));
});
```

`bin/main.ts:43-44`:

```ts
if (result.isOk() && result.unwrap() === 1) process.exit(1);
if (result.isErr()) process.exit(1);
```

`scripts/deploy-guild-commands.ts:25-31` (canonical; two `delete-*` scripts mirror exactly):

```ts
if (op.isOk()) {
  logger.info('[deploy-guild-commands]: Guild commands deployed successfully');
  process.exit(0);
}
logger.error(`[deploy-guild-commands]: Cannot deploy guild commands.`, op.unwrapErr());
process.exit(1);
```

---

## 3. `recordSpanError` (OTel recordException) — 34 sites

All through single choke point, deterministic slugs.

### 3.1 Processors (6)

| Location                                | Slug                             |
| --------------------------------------- | -------------------------------- |
| `src/utils/interaction-processor.ts:28` | `err-command-<name>-failed`      |
| `src/utils/interaction-processor.ts:50` | `err-contextmenu-<name>-failed`  |
| `src/utils/interaction-processor.ts:72` | `err-autocomplete-<name>-failed` |
| `src/utils/message-processor.ts:66`     | `err-honeypot-trigger-failed`    |
| `src/utils/message-processor.ts:81`     | `err-keyword-processing-failed`  |
| `src/utils/honeypot-handler.ts:65`      | `err-honeypot-ban-failed`        |

`interaction-processor.ts:26-31` (dynamic slugs; pattern repeats `:48-52`, `:70-74`):

```ts
const op = await Result.safe(command.execute(interaction));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), `err-command-${commandName}-failed`);
  logger.error(`[process-interaction]: ERROR HANDLING COMMAND: ${commandName}`, op.unwrapErr());
  return;
}
```

`message-processor.ts:64-68`:

```ts
const result = await Result.safe(handleHoneypotTrigger(message));
if (result.isErr()) {
  recordSpanError(result.unwrapErr(), 'err-honeypot-trigger-failed');
  logger.error('[honeypot]: Error processing honeypot trigger', result.unwrapErr());
}
```

`message-processor.ts:79-83`:

```ts
const keywordResult = await Result.safe(Promise.all(matches.map((m) => m.promise)));
if (keywordResult.isErr()) {
  recordSpanError(keywordResult.unwrapErr(), 'err-keyword-processing-failed');
  logger.error('ERROR PROCESSING MESSAGE', keywordResult.unwrapErr());
}
```

`honeypot-handler.ts:49-67`:

```ts
const result = await Result.safe(guild.members.ban(author.id, { deleteMessageSeconds: BAN_DELETE_WINDOW_SECONDS, reason: 'autoban - spambot' }));

setSpanAttributes({
  'bot.honeypot.user_id': author.id,
  'bot.honeypot.ban_success': result.isOk(),
  'bot.honeypot.timestamp': Date.now(),
});

if (result.isOk()) {
  logger.info(`[honeypot]: Banned ${author.username} from guild ${guild.name}`);
} else {
  recordSpanError(result.unwrapErr(), 'err-honeypot-ban-failed');
  logger.error(`[honeypot]: Failed to ban ${author.username}`, result.unwrapErr());
}
```

### 3.2 Bin jobs (6)

| Location                              | Slug                                  |
| ------------------------------------- | ------------------------------------- |
| `bin/main.ts:22`                      | `err-deploy-commands-failed`          |
| `bin/main.ts:50`                      | `err-load-honeypots-failed`           |
| `bin/cleanup-expired-referrals.ts:12` | `err-cleanup-referrals-failed`        |
| `bin/build-referral-list.ts:58`       | `err-build-referral-list-failed`      |
| `bin/broadcast-reminder.ts:20`        | `err-broadcast-reminder-query-failed` |
| `bin/autobump.ts:42`                  | `err-autobump-list-failed`            |

`bin/main.ts:20-25` (deploy):

```ts
const op = await Result.safe(deployGlobalCommands(commands, { token, clientId }));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-deploy-commands-failed');
  logger.error('[deploy-commands]: Cannot deploy global commands', op.unwrapErr());
  return 1;
}
```

`bin/main.ts:48-53` (honeypot load):

```ts
const op = await Result.safe(loadHoneypotChannels());
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-load-honeypots-failed');
  logger.error('[honeypot]: Failed to load honeypot channels', op.unwrapErr());
  return;
}
```

`bin/cleanup-expired-referrals.ts:10-15`:

```ts
const op = await Result.safe(cleanupExpiredCode());
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-cleanup-referrals-failed');
  logger.error('[cleanup-expired-referrals]: Error cleaning up expired referrals', op.unwrapErr());
  return 1;
}
```

`bin/build-referral-list.ts:53-62`:

```ts
const op = await Result.safe(handleBuild());
if (op.isOk()) {
  span.setAttribute('bot.referral.count', op.unwrap());
} else {
  recordSpanError(op.unwrapErr(), 'err-build-referral-list-failed');
  logger.error('[build-referral-list]: Error building Ozbargain referral list', op.unwrapErr());
}
```

`bin/broadcast-reminder.ts:18-23`:

```ts
const reminders = await Result.safe(getReminderByTime(getCurrentUnixTime()));
if (reminders.isErr()) {
  recordSpanError(reminders.unwrapErr(), 'err-broadcast-reminder-query-failed');
  logger.error(`[broadcast-reminder]: Cannot retrieve reminders. Query Time: ${queryTime}`, reminders.unwrapErr());
  return 1;
}
```

`bin/autobump.ts:40-45` (top-level list fetch):

```ts
const settings = await Result.safe(listAllThreads());
if (settings.isErr()) {
  recordSpanError(settings.unwrapErr(), 'err-autobump-list-failed');
  logger.error('[autobump]: Cannot retrieve autobump thread lists', settings.unwrapErr());
  return 1;
}
```

### 3.3 Slash commands (22)

| Location                                                        | Slug                                     |
| --------------------------------------------------------------- | ---------------------------------------- |
| `src/slash-commands/weather/index.ts:31`                        | `err-weather-fetch-failed`               |
| `src/slash-commands/quote-of-the-day/index.ts:18`               | `err-quote-fetch-failed`                 |
| `src/slash-commands/autobump-threads/add-thread.ts:29`          | `err-autobump-add-failed`                |
| `src/slash-commands/autobump-threads/remove-thread.ts:22`       | `err-autobump-remove-failed`             |
| `src/slash-commands/autobump-threads/list-threads.ts:24`        | `err-autobump-list-failed`               |
| `src/slash-commands/server-settings/set-reminder-channel.ts:20` | `err-settings-reminder-save-failed`      |
| `src/slash-commands/server-settings/set-honeypot-channel.ts:21` | `err-settings-honeypot-save-failed`      |
| `src/slash-commands/server-settings/set-aoc-settings.ts:23`     | `err-settings-aoc-save-failed`           |
| `src/slash-commands/aoc-leaderboard/index.ts:63`                | `err-aoc-saved-leaderboard-fetch-failed` |
| `src/slash-commands/aoc-leaderboard/index.ts:82`                | `err-aoc-settings-fetch-failed`          |
| `src/slash-commands/aoc-leaderboard/index.ts:100`               | `err-aoc-leaderboard-fetch-failed`       |
| `src/slash-commands/reminder/list.ts:24`                        | `err-reminder-list-failed`               |
| `src/slash-commands/reminder/remind-duration.ts:39`             | `err-reminder-in-failed`                 |
| `src/slash-commands/reminder/update.ts:39`                      | `err-reminder-update-failed`             |
| `src/slash-commands/reminder/remove.ts:28`                      | `err-reminder-delete-failed`             |
| `src/slash-commands/reminder/remind-on-date.ts:32`              | `err-reminder-on-failed`                 |
| `src/slash-commands/referral/referral-new.ts:69`                | `err-referral-new-search-failed`         |
| `src/slash-commands/referral/referral-new.ts:84`                | `err-referral-new-create-failed`         |
| `src/slash-commands/referral/referral-delete.ts:33`             | `err-referral-delete-failed`             |
| `src/slash-commands/referral/referral-list.ts:41`               | `err-referral-list-failed`               |
| `src/slash-commands/referral/referral-random.ts:25`             | `err-referral-random-failed`             |
| `src/slash-commands/referral/referral-update.ts:65`             | `err-referral-update-failed`             |

Call-site excerpts:

`weather/index.ts:28-35`:

```ts
const weatherData = await Result.safe(fetchWeather(location));
setSpanAttributes({ 'bot.weather.location': location, 'bot.weather.success': weatherData.isOk() });
if (weatherData.isErr()) {
  recordSpanError(weatherData.unwrapErr(), 'err-weather-fetch-failed');
  logger.info('[weather]: Error getting weather data', weatherData.unwrapErr());
  await interaction.editReply('Error getting weather data for location.');
  return;
}
```

`quote-of-the-day/index.ts:15-22`:

```ts
const quote = await Result.safe(fetchQuote());
setSpanAttributes({ 'bot.quote.success': quote.isOk() });
if (quote.isErr()) {
  recordSpanError(quote.unwrapErr(), 'err-quote-fetch-failed');
  logger.info('[quote-of-the-day]: Error getting quotes', quote.unwrapErr());
  await interaction.editReply('Error getting quotes');
  return;
}
```

`autobump-threads/add-thread.ts:27-33`:

```ts
const op = await Result.safe(addAutobumpThread(guildId, thread.id));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-autobump-add-failed');
  logger.error(`[add-autobump-thread]: Cannot save thread ${thread.id} to be autobumped for guild ${guildId}`, op.unwrapErr());
  await interaction.reply('ERROR: Cannot save this thread to be autobumped for this server. Please try again.');
  return;
}
```

`autobump-threads/remove-thread.ts:20-26`:

```ts
const op = await Result.safe(removeAutobumpThread(guildId, thread.id));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-autobump-remove-failed');
  logger.error(`[remove-autobump-thread]: Cannot remove thread ${thread.id} from autobump list for guild ${guildId}`, op.unwrapErr());
  await interaction.reply(`ERROR: Cannot remove thread id <#${thread.id}> from the bump list for this server. Please try again.`);
  return;
}
```

`autobump-threads/list-threads.ts:23-28`:

```ts
if (threads.isErr()) {
  recordSpanError(threads.unwrapErr(), 'err-autobump-list-failed');
  logger.error(`[list-autobump-threads]: Cannot get list of threads from the database for guild ${guildId}`, threads.unwrapErr());
  await interaction.reply("ERROR: Cannot get list of threads from the database, maybe the server threads aren't setup yet?");
  return;
}
```

`server-settings/set-reminder-channel.ts:18-24`:

```ts
const op = await Result.safe(setReminderChannel(guildId, channel.id));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-settings-reminder-save-failed');
  logger.error(`[set-reminder-channel]: ${interaction.member!.user.username} failed to set reminder channel to ${channel.name}`, op.unwrapErr());
  await interaction.reply('Cannot save this reminder channel for this server. Please try again.');
  return;
}
```

`server-settings/set-honeypot-channel.ts:19-25` (same shape, slug `err-settings-honeypot-save-failed`):

```ts
const op = await Result.safe(setHoneypotChannel(guildId, channel.id));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-settings-honeypot-save-failed');
  logger.error(`[set-honeypot-channel]: ${interaction.member!.user.username} failed to set honeypot channel to ${channel.name}`, op.unwrapErr());
  await interaction.reply('Cannot save this honeypot channel for this server. Please try again.');
  return;
}
```

`server-settings/set-aoc-settings.ts:21-27` — **span-only**: records span error, logs `info`, not `error`:

```ts
const op = await Result.safe(setAocSettings(guildId, key, leaderboardId));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-settings-aoc-save-failed');
  logger.info(`[set-aoc-key]: ${interaction.member!.user.username} failed to set AOC Key. Error: ${op.unwrapErr()}`);
  await interaction.reply(`Cannot set this AOC key. Please try again. Error: ${op.unwrapErr()}`);
  return;
}
```

`aoc-leaderboard/index.ts:61-67`:

```ts
const getSavedleaderboardOp = await Result.safe(getSavedLeaderboard(guildId));
if (getSavedleaderboardOp.isErr()) {
  recordSpanError(getSavedleaderboardOp.unwrapErr(), 'err-aoc-saved-leaderboard-fetch-failed');
  logger.error('[get-aoc-leaderboard]: Error connecting to the database', getSavedleaderboardOp.unwrapErr());
  await interaction.editReply('ERROR: Error connecting to the database');
  return;
}
```

`aoc-leaderboard/index.ts:80-87`:

```ts
const settingsOp = await Result.safe(getAocSettings(guildId));
if (settingsOp.isErr()) {
  recordSpanError(settingsOp.unwrapErr(), 'err-aoc-settings-fetch-failed');
  const errorMessage = 'Error getting AOC settings';
  logger.error(`[get-aoc-leaderboard]: : ${errorMessage}`, settingsOp.unwrapErr());
  await interaction.editReply(`ERROR: ${errorMessage}`);
  return;
}
```

`aoc-leaderboard/index.ts:98-105`:

```ts
const fetchAndSaveOp = await Result.safe(fetchAndSaveLeaderboard(year, settings));
if (fetchAndSaveOp.isErr()) {
  recordSpanError(fetchAndSaveOp.unwrapErr(), 'err-aoc-leaderboard-fetch-failed');
  const errorMessage = `Error fetching and/or saving new leaderboard result`;
  logger.error(`[get-aoc-leaderboard]: ${errorMessage}`, fetchAndSaveOp.unwrapErr());
  await interaction.editReply(`ERROR: ${errorMessage}`);
  return;
}
```

`reminder/list.ts:22-28`:

```ts
const op = await Result.safe(getUserReminders(user.id, guildId));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-reminder-list-failed');
  logger.error('[reminder-list]: Error while retrieving reminders', op.unwrapErr());
  await interaction.reply('There is some error retrieving your reminders. Please try again later.');
  return;
}
```

`reminder/remind-duration.ts:38-43`:

```ts
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-reminder-in-failed');
  logger.error('[reminder-in]: Error while saving reminder', op.unwrapErr());
  await interaction.reply(`Cannot save reminder for <@${user.id}>. Please try again later.`);
  return;
}
```

`reminder/update.ts:38-43`, `reminder/remove.ts:27-32`, `reminder/remind-on-date.ts:31-36` — identical triple: `recordSpanError(..., 'err-reminder-{update,delete,on}-failed')`, `logger.error('[reminder-{update,delete,on}]: ...', err)`, friendly reply. Representative (`update.ts`):

```ts
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-reminder-update-failed');
  logger.error('[reminder-update]: Error while updating reminder', op.unwrapErr());
  await interaction.reply(`Cannot update reminder for <@${user.id}> and reminder id ${reminderId}. Please try again later.`);
  return;
}
```

`referral/referral-new.ts:67-73` (first of two sites in same handler):

```ts
const findOp = await Result.safe(findExistingReferralCode({ userId, guildId, service }));
if (findOp.isErr()) {
  recordSpanError(findOp.unwrapErr(), 'err-referral-new-search-failed');
  logger.error('[referral-new]: Error while searching for referral code', findOp.unwrapErr());
  await interaction.reply('This might be an error with the database. Please try again later.');
  return;
}
```

`referral/referral-new.ts:82-88` (second site):

```ts
const createOp = await Result.safe(createReferralCode({ userId, guildId, service, code, expiryDate }));
if (createOp.isErr()) {
  recordSpanError(createOp.unwrapErr(), 'err-referral-new-create-failed');
  logger.error('[referral-new]: Error while creating referral code', createOp.unwrapErr());
  await interaction.reply('Failed to add referral code. This might be an error with the database. Please try again later.');
  return;
}
```

`referral/referral-delete.ts:32-37`, `referral/referral-list.ts:40-45`, `referral/referral-random.ts:24-29`, `referral/referral-update.ts:64-69` — same combination shape (slugs `err-referral-{delete,list,random,update}-failed`), each `logger.error('[...]: ...', err)` + friendly reply. Representative (`referral-random.ts`):

```ts
const op = await Result.safe(getAllReferralCodesForService({ guildId, service }));
if (op.isErr()) {
  recordSpanError(op.unwrapErr(), 'err-referral-random-failed');
  logger.error(`[referral-random]: Error getting referral codes for ${service} service`, op.unwrapErr());
  await interaction.reply(`Error getting referral codes for ${service} service. Please try again later.`);
  return;
}
```

---

## 4. Combinations

| Combination                          | Count | Sites                                                                                           |
| ------------------------------------ | ----- | ----------------------------------------------------------------------------------------------- |
| `recordSpanError` + `logger.error`   | 31    | All §3 except 3 span-only below                                                                 |
| `recordSpanError` only (no log)      | 3     | `weather/index.ts:31`, `quote-of-the-day/index.ts:18`, `server-settings/set-aoc-settings.ts:23` |
| `logger.error` only (no OTel signal) | 13    | §4.2                                                                                            |

### 4.1 The 3 span-only sites (no log line)

`weather/index.ts:31-32` — span error, log `info` (log-severity trigger misses):

```ts
if (weatherData.isErr()) {
  recordSpanError(weatherData.unwrapErr(), 'err-weather-fetch-failed');
  logger.info('[weather]: Error getting weather data', weatherData.unwrapErr());
```

`quote-of-the-day/index.ts:18-19` — same, `err-quote-fetch-failed` at `info`.

`server-settings/set-aoc-settings.ts:23-24` — `err-settings-aoc-save-failed` at `info` (shown §3.3).

### 4.2 The log-only gap (13 sites) — invisible to span-status triggers

Never mark active span ERROR → no error span exported (may ride 1%-sampled success span or nothing):

| Location                                                 | What                                                                     | Category                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `bin/autobump.ts:35`                                     | Per-thread bump failure (err obj)                                        | Real error — **also `:74` returns `success: true` even on failure** |
| `src/slash-commands/all-cap/index.ts:39`                 | Blank/fetch-failure combined branch (err obj)                            | Real error — **latent `unwrapErr()` on OK-blank result**            |
| `src/slash-commands/mock-someone/index.ts:50`            | Blank message (no err obj) — fetch-failure at `:43` mis-logged as `info` | Level inversion                                                     |
| `src/slash-commands/aoc-leaderboard/client.ts:20`        | Leaderboard format parse error (err obj), **re-thrown**                  | Real error — re-caught upstream at `index.ts:100` (double signal)   |
| `src/slash-commands/aoc-leaderboard/utils.ts:39`         | Missing key/id config → `logger.error` **then throws**                   | Business condition — re-caught upstream at `index.ts:100`           |
| `src/slash-commands/aoc-leaderboard/index.ts:92`         | Settings not configured (string only)                                    | Business condition                                                  |
| `src/slash-commands/autobump-threads/add-thread.ts:21`   | "Not a thread" (string only)                                             | Business condition                                                  |
| `src/slash-commands/autobump-threads/list-threads.ts:33` | "No threads setup" (string only)                                         | Business condition — expected state                                 |
| `src/slash-commands/referral/referral-new.ts:77`         | "Code already exists" (string only)                                      | Business condition — expected                                       |
| `scripts/deploy-guild-commands.ts:30`                    | Deploy failure (err obj) + `process.exit(1)`                             | Real error — manual op, accepted un-triggered                       |
| `scripts/delete-guild-commands.ts:27`                    | Delete failure (err obj) + `process.exit(1)`                             | Real error — manual op, accepted un-triggered                       |
| `scripts/delete-global-commands.ts:22`                   | Delete failure (err obj) + `process.exit(1)`                             | Real error — manual op, accepted un-triggered                       |
| `bin/telemetry.ts:97`                                    | SDK shutdown `console.error`                                             | Real error — pre-shutdown, effectively lost                         |

Excerpts:

`bin/autobump.ts:32-37` + `:71-77` — gap + success-flag bug hiding it:

```ts
const bumpThread = async (thread: ThreadChannel, clientId?: string) => {
  const op = await Result.safe(performBump(thread, clientId));
  if (op.isErr()) {
    logger.error(`[autobump]: Failed to bump thread ${thread.id}`, op.unwrapErr());
  }
};
// ...
const bumpPromises = autobumpThreads.map(async (id) => {
  const thread = (await guild.channels.fetch(id)) as ThreadChannel;
  await bumpThread(thread, clientId);
  return { threadId: id, success: true }; // ← always true, even when bumpThread logged a failure
});
```

`all-cap/index.ts:35-42` — combined guard → `unwrapErr()` runs on possibly-`Ok` result; span never marked:

```ts
const fetchedMessage = await Result.safe(fetchLastMessageBeforeId(interaction.channel as TextChannel, interaction.id));

// If it's still blank at this point, then exit
if (fetchedMessage.isErr() || isBlank(fetchedMessage.unwrap().content)) {
  logger.error('[allcap]: Cannot fetch message to allcap', fetchedMessage.unwrapErr());
  await interaction.reply('Cannot fetch latest message. Please try again later.');
  return;
}
```

`mock-someone/index.ts:42-53` — levels inverted vs all-cap: fetch failure `info`, blank content `error`:

```ts
if (fetchedMessage.isErr()) {
  logger.info('[mock]: Cannot fetch latest message.');
  await interaction.reply('Cannot fetch latest message. Please try again later.');
  return;
}
const { content } = fetchedMessage.unwrap();
if (isBlank(content)) {
  logger.error('[mock]: Cannot fetch message to mock');
  await interaction.reply('Cannot fetch latest message. Please try again later.');
  return;
}
```

`aoc-leaderboard/client.ts:18-22` — logs then throws; throw what upstream `index.ts:98-100` records as `err-aoc-leaderboard-fetch-failed`:

```ts
const parsedResult = AocLeaderboard.safeParse(result);
if (!parsedResult.success) {
  logger.error('ERROR: Cannot get leaderboard format.', parsedResult.error);
  throw new Error(parsedResult.error.stack);
}
```

`aoc-leaderboard/utils.ts:36-41` — business condition at `error`, then throw → caught upstream:

```ts
if (!aocKey || !aocLeaderboardId) {
  const errorMessage = 'Cannot fetch leaderboard without key and leaderboard id';
  logger.error(`[fetch-and-save-leaderboard]: ${errorMessage}!`);
  throw new Error(errorMessage);
}
```

`aoc-leaderboard/index.ts:90-95` — settings not configured, string-only, no err object:

```ts
if (!settings || !settings.aocKey || !settings.aocLeaderboardId) {
  const errorMessage = 'Server is not configured to get AOC results! Missing Key and/or Leaderboard ID.';
  logger.error(`[get-aoc-leaderboard]: ${errorMessage}`);
  await interaction.editReply(`ERROR: ${errorMessage}`);
  return;
}
```

`autobump-threads/add-thread.ts:20-24` — user input validation as `error`:

```ts
if (!isThread) {
  logger.error(`[add-autobump-thread]: The channel ${thread.id} of ${guildId} is not a thread.`);
  await interaction.reply(`ERROR: The channel <#${thread.id}> is not a thread.`);
  return;
}
```

`autobump-threads/list-threads.ts:32-36` — fully expected state as `error`:

```ts
if (data.length === 0) {
  logger.error(`[list-autobump-threads]: No threads have been setup for autobumping in guild ${guildId}`);
  await interaction.reply('ERROR: No threads have been setup for autobumping in this server');
  return;
}
```

`referral/referral-new.ts:76-80` — expected duplicate state as `error`:

```ts
const existingReferralCode = findOp.unwrap();
if (existingReferralCode) {
  logger.error(`[referral-new]: Referral code for ${service} by ${nickname} already exists.`);
  await interaction.reply(`You have already entered the referral code for ${service}.`);
  return;
}
```

`scripts/deploy-guild-commands.ts:30` (mirror in two `delete-*` scripts) — shown §2.

`bin/telemetry.ts:97` — shown §2.

### 4.3 Business conditions logged at ERROR → fire on any log-severity trigger

| Site                                  | Level now | Should be | Why                                            |
| ------------------------------------- | --------- | --------- | ---------------------------------------------- |
| `aoc-leaderboard/index.ts:92`         | `error`   | `warn`    | Server not configured — operator action needed |
| `aoc-leaderboard/utils.ts:39`         | `error`   | `warn`    | Same condition, plus throw (still span-caught) |
| `autobump-threads/add-thread.ts:21`   | `error`   | `warn`    | User input validation                          |
| `autobump-threads/list-threads.ts:33` | `error`   | `info`    | Fully expected empty state                     |
| `referral/referral-new.ts:77`         | `error`   | `warn`    | Expected duplicate                             |
| `mock-someone/index.ts:50`            | `error`   | `warn`    | Blank content                                  |

## Notes

- No `err-*` slug collision: 34 all unique except two dynamic processor families suffix `-failed` (unique by interpolation).
- Log-severity (`severity_text = ERROR`) trigger clean ONLY after §4.3 reclassification — these sites otherwise page on normal activity.
