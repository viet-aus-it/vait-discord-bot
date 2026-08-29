# Granular Error Trigger Plan

## Goal

Granular, tiered error triggers in OTel backend (Axiom today, Honeycomb considered). Community notice real failures, deafened by noise. Execution-focused. Site inventory: [`research.md`](./research.md).

## Start state

- Two prod log paths: OTel on (console + `instrumentation-winston` to OTLP), OTel off (`@axiomhq/winston` direct). Logs+traces share pipeline only OTel on.
- Every OTel error one choke: `recordSpanError(err, slug)` (`src/utils/tracer.ts:6`) sets span `status=ERROR` + `error.type=<slug>`. `FilteringSpanProcessor` exports error spans 100% (`src/utils/filtering-span-processor.ts:58`).
- Runtime entry points boot OTel via `--import ./bin/telemetry.ts` (`package.json:32-37`, `docker-compose.production.yml` `command:`). `telemetry.ts` gates on `env.ENABLE_OTEL` (`bin/telemetry.ts:18`).
- NO `.env*` committed. Tracked only `.env.ci` (CI) + `.env.dist` (dev template). `.env.production` = untracked local docker copy; live prod env = deployment-managed (untracked), already OTel-on. Local `.env*` not ground truth.
- Logs `defaultMeta.service = 'vait-chatbot'` (hardcoded, `src/utils/logger.ts:15,24`) — mismatch trace `service.name = OTEL_SERVICE_NAME` (`bin/telemetry.ts:63`). Log/trace grouping already diverges.

---

## Phase 1 — All-in OTel (kill direct Axiom winston transport)

### 1.1 One log pipeline (`src/utils/logger.ts`)

Delete `@axiomhq/winston` branch. Prod = console-only; records reach OTel via `instrumentation-winston`.

```ts
function getLoggerOptions(): winston.LoggerOptions {
  if (env.NODE_ENV !== 'production') {
    return {
      level: 'debug',
      defaultMeta: { service: 'vait-chatbot-dev' },
      transports: [consoleTransport],
      exceptionHandlers: [consoleTransport],
      rejectionHandlers: [consoleTransport],
      format: devFormat,
    };
  }

  return {
    level: 'info',
    defaultMeta: { service: env.OTEL_SERVICE_NAME ?? 'vait-chatbot' },
    transports: [consoleTransport],
    exceptionHandlers: [consoleTransport],
    rejectionHandlers: [consoleTransport],
    format: prodFormat,
  };
}
```

Changes:

- Remove `AxiomTransport` import + `env.ENABLE_OTEL` split (lines 21-43). OTel only path.
- Wire `exceptionHandlers`/`rejectionHandlers` always in prod. Today only OTel-off branch; OTel on = `uncaughtException`/`unhandledRejection` silent. Fatal handling complete Phase 4.
- Align service identity: `defaultMeta.service = env.OTEL_SERVICE_NAME ?? 'vait-chatbot'`. Log + trace `service.name` agree (fixes Start-state mismatch).

### 1.2 Keep `ENABLE_OTEL` gate as-is (`src/utils/load-env.ts:19`)

`ENABLE_OTEL` keeps default `false` — no flip. Live prod enables via untracked deployment env; no `.env.production` committed (local docker copy only), live flag entirely outside repo. Validation fails fast when `ENABLE_OTEL=true` without `OTEL_EXPORTER_OTLP_ENDPOINT` (`load-env.ts:47-56`).

### 1.4 Clean up deps

Remove `@axiomhq/winston` from `package.json:40` (+ `pnpm-lock.yaml`).
Stop referencing `AXIOM_ORG_ID` (transport gone) in `.env.dist` + docs/reference/05-environment-variables.md. `AXIOM_TOKEN`/`AXIOM_DATASET` STAY — still exporting to Axiom; retire only at Phase 6.

### 1.5 Rewrite `recordSpanError` for OTel 2026 conventions (`src/utils/tracer.ts:6`)

