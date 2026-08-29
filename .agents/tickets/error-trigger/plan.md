# Granular Error Trigger Plan

## Goal

Add granular, tiered error triggers in the OTel backend (Axiom today, Honeycomb considered) so the community notices real failures and isn't deafened by noise. This plan is execution-focused; the full site inventory is in [`research.md`](./research.md).

## Start state

- Two prod log paths today: OTel on (console + `instrumentation-winston` → OTLP) or OTel off (`@axiomhq/winston` direct transport). Logs and traces only share a pipeline when OTel is on.
- Every OTel error goes through one choke point: `recordSpanError(err, slug)` (`src/utils/tracer.ts:6`) → span `status=ERROR` + `error.type=<slug>`. `FilteringSpanProcessor` exports error spans at 100% (`src/utils/filtering-span-processor.ts:58`).
- All runtime entry points boot OTel via `--import ./bin/telemetry.ts` (`package.json:32-37`, `docker-compose.production.yml` `command:`). `telemetry.ts` gates on `env.ENABLE_OTEL` (`bin/telemetry.ts:18`).
- Logs carry `defaultMeta.service = 'vait-chatbot'` (hardcoded, `src/utils/logger.ts:15,24`) — **does not match** trace resource `service.name = OTEL_SERVICE_NAME` (`bin/telemetry.ts:63`). Log ↔ trace grouping already diverges.

---

## Phase 1 — All-in on OTel (kill the direct Axiom winston transport)

### 1.1 One log pipeline (`src/utils/logger.ts`)

Delete the `@axiomhq/winston` branch. Prod becomes console-only; records reach OTel exclusively via `instrumentation-winston`.

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

- Remove `AxiomTransport` import + the `env.ENABLE_OTEL` split (lines 21-43). OTel is the only path.
- **Wire `exceptionHandlers`/`rejectionHandlers` always in prod** — currently they exist only in the OTel-off branch; with OTel on, `uncaughtException`/`unhandledRejection` are silent. (Fatal handling completes in Phase 3.)
- Align service identity: `defaultMeta.service = env.OTEL_SERVICE_NAME ?? 'vait-chatbot'` so log records and trace `resource.service.name` agree (fixes the grouping mismatch in §Start state).

### 1.2 Make OTel unconditional in prod (`src/utils/load-env.ts:19`)

`ENABLE_OTEL` defaults `false` and is **not present in `.env.production`** — prod currently relies on runtime deployment env, a silent-drift hazard.

```ts
ENABLE_OTEL: z.stringbool().default(true),
```

- Keep the gate as an escape hatch.
- `.env.ci` already exports `ENABLE_OTEL=false` explicitly → tests unaffected.
- `.env` / `.env.dist` already set local endpoint `http://localhost:4318` → dev traces flow to otel-desktop-viewer.
- Existing validation already fails fast when `ENABLE_OTEL` is true without `OTEL_EXPORTER_OTLP_ENDPOINT` (`load-env.ts:47-56`) → flipping the default makes the endpoint mandatory everywhere. Confirm `.env.dist` documents this.

### 1.3 Verify OTLP endpoint URL (`bin/telemetry.ts:74-76`, `.env.production:17`)

Prod endpoint is `https://ilcgkvpvahpu.ingress.axiom.co/v1/traces` — **already carries `/v1/traces`**. `docs/reference/05-environment-variables.md:42` states the SDK "appends signal-specific paths (`/v1/traces`, `/v1/logs`) automatically". If so, traces are being POSTed to `/v1/traces/v1/traces` today.

Action: change `.env.production` to the bare host (`https://ilcgkvpvahpu.ingress.axiom.co`) and verify with `OTEL_DEBUG=true` + one request that (a) traces land and (b) logs land at `/v1/logs`. If Axiom's ingress expects the explicit `/v1/traces` (SDK would then double-append), the fix instead is an explicit `url` on the exporters. **Verify empirically before shipping P1.**

### 1.4 Clean up deps

Remove `@axiomhq/winston` from `package.json:40` (and `pnpm-lock.yaml`).

### Assertions

- `rg '@axiomhq/winston' src bin package.json` → 0 hits.
- `logger.error('boom', e)` produces an OTLP log record with `severity` in the backend.
- Login → trace + debug log for the same event are grouped under the same `service.name`.

---

## Phase 2 — Normalize error signals (close research.md gaps)

Rule after this phase: **every `logger.error` is paired with a span error; every business condition is `warn`/`info`, never error.**

### 2.1 Real-error, log-only sites → add span error

**`src/slash-commands/all-cap/index.ts:38-39`** — also contains a latent bug: `fetchedMessage.unwrapErr()` runs when the result is OK-but-blank (unwraps an `Ok`). Split the branches:

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

**`src/slash-commands/mock-someone/index.ts:43,50`** — levels are inverted vs all-cap:

- `:43` fetch failure currently `logger.info` → make it `recordSpanError(err, 'err-fetch-message-failed')` + `logger.error` (share the slug with all-cap).
- `:50` blank content currently `logger.error` → `logger.warn` (business condition).

