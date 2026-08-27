# Monorepo Plan: VAIT Discord Bot → Multi-Bot Microservices

## Decisions Made

1. **Package Manager**: pnpm workspaces + Turborepo (both)
2. **Data Persistence**: Shared DB with separate package for Prisma connection
3. **Code Sharing**: Shared packages approach
4. **Bot Tokens**: Separate Discord tokens per bot
5. **Database Schema**: Same schema, extended (game tables added to shared schema)
6. **Deployment**: Separate Docker containers per bot
7. **Caching**: Local only (no remote caching)

## Architecture Overview

```
vait-discord-bot/
├── apps/
│   ├── main-bot/      # VAIT main bot (current functionality)
│   └── game-bot      # Minigame bot (new)
├── packages/
│   ├── db/            # Prisma client + connection (shared)
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # Shared utilities (logger, tracer, etc.)
│   └── config/        # Shared config/environment handling
├── pnpm-workspace.yaml
├── turbo.json
└── package.json       # Root workspace config
```

## Step-by-Step Implementation

### Phase 1: Workspace Foundation

1. Create `pnpm-workspace.yaml`
   - Define `apps/` and `packages/` as workspaces

2. Create `turbo.json`
   - Local caching only
   - Define build, test, lint, typecheck tasks

3. Update root `package.json`
   - Remove app-specific scripts
   - Add workspace-level scripts
   - Keep devDependencies for tooling (biome, turbo, etc.)

4. Move `biome.json` to root

5. Create root `tsconfig.json` as base

### Phase 2: Create Shared Packages

1. **`packages/db`**:
   - Move `prisma/schema.prisma` here
   - Create `src/index.ts` exporting PrismaClient + connection
   - Add game-related tables to schema
   - Package name: `@vait/db`

2. **`packages/config`**:
   - Move `src/config.ts` here
   - Move env loading from `src/utils/load-env.ts`
   - Package name: `@vait/config`

3. **`packages/types`**:
   - Extract shared types
   - Package name: `@vait/types`

4. **`packages/utils`**:
   - Move pure utilities (logger, tracer - no Discord dependency)
   - Package name: `@vait/utils`

### Phase 3: Migrate Main Bot

1. Create `apps/main-bot/`
2. Move `bin/*.ts` → `apps/main-bot/src/`
3. Create `apps/main-bot/package.json`:
   - Name: `@vait/main-bot`
   - Depend on `packages/*`
   - Scripts: build, start, test, etc.
4. Move configs: `tsdown.config.mts`, `vitest.config.mts`
5. Update imports to use workspace packages

### Phase 4: Create Game Bot

1. Create `apps/game-bot/`
2. Create `src/main.ts` with minimal bot setup
3. Create `apps/game-bot/package.json`:
   - Name: `@vait/game-bot`
   - Depend on `packages/*`
4. Create configs
5. Add `.env` with different Discord token

### Phase 5: Docker/Deployment

1. Create `Dockerfile.main-bot`
2. Create `Dockerfile.game-bot`
3. Update `docker-compose.production.yml`

## Risks & Considerations

- Circular dependencies: packages must not depend on apps
- Prisma client: single generated client for both bots
- Shared utilities: Keep Discord-specific code in apps
- Migration: Test each phase before proceeding
