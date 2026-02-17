# Quick Start

Set up a local development environment for the VAIT Discord Bot.

## Prerequisites

- [Node.js](https://nodejs.org/en/) 22+
- [PNPM](https://pnpm.io/) 10+
- [Docker](https://www.docker.com/) 20+ and Docker Compose 1.28+
- A Discord application and bot (see Step 1)

## Step 1: Create a Discord Application and Bot

1. Follow the [discord.js guide to create a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) and [add it to your server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html).
2. In the [Discord Developer Portal](https://discord.com/developers/applications), go to **Bot** and enable **Privileged Gateway Intents > Message Content Intent**.
3. When generating the OAuth2 URL, under **Bot Permissions > General Permissions**, enable **Administrator**.
4. Note down these values:
   - **TOKEN** — from the Bot section
   - **PUBLIC KEY** — from General Information
   - **CLIENT ID** — from OAuth2
   - **GUILD ID** — right-click your server title in Discord (with Developer Mode enabled in Settings > Advanced) and select "Copy ID"

## Step 2: Run the Onboarding Script

On macOS, Linux, or WSL:

```bash
./scripts/onboarding.sh
```

If the script does not work, create the config file manually:

```bash
cp .env.dist .env
```

Fill in the `.env` file with the values from Step 1. See [Environment Variables](../reference/05-environment-variables.md) for the full reference.

## Step 3: Build and Run

```bash
docker compose up -d db lgtm
pnpm install
pnpm run prisma:gen
pnpm run deploy:command
pnpm run start
```

## Next Steps

- [Development Workflow](./02-development-workflow.md)
- [Build Your First Slash Command](../tutorials/developers/01-your-first-slash-command.md)
- [pnpm Scripts](../reference/02-pnpm-scripts.md)