**`bin/autobump.ts:35`** — per-thread bump failure: add `recordSpanError(op.unwrapErr(), 'err-autobump-bump-failed')`. Multiple per run is fine; slug stays granular.

**`src/slash-commands/aoc-leaderboard/client.ts:20`** — NO change. This `logger.error` re-throws and is re-caught upstream at `index.ts:100` → span already gets `err-aoc-leaderboard-fetch-failed`. Do not double-record a fresh slug; the existing upstream span error is the trigger key.

### 2.2 Reclassify business conditions → `warn`/`info`

| Site                                  | Current                | New            | Message                                     |
| ------------------------------------- | ---------------------- | -------------- | ------------------------------------------- |
| `aoc-leaderboard/index.ts:92`         | `logger.error`         | `warn`         | Settings not configured                     |
| `aoc-leaderboard/utils.ts:39`         | `logger.error` + throw | `warn` + throw | Missing key/id (span still caught upstream) |
| `autobump-threads/add-thread.ts:21`   | `logger.error`         | `warn`         | "Not a thread"                              |
| `autobump-threads/list-threads.ts:33` | `logger.error`         | `info`         | "No threads setup" (fully expected state)   |
| `referral/referral-new.ts:77`         | `logger.error`         | `warn`         | "Code already exists"                       |
| `mock-someone/index.ts:50`            | `logger.error`         | `warn`         | blank message (covers §2.1)                 |
| `all-cap/index.ts:39` (blank case)    | —                      | `warn`         | covered in §2.1                             |

After this, the only `logger.error` without an accompanying span error is `scripts/*` (manual ops, see §2.5) — making a log-severity trigger free of expected-state noise.

### 2.3 Fix the autobump success-flag bug (`bin/autobump.ts:35,74`)

`:74` hardcodes `success: true` even when `performBump` just failed. Failures are invisible in both the logs and the `bot.autobump` span. Make `bumpThread` return its outcome:

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

### 2.4 Symmetrize the 3 span-only sites (add `logger.error` for debugging parity)

`weather/index.ts:31`, `quote-of-the-day/index.ts:18`, `server-settings/set-aoc-settings.ts:23` currently record span errors with no log line. Add the paired `logger.error('...', err)`.

### 2.5 Scripts / manual ops

`scripts/*` boot telemetry via `--import` (`package.json:32-34`) but are manual admin actions — accept their `logger.error` as un-triggered (documented). No span needed.

### Assertions

- Grep audit: every `logger.error` in `src/` and `bin/` has an adjacent `recordSpanError`, or is a marked `scripts/` exception, or is business-condition (now `warn`).
- `pnpm lint && pnpm typecheck && pnpm test` green.

---

## Phase 3 — Fatal / process-level signals

Today a hard crash with OTel on exports nothing.

### 3.1 `uncaughtException` handler (`bin/main.ts`)

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

- Register **before** `main()` executes so boot-time throws (e.g. env validation) are captured.
- Mirror for `unhandledRejection` (same handler, slug `err-unhandled-rejection`, `process.exit(1)` — a bad rejection is a bug; crash → restart is the desired restart policy).
- Note: with `exceptionHandlers` wired in P1.1, a crash also exports a log record at ERROR — both surfaces fire.

### 3.2 Pre-boot env failure (`src/utils/load-env.ts:62`)

Accept as **documented last resort**: `loadEnv` runs at module scope inside `telemetry.ts` import (before SDK start) and in `logger.ts` (before transport exists) — a minimal fallback logger can't exist yet. Keep `console.error` (= visible in container stderr); it's the only mechanism available pre-boot. The uncaughtException handler can't help either (process dies in import). Record this limit in `docs/reference/08-error-handling.md` so nobody "fixes" it later into a dead-end.

### 3.3 SIGTERM flush (already correct)

`bin/telemetry.ts:88-98` flushes both exporters then shuts down SDK. Keep. Entries in `bin/*` already `await shutdownTelemetry()` before `process.exit`.

### Assertions

- `kill -9` mid-run leaves nothing (expected); `kill` (SIGTERM) flushes pending spans.
- A thrown `Error` in a message handler produces span `err-uncaught-exception` **and** a winston ERROR log record.
- `consumer test`: intentionally throw in dev, confirm both records appear in the backend; revert.

---

## Phase 4 — Trigger definitions

Signal sources after P1-3 (all in OTel):

- **A. Traces** — `error.type` slug on ERROR spans, 100% export.
- **B. Logs** — winston severity/level on OTLP logs, trace-context-attached.
- **C. Fatal** — `err-uncaught-exception` / `err-unhandled-rejection` spans + ERROR logs.

Tiering (slugs from research.md):

