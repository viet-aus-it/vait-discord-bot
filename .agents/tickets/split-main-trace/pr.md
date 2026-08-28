# PR Draft: `split-main-trace` → `master`

> Branch: `split-main-trace` — base: `master`
> Draft title: `fix(tracing): split monolithic trace by isolating handlers in root context`

---

## Description

Fixes the tracing issue where every `processMessage` / `processInteraction` span hangs under one giant parent span, collapsing the entire day into a single sampled-in/sampled-out trace.

### Root cause

The startup Discord REST call (`GET /gateway/bot` via `@discordjs/rest` → `undici.request`) happens during `client.login()` and becomes the root span. The Discord gateway WebSocket is created inside that span's async scope, so `AsyncLocalStorage` context propagation glues every `messageCreate` / `interactionCreate` dispatch to it forever (via `tls.connect`, etc.). Combined with per-`traceId` sampling in `FilteringSpanProcessor`, one polluted trace swallows the whole day.

### Fix

Wrap both event handler entrypoints in the OTel **root context** so each processed message/interaction becomes its own root span (matching the "wide events" design in `docs/explanation/01-architecture.md`):

- `bin/main.ts` — `context.with(ROOT_CONTEXT, ...)` around `processMessage` and `processInteraction`

### Follow-up cleanups

- `src/utils/interaction-processor.ts` — batch consecutive `span.setAttribute` calls into `span.setAttributes` (chatInput, contextMenu, autocomplete)
- `src/utils/message-processor.ts` — batch message span attributes; skip bot-authored messages early (attributes now record `bot.message.processed: false` / `fromBot: true`)
- `src/utils/message-processor.test.ts` — set `message.author.bot = false` (mock's truthy auto-mock was short-circuiting the new bot guard)
- `src/slash-commands/referral/referral-random.test.ts` — replace unsafe optional chaining in the mock with the file's existing `as Guild` cast (fixes `eslint(no-unsafe-optional-chaining)` warning)

## How Has This Been Tested?

- `pnpm typecheck` — passes
- `pnpm lint` — clean (no warnings)
- `pnpm test` — 40 test files / 154 tests pass
- Manual (dev): `ENABLE_OTEL=true OTEL_DEBUG=true pnpm start:only` → trigger `/weather` + a keyword message; `processMessage` / `processInteraction` export spans with **no `parentSpanContext`**

## Types of changes

- [x] Bug fix (non-breaking change which fixes an issue)

## Checklist:

- [x] My code follows the code style of this project.
- [x] My change requires a change to the documentation.
- [x] I have updated the documentation accordingly.
- [x] I have read the **CONTRIBUTING** document.
- [x] I have added tests to cover my changes.
- [x] All new and existing tests passed.

---

## Commits

- `da42342 fix(tracing): isolate message/interaction handlers in root context`
- `0cc8640 refactor(telemetry): batch span attributes with setAttributes`
- `9bb80eb fix(test): avoid unsafe optional chaining in referral-random mock`
- `docs: document ROOT_CONTEXT isolation and bot message span attributes`
