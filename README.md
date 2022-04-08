# VAIT Discord Bot Project

## Table of contents

- [VAIT Discord Bot Project](#vait-discord-bot-project)
  - [Table of contents](#table-of-contents)
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
    - [Running tests](#running-tests)
    - [Testing staging/production build](#testing-stagingproduction-build)

---

## Requirements

- [Node 16+](https://nodejs.org/en/)
- NPM 8+ (comes bundled with Node installation)
- Docker 20+, Docker Compose 1.28+

## Contributions

For Contributions, please have a look these document

- [GIT_DEV_GUIDELINE.md](.github/GIT_DEV_GUIDELINE.md) [MUST READ]
- [CONTRIBUTORS.md](.github/CONTRIBUTING.md) [MUST READ]

---

## Onboarding

### Creating your discord app and bot

You will need to manually create a new discord application and a new bot. Please check out[this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) for more details

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
cp config.dist.json config.json
```

- The `.env` file needs to be filled in with these values:
  - DB Values: We already fill in some defaults for this to work in a local environment.
    - `POSTGRES_HOST`: localhost
    - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: You can fill in whatever
      you like with these or just leave it with default value, since it only affects
      your local dev environment. But please keep it consistent since if you lose it,
      you will lose access to your local database and will need to re-create it.
  - `TOKEN`: Your bot token created in previous step
- The `config.json` needs to be filled in with the config needed to run the commands:
  - `prefix` is needed for the bot to trigger a command.

### Build and run the service locally

Run these commands at the root of the project

```bash
docker compose u -d db

npm install
npm run start
```

---

## Useful commands

### DB migration

```bash
# Run this inside the container
npm run prisma:migrate
npm run prisma:gen
```

### Running tests

```bash
# Run this inside the container
npm run test
```

### Testing staging/production build

- Copy out an env file for the stage you're testing. Use `.env.staging` for staging, and `.env.production` for production.
- Build the staging/production stage image.
- Start the service to test.
- For the `.env.[stage]` file, instead of `localhost`, put in `db` as the `POSTGRES_HOST`.

```bash
# Substitute the `[stage]` with either `production` or `staging`
cp .env.dist .env.[stage]
docker compose -f docker-compose.yml -f docker-compose.[stage].yml build bot
docker compose -f docker-compose.yml -f docker-compose.[stage].yml up db bot
```
