# pnpm Scripts

All available scripts for the VAIT Discord Bot.

## Development

| Script                     | Description                                 |
| -------------------------- | ------------------------------------------- |
| `pnpm install`             | Install dependencies                        |
| `pnpm run start`           | Run bot locally with database migrations    |
| `pnpm run start:only`      | Run bot without migrations, with hot reload |
| `pnpm run build`           | Production build                            |
| `pnpm run build:typecheck` | Build after running type checks             |
| `pnpm run typecheck`       | Type checking only                          |

## Code Quality

| Script                     | Description                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm run lint`            | Check for linting issues with [Oxlint](https://oxc.rs/docs/guide/usage/linter)           |
| `pnpm run lint:fix`        | Auto-fix linting issues with [Oxlint](https://oxc.rs/docs/guide/usage/linter)            |
| `pnpm run lint:fix:unsafe` | Auto-fix linting issues with [Oxlint](https://oxc.rs/docs/guide/usage/linter)            |
| `pnpm run format`          | Format code with [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) and Prisma formatter |
| `pnpm run test`            | Run all tests                                                                            |
| `pnpm run test <path>`     | Run a specific test file                                                                 |
| `pnpm run test:silent`     | Run tests without console output                                                         |
| `pnpm run ci`              | Run full CI checks locally                                                               |

## Database

| Script                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `pnpm run prisma:migrate` | Run database migrations                          |
| `pnpm run prisma:gen`     | Generate [Prisma](https://www.prisma.io/) client |
| `pnpm run prisma:push`    | Push schema to database (no migration file)      |
| `pnpm run prisma:studio`  | Open Prisma Studio GUI                           |

## Discord Commands

| Script                           | Description                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm run deploy:command`        | Deploy commands to guild (**use sparingly**, see [Deploy Commands](../how-to/03-deploy-commands.md)) |
| `pnpm run delete:command`        | Remove guild commands                                                                                |
| `pnpm run delete:command-global` | Remove global commands                                                                               |

## Special

| Script                     | Description                          |
| -------------------------- | ------------------------------------ |
| `pnpm run build:referrals` | Generate referral list from database |
