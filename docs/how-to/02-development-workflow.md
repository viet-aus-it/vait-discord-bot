# Development Workflow

Day-to-day development practices for contributing to the VAIT Discord Bot.

## Create a Branch

Create a new branch from `master` for every task:

```bash
git checkout -b feature/#9_referral_link
```

Use these prefixes: `feature/`, `release/`, `hotfix/`, `support/`. Reference the issue number in the branch name.

## Make Commits

```bash
git add src/slash-commands/your-command/
git commit -m "#9 Add referral link command"
```

Keep commits small and atomic. Reference the issue number in the message.

## Run Quality Checks

Before pushing:

```bash
pnpm lint
pnpm test
```

To auto-format:

```bash
pnpm format
```

See [pnpm Scripts](../reference/02-pnpm-scripts.md) for the full list.

## Submit a Pull Request

1. Rebase onto the latest `master`:

```bash
git fetch origin
git rebase origin/master
```

2. Push your branch:

```bash
git push -u origin feature/#9_referral_link
```

3. Open a pull request on [GitHub](https://github.com/viet-aus-it/vait-discord-bot/pulls). Add a CHANGELOG entry referencing the issue number.

See [Project Structure](../reference/03-project-structure.md) for naming conventions and directory layout.
