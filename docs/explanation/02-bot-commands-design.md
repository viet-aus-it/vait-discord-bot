# Bot Commands Design

The rationale behind command categories, the subcommand pattern, and how commands are structured.

## Command Categories

Commands are grouped by purpose to serve the VAIT community:

### Fun Commands

Lightweight, stateless commands for community engagement: `8ball`, `allcap`, `cowsay`, `disclaimer`, `danh-someone`, `insult`, `mock-someone`, `powerball`, `quote-of-the-day`.

These commands have no database dependency, making them simple to implement and test. They exist to keep the community chat lively.

### Community Utilities

Database-backed features that provide ongoing value: `reputation`, `referral`, `reminder`, `weather`, `aoc-leaderboard`.

These commands persist state across sessions. The reputation system encourages positive interactions, referrals share value within the community, and reminders provide personal utility.

### Moderation

Admin-only commands for server management: `moderate-users` (removeuserbyrole), `server-settings`, `autobump-threads`.

These require permission checks before execution and affect server-wide configuration.

## The Subcommand Pattern

Commands with multiple related operations use [discord.js](https://discord.js.org/) subcommands rather than separate top-level commands. This keeps the command namespace clean and groups related functionality.

**When to use subcommands:**
- The operations share a domain (e.g. reputation: check, give, take, set, leaderboard)
- The operations share utility functions or database models
- Grouping improves discoverability for users

**When to keep commands separate:**
- The command does one thing only (e.g. `8ball`, `cowsay`)
- The operations are unrelated

Current commands using subcommands: `reputation` (5 subcommands), `referral` (2 subcommands), `reminder` (5 subcommands).

## Command Interface Design

Every command implements the `SlashCommand` interface:

```typescript
interface SlashCommand {
  data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: SlashCommandHandler;
  autocomplete?: AutocompleteHandler;
}
```

The `data` field uses [discord.js builders](https://discord.js.org/docs/packages/builders/main) to define the command name, description, options, and permissions. The `execute` field is the async handler that processes the interaction.

Subcommands implement a separate `Subcommand` interface with a `SlashCommandSubcommandBuilder` for their data field.

## Context Menu Commands

The bot also supports context menu commands (right-click actions on messages or users) via the `ContextMenuCommand` interface. These are registered separately in `src/context-menu-commands/index.ts`. Currently no context menu commands are defined, but the infrastructure is in place.

## Design Decisions

- **One directory per command** — keeps commands self-contained and easy to find
- **Co-located tests** — tests live next to the code they test, not in a separate tree
- **Default exports for commands** — the main `SlashCommand` object is the default export, utility functions use named exports
- **Result types over exceptions** — explicit error handling using oxide.ts `Ok`/`Err` makes error paths visible in the type system
- **Lazy user creation** — database-backed commands create user records on first interaction rather than requiring pre-registration
