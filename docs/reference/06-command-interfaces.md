# Command Interfaces

API reference for the command type system used to define slash commands, subcommands, and context menu commands.

All interfaces are defined in `src/slash-commands/builder.ts` and `src/context-menu-commands/builder.ts`.

## SlashCommand

The primary interface for top-level slash commands.

```typescript
interface SlashCommand {
  data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: SlashCommandHandler;
  autocomplete?: AutocompleteHandler;
}
```

| Property       | Type                                                                   | Required | Description                                                                                   |
| -------------- | ---------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `data`         | `SlashCommandOptionsOnlyBuilder \| SlashCommandSubcommandsOnlyBuilder` | Yes      | [discord.js](https://discord.js.org/) builder defining command name, description, and options |
| `execute`      | `(interaction: ChatInputCommandInteraction) => Promise<void>`          | Yes      | Async handler called when the command is invoked                                              |
| `autocomplete` | `(autocomplete: AutocompleteInteraction) => Promise<void>`             | No       | Handler for autocomplete suggestions                                                          |

**File:** `src/slash-commands/builder.ts`

## Subcommand

Interface for subcommands within a parent slash command.

```typescript
interface Subcommand {
  data: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder);
  execute: SlashCommandHandler;
  autocomplete?: AutocompleteHandler;
}
```

| Property       | Type                                                          | Required | Description                            |
| -------------- | ------------------------------------------------------------- | -------- | -------------------------------------- |
| `data`         | `SlashCommandSubcommandBuilder \| (builder) => builder`       | Yes      | Subcommand builder or builder function |
| `execute`      | `(interaction: ChatInputCommandInteraction) => Promise<void>` | Yes      | Async handler for the subcommand       |
| `autocomplete` | `(autocomplete: AutocompleteInteraction) => Promise<void>`    | No       | Handler for autocomplete suggestions   |

**File:** `src/slash-commands/builder.ts`

## ContextMenuCommand

Interface for right-click context menu commands on messages or users.

```typescript
interface ContextMenuCommand {
  data: ContextMenuCommandBuilder;
  execute: ContextMenuCommandInteractionHandler;
}
```

| Property  | Type                                                            | Required | Description                                                                   |
| --------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `data`    | `ContextMenuCommandBuilder`                                     | Yes      | [discord.js](https://discord.js.org/) builder defining the context menu entry |
| `execute` | `(interaction: ContextMenuCommandInteraction) => Promise<void>` | Yes      | Async handler for the context menu action                                     |

**File:** `src/context-menu-commands/builder.ts`

## Type Aliases

```typescript
type SlashCommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;
type AutocompleteHandler = (autocomplete: AutocompleteInteraction) => Promise<void>;
type ContextMenuCommandInteractionHandler = (interaction: ContextMenuCommandInteraction) => Promise<void>;
```

## Registration

Commands are registered in their respective index files:

- **Slash commands:** `src/slash-commands/index.ts` — exports `commands: SlashCommand[]`
- **Context menu commands:** `src/context-menu-commands/index.ts` — exports `commandList: ContextMenuCommand[]`

Both arrays are consumed by `pnpm deploy:command` to register commands with the [Discord API](https://discord.com/developers/docs/interactions/application-commands).
