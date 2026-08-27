# Prisma → Drizzle Migration Plan

## Overview

**6 tables, 7 query files, 1 transaction, 5 type-only imports, 13 historical migrations.** Single entry point pattern (`getDbClient()`) makes this clean — all queries route through `src/clients/db.ts`.

---

## Phase 1: Setup & Introspect

### 1.1 Install dependencies

```bash
pnpm add drizzle-orm pg @paralleldrive/cuid2
pnpm add -D drizzle-kit @types/pg
```

(`pg` is already a devDependency — move to dependencies since Drizzle needs it at runtime via the driver adapter. `@paralleldrive/cuid2` replaces Prisma's application-level `cuid()` generation.)

### 1.2 Create Drizzle config — `drizzle.config.ts` (project root)

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

### 1.3 Introspect live DB

```bash
npx dotenvx run -- npx drizzle-kit introspect
```

This generates `src/db/schema.ts` with all 6 tables auto-mapped from the live PostgreSQL schema.

### 1.4 Generate initial migration

#### 1.4a Generate

```bash
npx drizzle-kit generate
```

Creates `drizzle/0000_initial.sql` — a snapshot of the current schema as Drizzle's baseline. This gives Drizzle its own migration table (`__drizzle_migrations`) without touching the existing Prisma `_prisma_migrations` table.

#### 1.4b Drop Prisma migrations table

After `drizzle-kit generate` produces `drizzle/0000_initial.sql`, append the following to the end of that file:

```sql
-- Drop the old Prisma migrations table (replaced by Drizzle)
DROP TABLE IF EXISTS "_prisma_migrations";
```

This ensures the first time `drizzle-kit migrate` runs in any environment, it cleans up the Prisma migration tracking table in the same atomic migration. No separate manual step needed.

### 1.5 Verify schema

Compare introspected `src/db/schema.ts` against `prisma/schema.prisma`:

- Confirm all 6 tables, columns, types, defaults, indexes, unique constraints
- Confirm `autobumpThreads` is `text[]` (PostgreSQL array)
- Confirm `operation` and `result` are `jsonb`
- Confirm FK relationships match (RESTRICT on delete based on migration history)
- Confirm `honeypotChannel`, `reminderChannel`, `aocKey`, `aocLeaderboardId` are nullable

### 1.6 Handle application-level cuid defaults

Prisma's `@default(cuid())` is **not** a database default — it generates the ID in the application layer before inserting. The database column is just `text` with no `DEFAULT` constraint. The introspected Drizzle schema will show plain `text` columns with no defaults for these fields, so we must add `$defaultFn` to replicate the behavior.

**Affected tables:**

| Table                    | Column | Prisma              | DB default |
| ------------------------ | ------ | ------------------- | ---------- |
| `ReputationLog`          | `id`   | `@default(cuid())`  | none       |
| `ReferralCode`           | `id`   | `@default(cuid())`  | none       |
| `Reminder`               | `id`   | `@default(cuid())`  | none       |
| `User`                   | `id`   | manual (Discord ID) | none       |
| `ServerChannelsSettings` | —      | `guildId` is PK     | —          |
| `AocLeaderboard`         | —      | `guildId` is PK     | —          |

**After introspection**, manually edit the 3 affected id columns in `src/db/schema.ts` to add the `$defaultFn`:

```ts
import { createId } from '@paralleldrive/cuid2';

// Before (raw introspection):
id: text('id').primaryKey();

// After (with cuid generation):
id: text('id')
  .primaryKey()
  .$defaultFn(() => createId());
```

This must be done **before** generating the initial migration in Phase 1.4, otherwise `drizzle-kit generate` will bake a `DEFAULT` into the SQL that doesn't exist in the real DB.

**Why `@paralleldrive/cuid2`:** It's the same cuid2 library Prisma uses internally. Produces collision-resistant, URL-safe IDs. Lightweight, zero-dependency.

---

## Phase 2: Create Drizzle Client

### 2.1 Create `src/db/index.ts` — replaces `src/clients/db.ts`

```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

let db: ReturnType<typeof createDb> | undefined;

function createDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool);
}

export function getDbClient() {
  if (!db) db = createDb();
  return db;
}

export async function disconnectDb() {
  if (db) {
    await db.$client.end();
    db = undefined;
  }
}
```

### 2.2 Update `src/clients/index.ts`

Re-export from `../db` instead of `./db`:

```ts
export * from '../db';
export * from './discord';
```

### 2.3 Delete old files

- Delete `src/clients/db.ts`
- Delete `src/clients/prisma/` (entire directory — 16 generated files)
- Delete `src/clients/.gitignore`

### 2.4 Remove `prisma.config.ts`

No longer needed.

---

## Phase 3: Translate Queries (7 files)

All files already use `getDbClient()` so the import path just changes. Query pattern mapping:

| Prisma                                               | Drizzle                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `db.user.findUnique({ where: { id } })`              | `db.select().from(users).where(eq(users.id, id)).limit(1)` → `[0]`      |
| `db.user.findFirst({ where, select })`               | `db.select({ col1, col2 }).from(t).where(...).limit(1)`                 |
| `db.user.findFirstOrThrow(...)`                      | Same as findFirst + throw if null                                       |
| `db.user.findMany({ where, orderBy, select, take })` | `db.select({...}).from(t).where(...).orderBy(...).limit(n)`             |
| `db.user.create({ data })`                           | `db.insert(t).values(data).returning()`                                 |
| `db.user.update({ where, data })`                    | `db.update(t).set(data).where(...).returning()`                         |
| `db.user.upsert({ where, update, create })`          | `db.insert(t).values(create).onConflictDoUpdate({ target, set })`       |
| `db.user.delete({ where })`                          | `db.delete(t).where(...).returning()`                                   |
| `db.user.deleteMany({ where })`                      | `db.delete(t).where(...)`                                               |
| `db.user.updateMany({ where, data })`                | `db.update(t).set(data).where(...)`                                     |
| `db.$transaction([p1, p2])`                          | `db.transaction((tx) => Promise.all([tx.insert(...), tx.update(...)]))` |

### Files to update:

1. **`src/slash-commands/reputation/utils.ts`** — findUnique, create, update, $transaction, findMany
2. **`src/slash-commands/autobump-threads/utils.ts`** — upsert (with array push), findFirstOrThrow, update (with filter), findMany
3. **`src/slash-commands/aoc-leaderboard/utils.ts`** — findFirst (with select), upsert, delete
4. **`src/slash-commands/server-settings/utils.ts`** — upsert (×3), findFirstOrThrow
5. **`src/slash-commands/referral/utils.ts`** — create, findFirst, findMany (with gte/lt), deleteMany, updateMany
6. **`src/slash-commands/reminder/utils.ts`** — create, findFirstOrThrow, update, findMany (with gte/lte), deleteMany (with `in`)
7. **`src/utils/honeypot-handler.ts`** — findMany (with `not: null`)

### Tricky patterns:

- **Array push** (`autobumpThreads: { push: threadId }`): Use `onConflictDoUpdate` with `sql` to reference the existing array and append:

```ts
await db
  .insert(serverChannelsSettings)
  .values({ guildId, autobumpThreads: [threadId] })
  .onConflictDoUpdate({
    target: serverChannelsSettings.guildId,
    set: {
      autobumpThreads: sql`array_append(${serverChannelsSettings.autobumpThreads}, ${threadId})`,
    },
  });
```

- **Global omit** (`aocKey: true` on `serverChannelsSettings`): Drizzle has no global omit — include all fields. Only `getAocSettings` actually reads `aocKey`, and it does so via explicit `select`, so this is fine.
- **`operation` field (JSON in ReputationLog)**: Store as `jsonb` column, insert as plain object

---

## Phase 4: Update Type Imports (5 files)

Replace Prisma-generated types with Drizzle inferred types:

```ts
// Add to src/db/schema.ts exports, or create src/db/types.ts:
import { type InferSelectModel } from 'drizzle-orm';
export type ReminderSelect = InferSelectModel<typeof reminders>;
```

### Files:

1. `src/slash-commands/aoc-leaderboard/index.ts` — `AocLeaderboard` → `InferSelectModel<typeof aocLeaderboards>`
2. `src/slash-commands/aoc-leaderboard/index.test.ts` — `JsonValue` → `Record<string, unknown>` or `AocLeaderboard` from local schema
3. `src/slash-commands/aoc-leaderboard/utils.ts` — `ServerChannelsSettings`, `InputJsonValue` → Drizzle types + plain JSON type
4. `src/slash-commands/autobump-threads/list-threads.ts` — `ServerChannelsSettings['autobumpThreads']` → `string[]`
5. `src/slash-commands/referral/referral-list.ts` — `ReferralCode` → `InferSelectModel<typeof referralCodes>`
6. `src/slash-commands/reminder/list.ts`, `reminder/utils.ts` — `Reminder` → `InferSelectModel<typeof reminders>`

---

## Phase 5: Update Test Infrastructure

### 5.1 `test/mocks/database/globalSetup.ts`

- Replace `pnpm run prisma:push` with `npx drizzle-kit push` (or `npx drizzle-kit migrate` for consistency with prod)
- Update log messages

### 5.2 `test/mocks/database/per-file-db.ts`

No changes needed (uses raw `pg` + `cleanDb` from db-seed, both DB-agnostic).

### 5.3 `test/fixtures/db-seed.ts`

Update query calls to Drizzle syntax (same as Phase 3 patterns).

---

## Phase 6: Update Build & Scripts

### 6.1 `package.json` scripts — replace:

```json
"drizzle:generate": "dotenvx run -- drizzle-kit generate",
"drizzle:introspect": "dotenvx run -- drizzle-kit introspect",
"drizzle:migrate": "dotenvx run -- drizzle-kit migrate",
"drizzle:push": "dotenvx run -- drizzle-kit push",
"drizzle:studio": "dotenvx run -- drizzle-kit studio",
"start": "pnpm drizzle:migrate && pnpm start:only"
```

Remove: `prisma:migrate`, `prisma:generate`, `prisma:studio`, `prisma:push`, `format` (remove `prisma format` part).

### 6.2 `tsdown.config.mts`

Ensure `src/db/**` is included in the build (it should be by default since it's under `src/`).

### 6.3 `Dockerfile`

Remove `COPY prisma ./prisma` and `RUN pnpm prisma:generate`. The Drizzle schema is TypeScript that gets bundled by tsdown, no generation step needed.

### 6.4 `pnpm-workspace.yaml`

Remove `@prisma/engines` and `prisma` from `allowBuilds`.

### 6.5 `vitest.config.mts`

Update coverage `exclude` to remove `src/clients/**.ts` reference (that directory is being deleted), optionally exclude `src/db/**` if you don't want to measure generated schema coverage.

### 6.6 `tsconfig.json`

No changes needed (already includes `src`).

---

## Phase 7: Update Telemetry

### `bin/telemetry.ts`

Remove `PrismaInstrumentation`:

```ts
// Remove: import { PrismaInstrumentation } from '@prisma/instrumentation';
// The @opentelemetry/auto-instrumentations-node already includes
// pg (node-postgres) instrumentation which traces all Drizzle queries.
// Just remove prismaInstrumentation from the instrumentations array.
```

If you want more granular Drizzle-specific spans, you can add a custom `pg` instrumentation config, but the auto-instrumentation covers it.

---

## Phase 8: Remove Prisma

### 8.1 Uninstall packages

```bash
pnpm remove @prisma/client @prisma/adapter-pg @prisma/client-runtime-utils @prisma/instrumentation prisma
```

### 8.2 Delete files

- `prisma/schema.prisma`
- `prisma.config.ts`
- `src/clients/db.ts`
- `src/clients/prisma/` (entire directory)
- `src/clients/.gitignore`
- `prisma/migrations/` (safe to delete — the `_prisma_migrations` table drop is already handled inside `drizzle/0000_initial.sql`)

### 8.3 Update `docker-compose.production.yml`

Remove `db-migrate` service (will be replaced by the new drizzle-migrate-service).

### 8.4 Clean up environment files

- **`.env.dist`**: Remove `DIRECT_DATABASE_URL` line (was Prisma-specific for `@prisma/adapter-pg` driver adapter, not needed by Drizzle's `node-postgres`)
- **`.env.ci`**: Remove `DIRECT_DATABASE_URL` line
- **`.env`** (local): Remove `DIRECT_DATABASE_URL` if present

---

## Phase 9: Drizzle Migrate Service (Separate Repo)

Create a new repo `drizzle-migrate-service` with:

### Dockerfile

```dockerfile
FROM node:24-slim
RUN npm install -g pnpm@11
WORKDIR /src
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
CMD ["npx", "drizzle-kit", "migrate"]
```

### docker-compose.production.yml update (in this repo)

```yaml
db-migrate:
  image: ghcr.io/viet-aus-it/drizzle-migrate-service
  volumes:
    - ./drizzle:/src/drizzle
    - ./drizzle.config.ts:/src/drizzle.config.ts
  env_file: '.env.production'
  container_name: discord_bot_db_migrate_prod
```

The service needs: `drizzle/` folder (SQL migrations), `drizzle.config.ts`, and `DATABASE_URL` env var.

---

## Phase 10: Cleanup & Verify

1. Run `pnpm run lint` — fix any new lint issues
2. Run `pnpm run typecheck` — verify no type errors
3. Run `pnpm run test` — all tests pass with Drizzle
4. Run `pnpm run build` — verify build succeeds
5. Delete `prisma/` directory if keeping migrations for reference is not needed
6. Update `.env.dist` and `.env.ci` — remove `DIRECT_DATABASE_URL` if no longer needed (was Prisma-specific for `@prisma/adapter-pg`)

---

## Phase 11: Update Documentation

All files referencing Prisma need updating to reflect the Drizzle migration.

### 11.1 `README.md`

- **Line 9**: `[Prisma](https://www.prisma.io/) ORM with PostgreSQL` → `[Drizzle](https://orm.drizzle.team/) ORM with PostgreSQL`

### 11.2 `docs/index.md`

- **Line 10**: `Build a feature with Prisma and PostgreSQL` → `Build a feature with Drizzle and PostgreSQL`
- **Line 36**: `Prisma models and relationships` → `Drizzle schema and relationships`

### 11.3 `docs/reference/02-pnpm-scripts.md`

- **Line 23 (format)**: Remove `and Prisma formatter` → `Format code with [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)`
- **Lines 29-37 (Database section)**: Replace entire section:

```markdown
## Database

| Script                        | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `pnpm run drizzle:migrate`    | Run database migrations                        |
| `pnpm run drizzle:generate`   | Generate Drizzle migration files               |
| `pnpm run drizzle:push`       | Push schema to database (no migration file)    |
| `pnpm run drizzle:studio`     | Open Drizzle Studio GUI                        |
| `pnpm run drizzle:introspect` | Introspect live DB and generate Drizzle schema |
```

### 11.4 `docs/reference/03-project-structure.md`

Replace lines 16-23 in the directory tree:

```
├── drizzle/                     # Generated Drizzle migrations
├── scripts/                     # Build and deployment scripts
├── src/
│   ├── clients/                 # Discord client initialisation
│   │   ├── discord.ts           # Discord.js client setup
│   ├── db/                      # Drizzle schema and client
│   │   ├── schema.ts            # Database schema definition
│   │   └── index.ts             # Drizzle client singleton
```

### 11.5 `docs/reference/04-database-schema.md`

- **Line 3**: `[Prisma](https://www.prisma.io/) models and relationships for the VAIT Discord Bot. The schema is defined in \`prisma/schema.prisma\`.`→`[Drizzle](https://orm.drizzle.team/) schema and relationships for the VAIT Discord Bot. The schema is defined in \`src/db/schema.ts\`.`
- Model tables remain the same (column names/types are identical)

### 11.6 `docs/reference/05-environment-variables.md`

- Remove `DIRECT_DATABASE_URL` row entirely (was Prisma-specific)

### 11.7 `docs/reference/07-testing-utilities.md`

- **Line 71**: `via [Prisma](https://www.prisma.io/)` → `via [Drizzle](https://orm.drizzle.team/)`

### 11.8 `docs/explanation/01-architecture.md`

- **Lines 23-27**: Replace the "Why Prisma with PrismaPg" section:

```markdown
## Why Drizzle ORM

[Drizzle](https://orm.drizzle.team/) was chosen as the ORM for its lightweight, type-safe query builder that maps closely to SQL without a code generation step. The schema is plain TypeScript — no compilation or binary engine required.

The database client uses a singleton pattern with lazy initialisation. This means the Drizzle instance is only created when the first database query is made, avoiding unnecessary connections during bot startup for commands that do not use the database.
```

- **Line 68**: `automatically captures Prisma/PostgreSQL queries` → `automatically captures PostgreSQL queries (via the pg driver, used by Drizzle)`

### 11.9 `docs/explanation/03-testing-strategy.md`

- **Line 9**: `with the actual [Prisma](https://www.prisma.io/) schema applied` → `with the actual [Drizzle](https://orm.drizzle.team/) schema applied`

### 11.10 `docs/tutorials/developers/02-database-backed-feature.md`

- **Line 3**: `using [Prisma](https://www.prisma.io/)` → `using [Drizzle](https://orm.drizzle.team/)`
- **Lines 18-23**: Replace schema update instructions:

````markdown
For this tutorial, reuse the existing `User` model and its `reputation` field. If your feature needs a new table, add it to `src/db/schema.ts` and run:

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
```
````

````

- **Lines 31-43 (Step 2 code)**: Rewrite `getOrCreateUser` in Drizzle syntax:

```typescript
import { eq } from 'drizzle-orm';
import { getDbClient } from '../../clients';
import { users } from '../../db/schema';

export const getOrCreateUser = async (userId: string) => {
  const db = getDbClient();

  let user = await db.select().from(users).where(eq(users.id, userId)).limit(1).then((rows) => rows[0]);
  if (!user) {
    [user] = await db.insert(users).values({ id: userId }).returning();
  }

  return user;
};
````

- **Lines 97-101 (Step 4 code)**: Rewrite `user.update` in Drizzle syntax:

```typescript
import { eq, sql } from 'drizzle-orm';
import { getDbClient } from '../../clients';
import { users } from '../../db/schema';

const db = getDbClient();
const [updated] = await db
  .update(users)
  .set({ reputation: sql`${users.reputation} + 1` })
  .where(eq(users.id, targetUser.id))
  .returning();
```

### 11.11 `docs/how-to/01-quick-start.md`

- **Line 44**: Remove `pnpm run prisma:generate` line entirely (Drizzle doesn't need a generate step — schema is bundled by tsdown)

### 11.12 `.agents/rules/patterns.md`

Replace the "Database (Prisma)" section (lines 12-19):

```markdown
## Database (Drizzle)

- **ORM**: [Drizzle](https://orm.drizzle.team/) with PostgreSQL (via `node-postgres`)
- **Migrations**: Create migrations with `pnpm run drizzle:generate`, apply with `pnpm run drizzle:migrate`
- **Schema**: Define in `src/db/schema.ts`
- **Client**: Import from `src/clients` (`getDbClient()`)
- **Transactions**: Use `db.transaction()` for atomic operations
- **Queries**: Use Drizzle's type-safe query builder — prefer `.select()`, `.insert()`, `.update()`, `.delete()` over raw SQL
```

### 11.13 `.agents/rules/communication.md`

- **Line 17**: `e.g. Discord.js, Prisma...` → `e.g. Discord.js, Drizzle...`

---

## File Change Summary

| Action            | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Create**        | `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`, `drizzle/0000_initial.sql`                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Edit (code)**   | 7 query files, 6 type-import files, `src/clients/index.ts`, `test/mocks/database/globalSetup.ts`, `test/fixtures/db-seed.ts`, `package.json`, `Dockerfile`, `docker-compose.production.yml`, `vitest.config.mts`, `pnpm-workspace.yaml`, `bin/telemetry.ts`                                                                                                                                                                                                                              |
| **Edit (docs)**   | `README.md`, `docs/index.md`, `docs/reference/02-pnpm-scripts.md`, `docs/reference/03-project-structure.md`, `docs/reference/04-database-schema.md`, `docs/reference/05-environment-variables.md`, `docs/reference/07-testing-utilities.md`, `docs/explanation/01-architecture.md`, `docs/explanation/03-testing-strategy.md`, `docs/tutorials/developers/02-database-backed-feature.md`, `docs/how-to/01-quick-start.md`, `.agents/rules/patterns.md`, `.agents/rules/communication.md` |
| **Delete**        | `src/clients/db.ts`, `src/clients/.gitignore`, `src/clients/prisma/` (16 files), `prisma/schema.prisma`, `prisma.config.ts`                                                                                                                                                                                                                                                                                                                                                              |
| **Separate repo** | `drizzle-migrate-service` (Dockerfile + drizzle config)                                                                                                                                                                                                                                                                                                                                                                                                                                  |

---

## Risk Notes

- **Zero-downtime migration**: The DB schema doesn't change — Drizzle reads the same tables. The migration is purely in application code.
- **Array operations** (`autobumpThreads`): The `push` via `array_append()` and `filter()` in JS is a direct translation; no schema change.
- **Global `omit`**: Prisma's `omit: { serverChannelsSettings: { aocKey: true } }` is removed. `aocKey` will now be returned in queries that select from `serverChannelsSettings`. Only `getAocSettings` reads it, and it does so via explicit `select` — so no behavioral change.
- **`_prisma_migrations` table**: Dropped in `drizzle/0000_initial.sql` via `DROP TABLE IF EXISTS "_prisma_migrations"`. No separate manual step needed.
