# VAIT Discord Bot Project

## Table of contents

- [Requirements](#requirements)
- [Contributions](#contributions)
- [Onboarding](#onboarding)
  - [Creating your discord app and bot](#creating-your-discord-app-and-bot)
  - [Creating the config files](#creating-the-config-files)
  - [Install node dependencies](#install-node-dependencies)
  - [Build and run docker container](#build-and-run-docker-container)
- [Notes on working with the repo](#notes-on-working-with-the-repo)
  - [How to run commands inside the container](#how-to-run-commands-inside-the-container)
- [Docker related commands](#docker-related-commands)
  - [For the bot service container](#for-the-bot-service-container)

***

## Requirements

- [Node 14+](https://nodejs.org/en/)
- NPM 6+ (comes bundled with Node installation)
- [Yarn 1.22+](https://classic.yarnpkg.com/en/docs/install/)
- Docker 20+, Docker Compose 1.28+
  - For macOS and Windows: The easiest way is to install [Docker Desktop](https://www.docker.com/products/docker-desktop "docker desktop").
    This will come with Docker and Docker Compose in a bundle.
  - For Linux Users: You would need to:
    - Install [Docker Engine](https://docs.docker.com/engine/install/#server "docker engine") on
    - Follow the [Linux post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/ "Linux post-installation steps").
    - Install [Docker Compose](https://docs.docker.com/compose/install/ "docker compose")

## Contributions

For Contributions, please have a look at our [CONTRIBUTORS.md](.github/CONTRIBUTING.md)

***

## Onboarding

### Creating your discord app and bot

You will need to manually create a new discord application and a new bot. Please check out[this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) for more details

### Creating the config files

#### Using the onboarding script

On most UNIX-like systems (macOS, Linux and WSL), you should be able to run the
onboarding script. This script will create a local dev environment file, install
dependencies, build the docker containers and set up a pre-commit git hook.

```shell
./onboarding.sh
```

Please ensure that you have all of the required programs/executable are
installed on your machine before running the script. If somehow the script
does not work for you, please let us know via the Issue tab or ping us on
Discord, and you might need to follow through the manual process.

#### Manually

After creating your discord app and bot, create config file and fill in the values you get from the previous step

```bash
cd discord-bot/
cp .env.dist .env
cp .env.docker.dist .env.docker
```

- The `.env` can be ignored for now.
- The `.env.docker` file needs to be filled in with these values:
  - `DB_HOST`: db
  - `DB_USER`, `DB_PASSWORD`, `DB`: You can fill in whatever you like with these or just leave it with default value,
    since it only affects your local dev environment. But please keep it
    consistent since if you lose it, you will lose access to your local
    database and will need to re-create it.
  - `TOKEN`: Your bot token created in previous step

### Install node dependency

```bash
cd discord-bot/
yarn install
```

### Build and run docker container

```bash
# On the root folder of the project RUN
docker-compose up
# OR
docker composer up -d # to run the container in the background (detach mode)
```

### Setting up the pre-commit git hook

```bash
git config core.hooksPath githooks
```

***

## Notes on working with the repo

### How to run commands inside the container

On most UNIX-like systems (macOS, Linux and WSL), you can just use the `discord-bot/container-exec.sh` bash script:

```bash
# multiline command - interactive mode - allow us to run multiple command
./container-exec.sh

# or just run a specific command
./container-exec.sh yarn test # run yarn install inside the container
```

If you can't or don't want to use `./container-exec.sh` wrapper script then you can run it manually:

- `docker-compose <service-name> command`

```bash
docker-compose exec discord_bot_dev yarn test
# same as ./container-exec.sh yarn test
```

```bash
# Run interactive mode, multiple command
docker exec -it discord_bot_dev bash
# same as ./container-exec.sh
```

- To run a command intereractively with a command prompt inside the
  container, run this comand: `docker-compose <service-name> bash`

- The service name is defined within the [docker-compose.yml](/docker-compose.yml) file.

***

## Docker related commands

### For the bot service container

#### DB migration

```bash
# Run this inside the container
yarn prisma:migrate
yarn prisma:gen
```

#### Running tests

```bash
# Run this inside the container
yarn test
```
