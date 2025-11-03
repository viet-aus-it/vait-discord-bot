# AGENTS.md - Development Guidelines

## Commands
- **Build**: `pnpm build` (or `pnpm build:typecheck` for build with typecheck)
- **Lint**: `pnpm lint` (check) or `pnpm lint:fix` (fix)
- **Test**: `pnpm test` (all tests) or `pnpm test path/to/test.test.ts` (single test file)
- **Typecheck**: `pnpm typecheck`
- **Format**: `pnpm format`

## Code Style
- **Formatting**: 2 spaces, single quotes, semicolons, trailing commas (ES5), 160 char line width
- **Imports**: Use `type` imports for types (`import type { Foo } from 'bar'`), organize imports automatically
- **Types**: Strict TypeScript, prefer explicit types, `noExplicitAny` disabled but use sparingly
- **Naming**: camelCase for variables/functions, PascalCase for types/classes, UPPER_CASE for constants
- **Files**: kebab-case for file names, `.test.ts` suffix for tests
- **Comments**: DO NOT add comments unless explicitly requested
- **Error Handling**: Use Result types from `oxide.ts` library, log errors with winston logger
- **Exports**: Default export for main module, named exports for utilities
- **Database**: Use Prisma ORM, run migrations with `pnpm prisma:migrate`
- **Discord**: Use discord.js v14, follow slash command pattern in `/src/slash-commands/`
- **Testing**: Vitest with MSW for mocking, testcontainers for database tests

## Project Structure
- Commands in `/src/slash-commands/[command-name]/index.ts`
- Utilities in `/src/utils/`
- Database client in `/src/clients/db.ts`
