# Project Structure

Overview of the VAIT Discord Bot directory layout and conventions.

## Directory Tree

```
vait-discord-bot/
├── bin/                         # Executable entry points
│   ├── telemetry.ts             # OpenTelemetry SDK initialisation (loaded via --import)
├── docs/                        # Project documentation (Diataxis framework)
│   ├── tutorials/               # Learning-oriented guides
│   ├── how-to/                  # Task-oriented guides
│   ├── reference/               # Information-oriented lookup
│   └── explanation/             # Understanding-oriented discussion
├── prisma/
│   └── schema.prisma            # Database schema definition
├── scripts/                     # Build and deployment scripts
├── src/
│   ├── clients/                 # Database and Discord client initialisation
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── discord.ts           # Discord.js client setup
│   │   └── prisma/generated/    # Generated Prisma client
│   ├── context-menu-commands/   # Context menu command definitions
│   │   ├── builder.ts           # ContextMenuCommand interface
│   │   └── index.ts             # Command registry
│   ├── slash-commands/          # Slash command definitions
│   │   ├── builder.ts           # SlashCommand and Subcommand interfaces
│   │   ├── index.ts             # Command registry
│   │   └── [command-name]/      # Each command in its own directory
│   │       ├── index.ts         # Command definition and main handler
│   │       ├── index.test.ts    # Co-located tests
│   │       └── utils.ts         # Command-specific helpers (if needed)
│   └── utils/                   # Shared helper functions
│       ├── filtering-span-processor.ts  # Tail-based span sampling
│       ├── logger.ts            # Winston logger
│       ├── tracer.ts            # OpenTelemetry tracer singleton
│       └── ...
├── test/
│   ├── fixtures/                # Test data and mock builders
│   │   ├── chat-input-command-interaction.ts  # Vitest test extension
│   │   └── db-seed.ts           # Database seeding helpers
│   └── mocks/
│       ├── database/            # Testcontainer setup and per-file isolation
│       └── msw/                 # MSW HTTP mock server setup
├── .agents/                     # Agent rules and skills
│   ├── rules/                   # Domain-specific guidelines
│   └── skills/                  # Task-specific toolkits
└── .github/                     # GitHub templates and workflows
```

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Variables, functions | camelCase | `getUserData`, `messageContent` |
| Types, interfaces, classes | PascalCase | `UserData`, `CommandHandler` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Files | kebab-case | `user-reputation.ts`, `fetch-weather.ts` |
| Test files | `.test.ts` suffix | `index.test.ts` |
| Command directories | kebab-case | `8ball/`, `mock-someone/`, `quote-of-the-day/` |

## Key Patterns

- **One command per directory** — each slash command lives in `src/slash-commands/[command-name]/`
- **Co-located tests** — test files sit next to the source files they test
- **Default exports** — command modules use default export for the main `SlashCommand` object
- **Named exports** — utility functions use named exports
- **Import grouping** — external imports first, then internal, then types
