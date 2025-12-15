# Framework & Library Patterns

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

## Testing
- **Framework**: Vitest with coverage
- **Mocking**: MSW for HTTP mocking, vitest-mock-extended for TypeScript mocks
- **Database Tests**: Use testcontainers for PostgreSQL
- **Test Structure**: Arrange-Act-Assert pattern
- **Test Data**: Use fixtures from `/test/fixtures/`
- **Coverage**: Aim for high coverage but prioritize meaningful tests over 100% coverage