| Tier       | Match on                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Gate     | Suggested trigger                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ |
| **High**   | `err-honeypot-ban-failed` (moderation = security), `err-keyword-processing-failed`, `err-settings-reminder-save-failed`, `err-settings-honeypot-save-failed`, `err-settings-aoc-save-failed`, bin job slugs (`err-autobump-list-failed`, `err-autobump-bump-failed`, `err-broadcast-reminder-query-failed`, `err-cleanup-referrals-failed`, `err-deploy-commands-failed`, `err-load-honeypots-failed`), `err-uncaught-exception`, `err-unhandled-rejection` | any      | **Any occurrence**, 5m window → page |
| **Medium** | DB-backed command slugs (`err-command-<name>-failed` where name ∈ reminder/referral/server-settings/aoc), `err-weather-fetch-failed`, `err-quote-fetch-failed` (external APIs; flaky)                                                                                                                                                                                                                                                                       | ≥2       | ≥2 occurrences in 10m → digest       |
| **Low**    | `err-autocomplete-<name>-failed`, `err-contextmenu-<name>-failed`                                                                                                                                                                                                                                                                                                                                                                                           | cosmetic | Count only, weekly review            |

**Axiom** (monitors are scheduled dataset queries, alert if the query returns rows):

- High tier monitor: `['error.type']="err-honeypot-ban-failed" OR ['error.type']="err-keyword-processing-failed" OR …` (one monitor per tier, one explicit list of slugs).
- Log monitor (Signal B, **only after P2**): `severity_text = "ERROR"` count > 0 (catches any log-only strays secondarily).
- Fatal monitor: union of the two fatal slugs.

**Honeycomb (migration port)** — one Trigger per tier, query `WHERE error.type = <slug>` grouped 5m; SLO e.g. success-rate = `1 - (error spans / all spans)` per `service.name`. Same `error.type` dimension; no code change.

---

## Phase 5 — Backend migration (Axiom → Honeycomb), config-only

Exact swap points:

- `bin/telemetry.ts:25-33` — replace `Authorization: Bearer <axiom>` + `X-Axiom-Dataset` with Honeycomb's `X-Honeycomb-Team` header; dataset → `X-Honeycomb-Dataset`.
- `OTEL_EXPORTER_OTLP_ENDPOINT` envs (`docs/reference/05-environment-variables.md:42`) — base URL switch.
- Env vars: keep `AXIOM_*` only until P1.1 lands, then retire `AXIOM_ORG_ID` (was transport-console-only); `AXIOM_TOKEN/DATASET` repurpose as exporter auth/ingest-name (temp), then rename for Honeycomb.
- Trigger tables in Phase 4 are backend-agnostic APL/WHERE queries — port as-is.

---

## Verification & rollout order

1. P1 commits (logger + env default) → deploy → confirm log+traces unify; confirm endpoint `/v1` handling empirically.
2. P2 (all signal normalization) — pure code, test-covered.
3. Import research.md tiers → create Axiom monitors at Low first (observe 1 week, tune thresholds against real traffic).
4. Promote to Medium/High after one tuned cycle.
5. P3 fatal signals → add fatal monitor → then kill-test.
6. Honeycomb migration whenever ready — Phase 5 only.

## File change summary

| Phase | Files                                                                                                                                                                                                                                                                             | Type               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| P1    | `src/utils/logger.ts`, `src/utils/load-env.ts`, `package.json`, `.env.production`, `.env.dist`, `.env.ci`(comment), `docs/reference/05-environment-variables.md`                                                                                                                  | code+deps+env+docs |
| P2    | `all-cap/index.ts`, `mock-someone/index.ts`, `bin/autobump.ts`, `aoc-leaderboard/index.ts` + `utils.ts`, `autobump-threads/add-thread.ts` + `list-threads.ts`, `referral/referral-new.ts`, `weather/index.ts`, `quote-of-the-day/index.ts`, `server-settings/set-aoc-settings.ts` | code (+tests)      |
| P3    | `bin/main.ts`, `docs/reference/08-error-handling.md`                                                                                                                                                                                                                              | code+docs          |
| P4    | Backend monitor config (Axiom), tier table in this doc                                                                                                                                                                                                                            | config             |
| P5    | `bin/telemetry.ts`, env files, docs (if migrating)                                                                                                                                                                                                                                | config+docs        |

## Open questions

1. Confirm Axiom endpoint base-URL behaviour (§1.3) — is prod currently exporting traces at all?
2. Deployment cadence for the 3 compose jobs (`broadcast-reminder`, `autobump`, `cleanup-referrals`) — needed for a Signal-C heartbeat (alert "no trace in N×expected window"); cadence lives outside this repo.
3. Retire `AXIOM_ORG_ID`/`AXIOM_TOKEN` namespacing early or fold into the Honeycomb rename in one go?

## Risk notes

- **P1 breaks prod observability momentanously** if the endpoint is genuinely two-segmented — mitigate by running `OTEL_DEBUG=1` deploy and checking ingress before/after.
- **Flipping `ENABLE_OTEL` default** makes any dev/CI env without an endpoint fail fast at boot — intended, but announce to contributors.
- Log-only `scripts/*` remain un-triggered; accepted as manual ops.
- Rising edge: splatting `err-autobump-bump-failed` N times/run is by design; use count-of-spans, not count-of-events, in monitors.