`span.recordException` = Span Events API, deprecated (OTEP 4430, https://opentelemetry.io/blog/2026/deprecating-span-events/). Recording-errors guidance (https://opentelemetry.io/docs/specs/semconv/general/recording-errors/): failed span sets `status=ERROR` + `error.type` attribute (+ status description = exception message when useful); exception detail = LOG RECORD correlated with active span (Logs API), NOT span event.

```ts
export function recordSpanError(error: unknown, slug: string): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
  span.setAttribute(ATTR_ERROR_TYPE, slug);
  // exception payload rides correlated winston log record (Logs API)
  // span.recordException removed — Span Events API deprecated (OTEP 4430)
}
```

- Drop `span.recordException(error instanceof Error ? error : new Error(String(error)))`.
- Exception detail lives in `logger.error` on same path; `instrumentation-winston` correlates log to active span via trace context. Satisfies "record exceptions as log records".
- 3 span-only sites (`weather:31`, `qotd:18`, `set-aoc:23`) lose exception payload now. P3 §3.4 symmetrize REQUIRED, not optional parity.
- Spec tension: record same exception once. aoc `client.ts` logs then throws = logged twice (client + upstream catch). Accepted: different signals (log at source, status+error.type at boundary). Revisit if noise appears.

### Assertions (Phase 1)

- `rg '@axiomhq/winston' src bin package.json`: 0 hits.
- `rg 'recordException' src bin`: 0 hits (after P1 + P3 symmetrize).
- `logger.error('boom', e)` produces OTLP log record with `severity` in backend.
- Login: trace + debug log same event grouped same `service.name`.

---

## Phase 2 — Rename `.env.dist` → `.env.sample`

`.env.dist` ambiguous, non-standard template. `.env.sample` community convention. Dev-onboarding artifact only — nothing in code reads `.env.dist`, rename mechanical, independent of runtime config.

### 2.1 Rename file

`git mv .env.dist .env.sample`

### 2.2 Update refs (non-historical only)

| File                                           | Change                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `scripts/onboarding.sh:23`                     | `cp .env.dist .env` → `cp .env.sample .env`                       |
| `docs/reference/05-environment-variables.md:3` | `.env.dist` → `.env.sample`                                       |
| `docs/how-to/01-quick-start.md:34`             | `cp .env.dist .env` → `cp .env.sample .env`                       |
| `docs/how-to/04-production-testing.md:10`      | `cp .env.dist .env.production` → `cp .env.sample .env.production` |
| `.agents/skills/update-docs/SKILL.md` (5 refs) | env-var reference + mapping tables, audit + checklist             |

Keep historical mentions (`.github/CHANGELOG.md`, `prisma-to-drizzle` ticket) untouched — they describe past state.

### Assertions

- `git ls-files` shows `.env.sample`; `.env.dist` absent.
- `rg '\.env\.dist'` = hits only `.github/CHANGELOG.md` + archived tickets.

---

## Phase 3 — Normalize error signals (close research.md gaps)

Rule after: every `logger.error` paired with span error; every business condition `warn`/`info`, never error; every operation records success twin.

### 3.1 Real-error, log-only sites: add span error

**`src/slash-commands/all-cap/index.ts:38-39`** — latent bug: `fetchedMessage.unwrapErr()` runs on OK-but-blank result (unwraps `Ok`). Split branches:

```ts
if (fetchedMessage.isErr()) {
  recordSpanError(fetchedMessage.unwrapErr(), 'err-fetch-message-failed');
  logger.error('[allcap]: Cannot fetch latest message', fetchedMessage.unwrapErr());
  await interaction.reply('Cannot fetch latest message. Please try again later.');
  return;
}
if (isBlank(fetchedMessage.unwrap().content)) {
  logger.warn('[allcap]: Latest message is blank'); // business condition, not an error
  await interaction.reply('Cannot fetch latest message. Please try again later.');
  return;
}
```

**`src/slash-commands/mock-someone/index.ts:43,50`** — levels inverted vs all-cap:

- `:43` fetch failure `logger.info` becomes `recordSpanError(err, 'err-fetch-message-failed')` + `logger.error` (share all-cap slug).
- `:50` blank content `logger.error` becomes `logger.warn` (business condition).

**`bin/autobump.ts:35`** — per-thread bump failure: add `recordSpanError(op.unwrapErr(), 'err-autobump-bump-failed')`. Multiple per run fine; slug stays granular.

**`src/slash-commands/aoc-leaderboard/client.ts:20`** — NO change. `logger.error` re-throws, re-caught upstream `index.ts:100`; span already `err-aoc-leaderboard-fetch-failed`. No fresh slug; existing upstream span error = trigger key.

### 3.2 Reclassify business conditions to `warn`/`info`

| Site                                  | Current                | New            | Message                                     |
| ------------------------------------- | ---------------------- | -------------- | ------------------------------------------- |
| `aoc-leaderboard/index.ts:92`         | `logger.error`         | `warn`         | Settings not configured                     |
| `aoc-leaderboard/utils.ts:39`         | `logger.error` + throw | `warn` + throw | Missing key/id (span still caught upstream) |
| `autobump-threads/add-thread.ts:21`   | `logger.error`         | `warn`         | "Not a thread"                              |
| `autobump-threads/list-threads.ts:33` | `logger.error`         | `info`         | "No threads setup" (expected state)         |
| `referral/referral-new.ts:77`         | `logger.error`         | `warn`         | "Code already exists"                       |
| `mock-someone/index.ts:50`            | `logger.error`         | `warn`         | blank message (covers §3.1)                 |
| `all-cap/index.ts:39` (blank case)    | —                      | `warn`         | covered in §3.1                             |

After: only `logger.error` without span = `scripts/*` (manual ops, §3.5). Log-severity trigger clean of expected-state noise.

### 3.3 Fix autobump success-flag bug (`bin/autobump.ts:35,74`)

`:74` hardcodes `success: true` even when `performBump` failed. Failure invisible in logs + `bot.autobump` span. Make `bumpThread` return outcome:

```ts
const bumpThread = async (thread: ThreadChannel, clientId?: string): Promise<boolean> => {
  const op = await Result.safe(performBump(thread, clientId));
  if (op.isErr()) {
    recordSpanError(op.unwrapErr(), 'err-autobump-bump-failed');
    logger.error(`[autobump]: Failed to bump thread ${thread.id}`, op.unwrapErr());
    return false;
  }
  return true;
};

// reducer:
const thread = (await guild.channels.fetch(id)) as ThreadChannel;
const success = await bumpThread(thread, clientId);
return { threadId: id, success };
```

### 3.4 Symmetrize 3 span-only sites (add `logger.error`)

`weather/index.ts:31`, `quote-of-the-day/index.ts:18`, `server-settings/set-aoc-settings.ts:23`: span errors only, no log line, log `info`. After §1.5 log carries exception payload. Add paired `logger.error('...', err)`. Required now, not optional parity.

### 3.5 Scripts / manual ops

`scripts/*` boot telemetry via `--import` (`package.json:32-34`) but manual admin actions — accept `logger.error` un-triggered (documented). No span.

### 3.6 Record success states — errors meaningless without baseline

Errors alone = noise. Need success twin to compute error rate + see failure in operation-volume context. Spec: success span keeps `status` UNSET and NO `error.type`; rate derived from success attribute.

Some spans carry success marker already: `bot.weather.success`, `bot.quote.success`, `bot.honeypot.ban_success`. Others carry count only (`bot.reminder.count`, `bot.referral.count`, `bot.autobump.thread_count`), processors none.

Standardize: every command/processor/bin span sets `bot.<op>.success` boolean on BOTH paths (false on error, true on success). Backend error-rate = error spans / spans with `bot.*.success`.

Ceiling: `FilteringSpanProcessor` samples success at 1%, errors 100%; rate approximate. Accept: success rate = statistical context for digest/health, never a paging trigger. Raw error-count pages live in P5 tiers. (`ponytail:` keep 1% success sampling; raise only if rate curve unusable in backend.)

### Assertions (Phase 3)

- Grep audit: every `logger.error` in `src/`, `bin/` adjacent `recordSpanError`, or marked `scripts/` exception, or business-condition (now `warn`).
- Grep audit: every `recordSpanError` site also sets `bot.*.success` (or sits under processor wrapper that does).
- `pnpm lint && pnpm typecheck && pnpm test` green.

---

## Phase 4 — Fatal / process-level signals

Hard crash OTel-on exports nothing today.

### 4.1 `uncaughtException` handler (`bin/main.ts`)

```ts
process.on('uncaughtException', (error) => {
  tracer.startActiveSpan('fatal-uncaught-exception', (span) => {
    span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
    span.setAttribute(ATTR_ERROR_TYPE, 'err-uncaught-exception');
    span.end();
  });
  logger.error('[main]: Fatal uncaught exception', error);
  process.exit(1);
});
```

- Register BEFORE `main()`; boot-time throws (env validation) captured.
- Mirror `unhandledRejection` (same handler, slug `err-unhandled-rejection`, `process.exit(1)`; bad rejection = bug, crash = restart = desired policy).
- No `span.recordException` here either — matches §1.5. Exception payload = the `logger.error` record (correlated, exportable even mid-crash if flush lands).
- `exceptionHandlers` wired in P1.1; crash also exports ERROR log; both surfaces fire.

### 4.2 Pre-boot env failure (`src/utils/load-env.ts:62`)

Accept documented last resort: `loadEnv` module-scope inside `telemetry.ts` import (before SDK) + `logger.ts` (before transport). Minimal fallback logger impossible. Keep `console.error` (= container stderr); only pre-boot mechanism. uncaughtException handler can't help (process dies in import). Record limit in `docs/reference/08-error-handling.md` so nobody "fixes" into dead-end.

### Assertions

- `kill -9` mid-run leaves nothing (expected); `kill` (SIGTERM) flushes pending spans.
- Thrown `Error` in message handler produces span `err-uncaught-exception` AND winston ERROR log.
- Consumer test: throw in dev, confirm both records backend; revert.

---

## Phase 5 — Trigger definitions

Signal sources after P1-4 (all OTel):

- **A. Traces** — `error.type` slug on ERROR spans, 100% export.
- **B. Logs** — winston severity/level on OTLP logs, trace-context-attached.
- **C. Fatal** — `err-uncaught-exception` / `err-unhandled-rejection` spans + ERROR logs.

Tiering (slugs from research.md):

| Tier       | Match on                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Gate     | Suggested trigger                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| **High**   | `err-honeypot-ban-failed` (moderation = security), `err-keyword-processing-failed`, `err-settings-reminder-save-failed`, `err-settings-honeypot-save-failed`, `err-settings-aoc-save-failed`, bin job slugs (`err-autobump-list-failed`, `err-autobump-bump-failed`, `err-broadcast-reminder-query-failed`, `err-cleanup-referrals-failed`, `err-deploy-commands-failed`, `err-load-honeypots-failed`), `err-uncaught-exception`, `err-unhandled-rejection` | any      | **Any occurrence**, 5m window pages |
| **Medium** | DB-backed command slugs (`err-command-<name>-failed` where name ∈ reminder/referral/server-settings/aoc), `err-weather-fetch-failed`, `err-quote-fetch-failed` (external APIs; flaky)                                                                                                                                                                                                                                                                       | ≥2       | ≥2 occurrences in 10m digest        |
| **Low**    | `err-autocomplete-<name>-failed`, `err-contextmenu-<name>-failed`                                                                                                                                                                                                                                                                                                                                                                                           | cosmetic | Count only, weekly review           |

**Axiom** (monitors = scheduled dataset queries, alert if query returns rows):

- High tier monitor: `['error.type']="err-honeypot-ban-failed" OR ['error.type']="err-keyword-processing-failed" OR …` (one monitor per tier, one explicit slug list).
- Log monitor (Signal B, only after P3): `severity_text = "ERROR"` count > 0 (catches log-only strays secondarily).
- Fatal monitor: union two fatal slugs.

**Honeycomb (migration port)** — one Trigger per tier, query `WHERE error.type = <slug>` grouped 5m; SLO e.g. success-rate = `1 - (error spans / all spans)` per `service.name`. Same `error.type` dimension; no code change.

---

## Phase 6 — Backend migration (Axiom → Honeycomb), config-only

Exact swap points:

- `bin/telemetry.ts:25-33` — replace `Authorization: Bearer <axiom>` + `X-Axiom-Dataset` with `X-Honeycomb-Team`; dataset → `X-Honeycomb-Dataset`.
- `OTEL_EXPORTER_OTLP_ENDPOINT` envs (`docs/reference/05-environment-variables.md:42`) — base URL switch.
- Env vars: keep `AXIOM_*` only until P1.1 lands, then retire `AXIOM_ORG_ID` (transport-console-only); `AXIOM_TOKEN/DATASET` repurpose as exporter auth/ingest-name (temp), then rename for Honeycomb.
- Phase 5 trigger tables backend-agnostic APL/WHERE queries — port as-is.

---

## Verification & rollout order

1. P1 commits (logger + tracer + RecordException removal), deploy, confirm log+traces unify.
2. P2 rename `.env.dist` → `.env.sample` — mechanical; land with P1 same commit.
3. P3 (all signal normalization) — pure code, test-covered.
4. Import research.md tiers; create Axiom monitors Low first (observe 1 week, tune thresholds real traffic).
5. Promote Medium/High after one tuned cycle.
6. P4 fatal signals; add fatal monitor; kill-test.
7. Honeycomb migration whenever ready — Phase 6 only.

## File change summary

| Phase | Files                                                                                                                                                                                                                                                                             | Type               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| P1    | `src/utils/logger.ts`, `src/utils/tracer.ts`, `package.json`, `.env.dist`, `docs/reference/05-environment-variables.md`                                                                                                                                                           | code+deps+env+docs |
| P2    | `.env.dist` → `.env.sample` (git mv), `scripts/onboarding.sh`, `docs/reference/05-environment-variables.md`, `docs/how-to/01-quick-start.md`, `docs/how-to/04-production-testing.md`, `.agents/skills/update-docs/SKILL.md`                                                       | docs+scripts+env   |
| P3    | `all-cap/index.ts`, `mock-someone/index.ts`, `bin/autobump.ts`, `aoc-leaderboard/index.ts` + `utils.ts`, `autobump-threads/add-thread.ts` + `list-threads.ts`, `referral/referral-new.ts`, `weather/index.ts`, `quote-of-the-day/index.ts`, `server-settings/set-aoc-settings.ts` | code (+tests)      |
| P4    | `bin/main.ts`, `docs/reference/08-error-handling.md`                                                                                                                                                                                                                              | code+docs          |
| P5    | Backend monitor config (Axiom), tier table in this doc                                                                                                                                                                                                                            | config             |
| P6    | `bin/telemetry.ts`, env files, docs (if migrating)                                                                                                                                                                                                                                | config+docs        |

## Risk notes

- P1 removes the OTel-off log path entirely — momentary gap only if OTel export breaks silently; verify ingress right after first deploy.
- Log-only `scripts/*` un-triggered; accepted manual ops.
- Rising edge: `err-autobump-bump-failed` splat N times/run by design; monitors count-of-spans, not count-of-events.
