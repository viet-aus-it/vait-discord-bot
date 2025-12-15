# Rule: Commands Reference

## Development

- **Install**: `pnpm install` (install dependencies)
- **Start**: `pnpm start` (run bot locally with database migrations)
- **Start Only**: `pnpm start:only` (run bot without migrations, with hot reload)
- **Build**: `pnpm build` (production build)
- **Build with Typecheck**: `pnpm build:typecheck` (build after typecheck)
- **Typecheck**: `pnpm typecheck` (type checking only)

## Code Quality

- **Lint**: `pnpm lint` (check for linting issues)
- **Lint Fix**: `pnpm lint:fix` (auto-fix safe linting issues)
- **Lint Fix Unsafe**: `pnpm lint:fix:unsafe` (auto-fix including unsafe transformations)
- **Format**: `pnpm format` (format code with Biome and Prisma formatter)
- **Test**: `pnpm test` (run all tests)
- **Test Single File**: `pnpm test path/to/test.test.ts` (run specific test file)
- **Test Silent**: `pnpm test:silent` (run tests without console output)
- **CI Check**: `pnpm ci` (run full CI checks locally)

## Database

- **Migrate**: `pnpm prisma:migrate` (run database migrations)
- **Generate**: `pnpm prisma:gen` (generate Prisma client)
- **Studio**: `pnpm prisma:studio` (open Prisma Studio GUI)

## Discord Commands

- **Deploy Commands**: `pnpm deploy:command` (deploy commands to guild, use sparingly to avoid rate limits)
- **Delete Guild Commands**: `pnpm delete:command` (remove guild commands)
- **Delete Global Commands**: `pnpm delete:command-global` (remove global commands)

## Special

- **Build Referrals**: `pnpm build:referrals` (generate referral list from database)
