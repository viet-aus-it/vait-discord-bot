# Rule: Framework & Library Patterns

## Discord.js Patterns

- **Version**: discord.js v14
- **Commands**: Use `SlashCommandBuilder` from `@discordjs/builders`
- **Interactions**: Handle via `ChatInputCommandInteraction`, `ContextMenuCommandInteraction`
- **Permissions**: Check permissions before executing commands
- **Error Handling**: Catch and reply to user with meaningful error messages
- **Ephemeral**: Use ephemeral replies for error messages and sensitive data

## Database (Prisma)

- **ORM**: Prisma with PostgreSQL adapter
- **Migrations**: Always create migrations with `pnpm prisma:migrate`
- **Schema**: Define in `prisma/schema.prisma`
- **Client**: Import from `src/clients/db.ts`
- **Transactions**: Use Prisma transactions for atomic operations
- **Queries**: Prefer Prisma's type-safe query builder over raw SQL

## OpenTelemetry

- **Telemetry is compulsory**: Adding telemetry instrumentation is a required step when creating new commands or background tasks. All tracer utilities (`recordSpanError`, `setSpanAttributes`) are no-ops when OTel is disabled, so they have no impact on regular operation.
- **Error recording**: All error paths must call `recordSpanError(error, slug)` from `src/utils/tracer.ts`
- **Span attributes**: Prefer constants from `@opentelemetry/semantic-conventions` when the attribute matches an existing [OTel Semantic Convention](https://opentelemetry.io/docs/specs/semconv/). Only create custom `discord.*` attributes when no standard convention applies.
- See [Why OpenTelemetry](../docs/explanation/01-architecture.md#why-opentelemetry) for architecture decisions, wide events pattern, and attribute conventions

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
