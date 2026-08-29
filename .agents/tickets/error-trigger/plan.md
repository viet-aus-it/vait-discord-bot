# Granular Error Trigger Plan

## Goal

Add granular, tiered error triggers in OTel backend (Axiom today, Honeycomb considered). Community notices real failures, deafened by noise. Plan execution-focused. Site inventory: [`research.md`](./research.md).

## Start state

- Two prod log paths today: OTel on (console + `instrumentation-winston` → OTLP) or OTel off (`@axiomhq/winston` direct). Logs + traces share pipeline only OTel on.
- Every OTel error one choke point: `recordSpanError(err, slug)` (`src/utils/tracer.ts:6`) → span `status=ERROR` + `error.type=<slug>`. `FilteringSpanProcessor` exports error spans 100% (`src/utils/filtering-span-processor.ts:58`).
- Runtime entry points boot OTel via `--import ./bin/telemetry.ts` (`package.json:32-37`, `docker-compose.production.yml` `command:`). `telemetry.ts` gates on `env.ENABLE_OTEL` (`bin/telemetry.ts:18`).
- NO `.env*` committed. Tracked only `.env.ci` (CI) + `.env.dist` (dev template). `.env.production` = untracked local docker copy; live prod env = deployment-managed (untracked), already OTel-on. Local `.env*` not ground truth.
- Logs `defaultMeta.service = 'vait-chatbot'` (hardcoded, `src/utils/logger.ts:15,24`) — mismatch trace `service.name = OTEL_SERVICE_NAME` (`bin/telemetry.ts:63`). Log↔trace grouping already diverges.

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
- Wire `exceptionHandlers`/`rejectionHandlers` always in prod — today only OTel-off branch; OTel on → `uncaughtException`/`unhandledRejection` silent. (Fatal handling complete in Phase 4.)
- Align service identity: `defaultMeta.service = env.OTEL_SERVICE_NAME ?? 'vait-chatbot'` so log + trace `service.name` agree (fix §Start-state grouping mismatch).

### 1.2 Keep `ENABLE_OTEL` gate as-is (`src/utils/load-env.ts:19`)

`ENABLE_OTEL` keeps conventional default `false` — no flip. Live prod enables in untracked deployment env; no `.env.production` committed (local copy only), live flag entirely outside repo. Existing validation fails fast when `ENABLE_OTEL=true` without `OTEL_EXPORTER_OTLP_ENDPOINT` (`load-env.ts:47-56`).

### 1.3 Verify OTLP endpoint URL (`bin/telemetry.ts:74-76`)

Check LIVE prod env endpoint (repo tracks no live env — `.env.production` untracked local copy): if carries `/v1/traces` already while `docs/reference/05-environment-variables.md:42` says SDK "appends signal-specific paths automatically", traces POST to `/v1/traces/v1/traces` (or logs misfiled). Verify `OTEL_DEBUG=true` + one request: (a) traces land, (b) logs land `/v1/logs`. If Axiom ingress expects explicit `/v1/traces` (SDK double-append), fix = explicit `url` on exporters, not base env. **Verify empirically against real deployment env before shipping P1.**

### 1.4 Clean up deps

Remove `@axiomhq/winston` from `package.json:40` (+ `pnpm-lock.yaml`).

### Assertions

- `rg '@axiomhq/winston' src bin package.json` → 0 hits.
- `logger.error('boom', e)` produces OTLP log record with `severity` in backend.
- Login → trace + debug log same event grouped same `service.name`.

---

## Phase 2 — Rename `.env.dist` → `.env.sample`

`.env.dist` ambiguous, non-standard template; `.env.sample` community convention. Purely dev-onboarding artifact — nothing in code reads `.env.dist`, rename mechanical, independent of runtime config.

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

Keep historical mentions (`.github/CHANGELOG.md`, `prisma-to-drizzle` ticket) untouched — describe past state.

### Assertions

- `git ls-files` shows `.env.sample`; `.env.dist` absent.
- `rg '\.env\.dist'` → hits only `.github/CHANGELOG.md` + archived tickets.

---

## Phase 3 — Normalize error signals (close research.md gaps)

Rule after: every `logger.error` paired with span error; every business condition `warn`/`info`, never error.

### 3.1 Real-error, log-only sites → add span error

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

- `:43` fetch failure `logger.info` → `recordSpanError(err, 'err-fetch-message-failed')` + `logger.error` (share all-cap slug).
- `:50` blank content `logger.error` → `logger.warn` (business condition).

