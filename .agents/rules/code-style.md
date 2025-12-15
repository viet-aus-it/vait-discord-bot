# Rule: Code Style & Conventions

## Formatting

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Trailing commas**: ES5 style (no trailing commas in function parameters)
- **Line width**: 160 characters maximum
- **Line endings**: LF (Unix-style)

## TypeScript

- **Imports**: Use `import type { ... }` for type-only imports
- **Types**: Prefer explicit types, avoid `any` (use sparingly when absolutely necessary)
- **Strict mode**: Enabled (`strict: true` in tsconfig)
- **Type inference**: Let TypeScript infer when obvious, be explicit when clarity is needed

## Naming Conventions

- **Variables/Functions**: camelCase (`getUserData`, `messageContent`)
- **Types/Interfaces/Classes**: PascalCase (`UserData`, `CommandHandler`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Files**: kebab-case (`user-reputation.ts`, `fetch-weather.ts`)
- **Test Files**: `.test.ts` suffix (`index.test.ts`)
- **Private members**: Prefix with `_` when needed (`_internalState`)

## Project Structure

- **Slash Commands**: `/src/slash-commands/[command-name]/index.ts`
  - Each command in its own directory
  - Main export is the command definition
  - Helper functions in same directory or utilities
- **Context Menu Commands**: `/src/context-menu-commands/[command-name]/index.ts`
- **Utilities**: `/src/utils/` (shared helper functions)
- **Clients**: `/src/clients/` (database, discord client initialization)
- **Tests**: Co-located with source files (e.g., `index.test.ts` next to `index.ts`)
- **Fixtures**: `/test/fixtures/` (test data and mock builders)
- **Scripts**: `/scripts/` (build and deployment scripts)
- **Bin**: `/bin/` (executable entry points)

## Code Organization

- **Exports**: Default export for main module, named exports for utilities
- **Imports**: Group by external, internal, then types
- **Error Handling**: Use Result types from `oxide.ts` library (`Ok`, `Err`)
- **Logging**: Use winston logger via `src/utils/logger.ts`
- **Comments**: DO NOT add comments unless explicitly requested or required for complex logic
