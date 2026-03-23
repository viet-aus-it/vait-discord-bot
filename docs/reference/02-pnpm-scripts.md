# pnpm Scripts

All available scripts for the VAIT Discord Bot.

## Development

| Script | Description |
|--------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm start` | Run bot locally with database migrations |
| `pnpm start:only` | Run bot without migrations, with hot reload |
| `pnpm build` | Production build |
| `pnpm build:typecheck` | Build after running type checks |
| `pnpm typecheck` | Type checking only |

## Code Quality

| Script | Description |
|--------|-------------|
| `pnpm lint` | Check for linting issues |
| `pnpm lint:fix` | Auto-fix safe linting issues |
| `pnpm lint:fix:unsafe` | Auto-fix including unsafe transformations |
| `pnpm format` | Format code with [Biome](https://biomejs.dev/) and Prisma formatter |
| `pnpm test` | Run all tests |
| `pnpm test <path>` | Run a specific test file |
| `pnpm test:silent` | Run tests without console output |
| `pnpm ci` | Run full CI checks locally |

## Database

| Script | Description |
|--------|-------------|
| `pnpm prisma:migrate` | Run database migrations |
| `pnpm prisma:gen` | Generate [Prisma](https://www.prisma.io/) client |
| `pnpm prisma:push` | Push schema to database (no migration file) |
| `pnpm prisma:studio` | Open Prisma Studio GUI |

## Discord Commands

| Script | Description |
|--------|-------------|
| `pnpm deploy:command` | Deploy commands to guild (**use sparingly**, see [Deploy Commands](../how-to/03-deploy-commands.md)) |
| `pnpm delete:command` | Remove guild commands |
| `pnpm delete:command-global` | Remove global commands |

## Special

| Script | Description |
|--------|-------------|
| `pnpm build:referrals` | Generate referral list from database |
