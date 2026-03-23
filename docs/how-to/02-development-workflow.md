# Development Workflow

Day-to-day development practices for contributing to the VAIT Discord Bot.

## Branching

- Create a new branch from `master` for every task, feature, or bug fix.
- Use these prefixes:
  - `feature/` — new features
  - `release/` — release branches
  - `hotfix/` — urgent fixes
  - `support/` — support branches
- Reference the issue number in the branch name: e.g. `feature/#9_referral_link`

## Commits

- Make small, atomic commits.
- Do not commit vendor/compiled code.
- Do not commit commented-out code, just delete it.
- Explain the **why**, not the **what**, in your commit message. The diff shows what changed.

```
# Bad
Updated index.js field

# Good
Remove debug statement from index.js
```

- Reference the issue number in the commit message:

```
#9 Remove debug statement from index.js
```

- Rebase instead of merge to resolve conflicts. Do not rebase or amend if your branch has already been pulled by someone else.

## Code Quality Checks

Before pushing, run:

```bash
pnpm lint
pnpm test
```

For auto-formatting:

```bash
pnpm format
```

See [pnpm Scripts](../reference/02-pnpm-scripts.md) for the full list of available commands.

## Pull Requests

1. Fork the repo and create your branch from `master`.
2. Follow the [Quick Start](./01-quick-start.md) setup steps.
3. Add unit tests for new features.
4. Ensure linting and tests pass.
5. Push your branch and submit a pull request.
6. Before creating the PR:
   - Add an entry to the CHANGELOG.
   - Rebase onto the latest `master` to avoid merge conflicts.
   - Reference the issue number in the changelog entry.

## Code Style

- 2 spaces for indentation (no tabs)
- Single quotes for strings
- Always use semicolons
- 160 character line width maximum
- Run `pnpm format` to auto-format with [Biome](https://biomejs.dev/)

See [Project Structure](../reference/03-project-structure.md) for naming conventions and directory layout.

## Pre-commit Hooks

[Husky](https://typicode.github.io/husky/) runs linting and formatting before each commit. If the hook fails, fix the issues before committing.