**`bin/autobump.ts:35`** — per-thread bump failure: add `recordSpanError(op.unwrapErr(), 'err-autobump-bump-failed')`. Multiple per run fine; slug stays granular.

**`src/slash-commands/aoc-leaderboard/client.ts:20`** — NO change. `logger.error` re-throws, re-caught upstream `index.ts:100` → span already `err-aoc-leaderboard-fetch-failed`. No fresh slug; existing upstream span error = trigger key.

### 3.2 Reclassify business conditions → `warn`/`info`

| Site                                  | Current                | New            | Message                                     |
| ------------------------------------- | ---------------------- | -------------- | ------------------------------------------- |
| `aoc-leaderboard/index.ts:92`         | `logger.error`         | `warn`         | Settings not configured                     |
| `aoc-leaderboard/utils.ts:39`         | `logger.error` + throw | `warn` + throw | Missing key/id (span still caught upstream) |
| `autobump-threads/add-thread.ts:21`   | `logger.error`         | `warn`         | "Not a thread"                              |
| `autobump-threads/list-threads.ts:33` | `logger.error`         | `info`         | "No threads setup" (fully expected state)   |
| `referral/referral-new.ts:77`         | `logger.error`         | `warn`         | "Code already exists"                       |
| `mock-someone/index.ts:50`            | `logger.error`         | `warn`         | blank message (covers §3.1)                 |
| `all-cap/index.ts:39` (blank case)    | —                      | `warn`         | covered in §3.1                             |

After: only `logger.error` without span = `scripts/*` (manual ops, §3.5) → log-severity trigger clean of expected-state noise.

### 3.3 Fix autobump success-flag bug (`bin/autobump.ts:35,74`)

`:74` hardcodes `success: true` even when `performBump` just failed. Failures invisible in logs + `bot.autobump` span. Make `bumpThread` return outcome:

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

### 3.4 Symmetrize 3 span-only sites (add `logger.error` for debug parity)

`weather/index.ts:31`, `quote-of-the-day/index.ts:18`, `server-settings/set-aoc-settings.ts:23` record span errors, no log line. Add paired `logger.error('...', err)`.

### 3.5 Scripts / manual ops

`scripts/*` boot telemetry via `--import` (`package.json:32-34`) but manual admin actions — accept `logger.error` un-triggered (documented). No span.

### Assertions

- Grep audit: every `logger.error` in `src/`, `bin/` adjacent `recordSpanError`, or marked `scripts/` exception, or business-condition (now `warn`).
- `pnpm lint && pnpm typecheck && pnpm test` green.

---

## Phase 4 — Fatal / process-level signals

Hard crash OTel-on exports nothing today.

### 4.1 `uncaughtException` handler (`bin/main.ts`)

```ts
process.on('uncaughtException', (error) => {
  tracer.startActiveSpan('fatal-uncaught-exception', (span) => {
    span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
    span.recordException(error);
    span.setAttribute(ATTR_ERROR_TYPE, 'err-uncaught-exception');
    span.end();
  });
  logger.error('[main]: Fatal uncaught exception', error);
  process.exit(1);
});
```

- Register BEFORE `main()` → boot-time throws (env validation) captured.
- Mirror `unhandledRejection` (same handler, slug `err-unhandled-rejection`, `process.exit(1)` — bad rejection = bug; crash → restart = desired policy).
- `exceptionHandlers` wired in P1.1 → crash also exports ERROR log; both surfaces fire.

### 4.2 Pre-boot env failure (`src/utils/load-env.ts:62`)

Accept documented last resort: `loadEnv` module-scope inside `telemetry.ts` import (before SDK) + `logger.ts` (before transport). Minimal fallback logger impossible. Keep `console.error` (= container stderr); only pre-boot mechanism. uncaughtException handler can't help (process dies in import). Record limit in `docs/reference/08-error-handling.md` so nobody "fixes" into dead-end.

### 4.3 SIGTERM flush (already correct)

`bin/telemetry.ts:88-98` flushes both exporters then SDK shutdown. Keep. `bin/*` already `await shutdownTelemetry()` before `process.exit`.

### Assertions

- `kill -9` mid-run leaves nothing (expected); `kill` (SIGTERM) flushes pending spans.
- Thrown `Error` in message handler → span `err-uncaught-exception` AND winston ERROR log.
- Consumer test: throw in dev, confirm both records backend; revert.

