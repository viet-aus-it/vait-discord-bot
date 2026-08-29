# Error-Trigger Research — Site Inventory

Raw findings behind [`plan.md`](./plan.md). Every error-signaling site in the repo, grouped by how it signals.

**Conventions:**

- **OTel span error** = `recordSpanError(error, slug)` → active span `status=ERROR` + `error.type` slug. Single choke point `src/utils/tracer.ts:6`. Guaranteed export (100%) via `FilteringSpanProcessor` (`src/utils/filtering-span-processor.ts:58`).
- **Log error** = `logger.error` / `console.error` → winston record (→ OTel logs in prod via `instrumentation-winston`, or direct Axiom transport when OTel off).

## 1. Error logged as a warning

**Zero** error objects logged at `warn`. Only `warn` in the whole repo:

| Location             | What                                    |
| -------------------- | --------------------------------------- |
| `bin/autobump.ts:23` | No existing bot message found in thread |

## 2. Explicit fatal error

**Zero** `.fatal(` calls. Near-fatal / unguarded sites:

| Location                                                                                                             | Signal                                            | Catchable by OTel?                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/logger.ts:40-41`                                                                                          | winston `exceptionHandlers` + `rejectionHandlers` | **Only when OTel OFF.** Wired to Axiom transport only in the non-OTel branch. With OTel ON (prod default) neither handler exists → `unhandledRejection`/`uncaughtException` **export nothing**. |
| `src/utils/load-env.ts:62`                                                                                           | `console.error` on env load failure → throws      | Logged before logger/OTel exist. Invisible in prod.                                                                                                                                             |
| `bin/telemetry.ts:97`                                                                                                | `console.error` on SDK shutdown (SIGTERM)         | Pre-shutdown, effectively lost.                                                                                                                                                                 |
| `scripts/deploy-guild-commands.ts:31`, `scripts/delete-guild-commands.ts:28`, `scripts/delete-global-commands.ts:23` | `process.exit(1)`                                 | **OTel never starts in `scripts/`** — log-only.                                                                                                                                                 |
| `bin/main.ts:43-44`                                                                                                  | `process.exit(1)`                                 | Error already logged before exit (`main.ts:23`, `:51`).                                                                                                                                         |

## 3. `recordSpanError` (OTel recordException) — 34 sites

All through the single choke point with deterministic slugs.

### Processors (6)

| Location                                | Slug                             |
| --------------------------------------- | -------------------------------- |
| `src/utils/interaction-processor.ts:28` | `err-command-<name>-failed`      |
| `src/utils/interaction-processor.ts:50` | `err-contextmenu-<name>-failed`  |
| `src/utils/interaction-processor.ts:72` | `err-autocomplete-<name>-failed` |
| `src/utils/message-processor.ts:66`     | `err-honeypot-trigger-failed`    |
| `src/utils/message-processor.ts:81`     | `err-keyword-processing-failed`  |
| `src/utils/honeypot-handler.ts:65`      | `err-honeypot-ban-failed`        |

### Bin jobs (6)

| Location                              | Slug                                  |
| ------------------------------------- | ------------------------------------- |
| `bin/main.ts:22`                      | `err-deploy-commands-failed`          |
| `bin/main.ts:50`                      | `err-load-honeypots-failed`           |
| `bin/cleanup-expired-referrals.ts:12` | `err-cleanup-referrals-failed`        |
| `bin/build-referral-list.ts:58`       | `err-build-referral-list-failed`      |
| `bin/broadcast-reminder.ts:20`        | `err-broadcast-reminder-query-failed` |
| `bin/autobump.ts:42`                  | `err-autobump-list-failed`            |

### Slash commands (22)

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

## 4. Combinations

| Combination                               | Count | Sites                                                                                           |
| ----------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `recordSpanError` + `logger.error` (both) | 31    | All §3 except the 3 span-only below                                                             |
| `recordSpanError` only (no log)           | 3     | `weather/index.ts:31`, `quote-of-the-day/index.ts:18`, `server-settings/set-aoc-settings.ts:23` |
| `logger.error` only (no OTel signal)      | 13    | Table below                                                                                     |

### The log-only gap (13 sites) — invisible to span-status triggers

These don't mark the active span ERROR, so `FilteringSpanProcessor` exports them at the 1% sample rate or not at all:

| Location                                                 | What                                                                                    | Category                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `bin/autobump.ts:35`                                     | Per-thread bump failure (err obj)                                                       | Real error — **also sweeps under rug: `:74` returns `success: true` even on failure** |
| `src/slash-commands/all-cap/index.ts:39`                 | Message fetch error (err obj)                                                           | Real error                                                                            |
| `src/slash-commands/mock-someone/index.ts:50`            | Blank message (no err obj) — NOTE line 43 is `logger.info` for the actual fetch-failure | Business condition                                                                    |
| `src/slash-commands/aoc-leaderboard/client.ts:20`        | Leaderboard format parse error (err obj)                                                | Real error                                                                            |
| `src/slash-commands/aoc-leaderboard/utils.ts:39`         | Missing key/id config → `logger.error` **then throws**                                  | Business condition — re-caught upstream at `index.ts:100` (double signal)             |
| `src/slash-commands/aoc-leaderboard/index.ts:92`         | Settings not configured (string only)                                                   | Business condition                                                                    |
| `src/slash-commands/autobump-threads/add-thread.ts:21`   | "Not a thread" (string only)                                                            | Business condition                                                                    |
| `src/slash-commands/autobump-threads/list-threads.ts:33` | "No threads setup" (string only)                                                        | Business condition — expected state                                                   |
| `src/slash-commands/referral/referral-new.ts:77`         | "Code already exists" (string only)                                                     | Business condition — expected                                                         |
| `scripts/deploy-guild-commands.ts:30`                    | Deploy failure (err obj)                                                                | Real error — no OTel                                                                  |
| `scripts/delete-guild-commands.ts:27`                    | Delete failure (err obj)                                                                | Real error — no OTel                                                                  |
| `scripts/delete-global-commands.ts:22`                   | Delete failure (err obj)                                                                | Real error — no OTel                                                                  |
| `bin/telemetry.ts:97`                                    | SDK shutdown `console.error`                                                            | Real error — pre-shutdown                                                             |

### Business conditions logged at ERROR → will page on any log-trigger

`aoc/index.ts:92`, `aoc/utils.ts:39`, `add-thread.ts:21`, `list-threads.ts:33`, `referral-new.ts:77`, plus arguably `mock-someone/index.ts:50`.

EOF.
