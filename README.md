# VAIT Discord Bot Project

## Table of contents

- [VAIT Discord Bot Project](#vait-discord-bot-project)
  - [Table of contents](#table-of-contents)
  - [Forewords](#forewords)
  - [Requirements](#requirements)
  - [Contributions](#contributions)
  - [Onboarding](#onboarding)
    - [Creating your discord app and bot](#creating-your-discord-app-and-bot)
    - [Creating the config files](#creating-the-config-files)
      - [Using the onboarding script](#using-the-onboarding-script)
      - [Manually](#manually)
    - [Build and run the service locally](#build-and-run-the-service-locally)
  - [Useful commands](#useful-commands)
    - [DB migration](#db-migration)
    - [Running tests](#running-lints-and-tests)
    - [Testing staging/production build](#testing-stagingproduction-build)

test
## Forewords

This documentation below is for **contributing** to the bot. For bot commands and usage,
please visit [our Wiki page](https://github.com/viet-aus-it/vait-discord-bot/wiki).

---

## Requirements

- [Node 16+](https://nodejs.org/en/)
- [PNPM 6+](https://pnpm.io/)
- Docker 20+, Docker Compose 1.28+

## Contributions

For Contributions, please have a look these document

- [GIT_DEV_GUIDELINE.md](.github/GIT_DEV_GUIDELINE.md) [MUST READ]
- [CONTRIBUTORS.md](.github/CONTRIBUTING.md) [MUST READ]

---

## Onboarding

### Creating your discord app and bot

You will need to manually create a new discord application and a new bot. Please check out [Create a Bot Application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
and [Adding a bot to your servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html) for more details.

### Creating the config files

#### Using the onboarding script

On most UNIX-like systems (macOS, Linux and WSL), you should be able to run the
onboarding script. This script will create a local dev environment file, install
dependencies, build the docker containers and set up a pre-commit git hook.

```shell
./scripts/onboarding.sh
```

Please ensure that you have all the required programs/executable are
installed on your machine before running the script. If somehow the script
does not work for you, please let us know via the Issue tab or ping us on
Discord, and you might need to follow through the manual process.

#### Manually

After creating your discord app and bot, create config file and fill in the values you get from the previous step

```bash
cp .env.dist .env
```

- The `.env` file needs to be filled in with these values:
  - Discord configs:
    - `TOKEN`: Your bot token created in previous step
    - `GUILD_ID`: The guild ID that you want to use your bot with to test out commands
    - `PUBLIC_KEY`: Your bot public key.
    - `CLIENT_ID`: The client ID of your bot
  - DB Values: We already fill in some defaults for this to work in a local environment.
    - `POSTGRES_HOST`: localhost
    - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: You can fill in whatever
      you like with these or just leave it with default value, since it only affects
      your local dev environment. But please keep it consistent since if you lose it,
      you will lose access to your local database and will need to re-create it.

**Note:** **DO NOT** commit the `.env` file to Git.

### Build and run the service locally

Run these commands at the root of the project

```bash
docker compose up -d db

pnpm install
pnpm deploy:command
pnpm start
```

---

## Useful commands

### DB migration

```bash
pnpm prisma:migrate
pnpm prisma:gen
```

### Deploying your commands to a test Discord Server

- Please make sure you have filled out your `GUILD_ID`, `TOKEN` and `CLIENT_ID`
  in the `.env` file.
- Add your commands into the `src/command/index.ts` file like so.

```typescript
import yourCommand from './yourCommand';

export const commandList: Command[] = [yourCommand];
```
- Run the `deploy:command` command.

```bash
pnpm deploy:command
```

- **IMPORTANT:** You should only deploy your commands **ONCE ONLY** after
there is a change in command registration (adding a new command, editing
options of an existing one). Running this too many times in a short period
of time will cause Discord API to **lock your bot out**.

- **NOTE:** When deploy slash commands, if you got `Error: Cannot deploy commands`, it's normally because of your bot doesn't have permission to do so. You need to authorize your bot with scope: `bot` and `applications.commands` using `https://discord.com/api/oauth2/authorize?client_id=$CLIENT_ID&permissions=0&scope=bot%20applications.commands`

### Running lints and tests

```bash
pnpm format
pnpm test
```

---

## Testing staging/production build

- Copy out an env file for the stage you're testing. Use `.env.staging` for staging, and `.env.production` for production.
- Build the staging/production stage image.
- Start the service to test.
- For the `.env.[stage]` file, instead of `localhost`, put in `db` as the `POSTGRES_HOST`.

```bash
# Replace the `[stage]` with either `production` or `staging`
cp .env.dist .env.[stage]
docker compose -f docker-compose.yml -f docker-compose.[stage].yml build bot
docker compose -f docker-compose.yml -f docker-compose.[stage].yml up db bot
```