---

## Phase 5 — Trigger definitions

Signal sources after P1-4 (all OTel):

- **A. Traces** — `error.type` slug on ERROR spans, 100% export.
- **B. Logs** — winston severity/level on OTLP logs, trace-context-attached.
- **C. Fatal** — `err-uncaught-exception` / `err-unhandled-rejection` spans + ERROR logs.

Tiering (slugs from research.md):

| Tier       | Match on                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Gate     | Suggested trigger                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ |
| **High**   | `err-honeypot-ban-failed` (moderation = security), `err-keyword-processing-failed`, `err-settings-reminder-save-failed`, `err-settings-honeypot-save-failed`, `err-settings-aoc-save-failed`, bin job slugs (`err-autobump-list-failed`, `err-autobump-bump-failed`, `err-broadcast-reminder-query-failed`, `err-cleanup-referrals-failed`, `err-deploy-commands-failed`, `err-load-honeypots-failed`), `err-uncaught-exception`, `err-unhandled-rejection` | any      | **Any occurrence**, 5m window → page |
| **Medium** | DB-backed command slugs (`err-command-<name>-failed` where name ∈ reminder/referral/server-settings/aoc), `err-weather-fetch-failed`, `err-quote-fetch-failed` (external APIs; flaky)                                                                                                                                                                                                                                                                       | ≥2       | ≥2 occurrences in 10m → digest       |
| **Low**    | `err-autocomplete-<name>-failed`, `err-contextmenu-<name>-failed`                                                                                                                                                                                                                                                                                                                                                                                           | cosmetic | Count only, weekly review            |

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

1. P1 commits (logger + env default) → deploy → confirm log+traces unify; confirm endpoint `/v1` empirically.
2. P2 rename `.env.dist` → `.env.sample` — mechanical, land with P1 same commit.
3. P3 (all signal normalization) — pure code, test-covered.
4. Import research.md tiers → create Axiom monitors Low first (observe 1 week, tune thresholds real traffic).
5. Promote Medium/High after one tuned cycle.
6. P4 fatal signals → add fatal monitor → kill-test.
7. Honeycomb migration whenever ready — Phase 6 only.

## File change summary

| Phase | Files                                                                                                                                                                                                                                                                             | Type               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| P1    | `src/utils/logger.ts`, `package.json`, `.env.dist`, `docs/reference/05-environment-variables.md`, live prod env (endpoint fix)                                                                                                                                                    | code+deps+env+docs |
| P2    | `.env.dist` → `.env.sample` (git mv), `scripts/onboarding.sh`, `docs/reference/05-environment-variables.md`, `docs/how-to/01-quick-start.md`, `docs/how-to/04-production-testing.md`, `.agents/skills/update-docs/SKILL.md`                                                       | docs+scripts+env   |
| P3    | `all-cap/index.ts`, `mock-someone/index.ts`, `bin/autobump.ts`, `aoc-leaderboard/index.ts` + `utils.ts`, `autobump-threads/add-thread.ts` + `list-threads.ts`, `referral/referral-new.ts`, `weather/index.ts`, `quote-of-the-day/index.ts`, `server-settings/set-aoc-settings.ts` | code (+tests)      |
| P4    | `bin/main.ts`, `docs/reference/08-error-handling.md`                                                                                                                                                                                                                              | code+docs          |
| P5    | Backend monitor config (Axiom), tier table in this doc                                                                                                                                                                                                                            | config             |
| P6    | `bin/telemetry.ts`, env files, docs (if migrating)                                                                                                                                                                                                                                | config+docs        |

## Open questions

1. Confirm Axiom endpoint base-URL behaviour (§1.3) vs LIVE deployment env — prod exporting traces at all now?
2. Deployment cadence for 3 compose jobs (`broadcast-reminder`, `autobump`, `cleanup-referrals`) — needed for Signal-C heartbeat (alert "no trace in N×expected window"); cadence outside repo.
3. Retire `AXIOM_ORG_ID`/`AXIOM_TOKEN` namespacing early or fold into Honeycomb rename once?

## Risk notes

- P1 breaks prod observability momentarily IF endpoint genuinely two-segmented — mitigate `OTEL_DEBUG=1` deploy, check ingress before/after.
- Log-only `scripts/*` un-triggered; accepted manual ops.
- Rising edge: `err-autobump-bump-failed` splat N times/run by design; monitors count-of-spans, not count-of-events.
