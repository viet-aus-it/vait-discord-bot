# Rule: Framework & Library Patterns

## Discord.js Patterns

- **Version**: discord.js v14
- **Commands**: Use `SlashCommandBuilder` from `@discordjs/builders`
- **Interactions**: Handle via `ChatInputCommandInteraction`, `ContextMenuCommandInteraction`
- **Permissions**: Check permissions before executing commands
- **Error Handling**: Catch and reply to user with meaningful error messages
- **Ephemeral**: Use ephemeral replies for error messages and sensitive data

## Database (Drizzle)

- **ORM**: [Drizzle](https://orm.drizzle.team/) with PostgreSQL (via `node-postgres`)
- **Migrations**: Create migrations with `pnpm run drizzle:generate`, apply with `pnpm run drizzle:migrate`
- **Schema**: Define in `src/clients/database/schema/schema.ts`; relations in `schema/relations.ts` via `defineRelations`
- **Client**: Import from `src/clients` (`getDbClient()`)
- **Reads**: Use the relational query builder — `db.query.<table>.findFirst()/findMany()` with the object filter shorthand (`where: { id, field: { gt: 0 } }`, `orderBy: { field: 'asc' }`, `columns`) over `.select()`
- **Mutations**: Use `.insert().returning()`, `.update().set()`, `.delete()`, `.onConflictDoUpdate()` — the RQB is read-only
- **Transactions**: Use `db.transaction()` for atomic operations
- **Raw SQL**: Use `sql\`...\``only where the query builder falls short (e.g. incrementing values,`array_append`)

## OpenTelemetry

- **Telemetry is compulsory**: Adding telemetry instrumentation is a required step when creating new commands or background tasks. Tracer utilities like `recordSpanError` are no-ops when OTel is disabled, so they have no impact on regular operation.
- See [Telemetry Reference](../../docs/reference/09-telemetry.md) for span lifecycle, attribute namespaces, and tracer API
- See [Why OpenTelemetry](../../docs/explanation/01-architecture.md#why-opentelemetry) for architecture decisions and the wide events pattern

## Testing

- **Framework**: Vitest with coverage
- **Mocking**: MSW for HTTP mocking, vitest-mock-extended for TypeScript mocks (Discord interactions)
- **Database Tests**: Use testcontainers for PostgreSQL with per-file DB isolation
  - Global setup (`test/mocks/database/globalSetup.ts`): starts a PostgreSQL container, runs migrations (creates template DB)
  - Per-file setup (`test/mocks/database/per-file-db.ts`): creates a unique DB per test file from the template, cleans data before each test via `beforeEach(cleanDb)`
  - Tests hit the real database — do NOT mock `./utils` functions that wrap DB calls
  - Use `vi.spyOn` only for error-path tests where DB errors cannot be triggered naturally
  - Seed test data using helpers from `test/fixtures/db-seed.ts` (`seedUser`, `seedServerSettings`, `seedReferralCode`, `seedReminder`)
- **Test Structure**: Arrange-Act-Assert pattern
- **Test Data**: Use fixtures from `/test/fixtures/`
- **Coverage**: Aim for high coverage but prioritize meaningful tests over 100% coverage
