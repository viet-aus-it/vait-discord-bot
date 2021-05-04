# VAIT Discord Bot Project

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

---

## Onboarding

### Using the onboarding script

For most UNIX-like users (macOS & Linux), you should be fine with running the
onboarding script. Please ensure that you have all of the required
programs/executable are installed on your machine before running the script.
If somehow the script does not work for you, please let us know via the Issue
tab or ping us on Discord, and you might need to follow through the manual
process.

```shell
./onboarding.sh
```

### Manually

Note: After copying out the .env file, remember to FILL IT IN for the bot to
work.

```shell
nvm use # If you have nvm

# Creating env files and installing dependencies for discord-bot
cd discord-bot
cp .env.sample .env
cp .env.docker.sample .env.docker
yarn install
cd ..

# Building the docker services
docker-compose build
docker-compose up
```

---

## Notes on working with the repo

### How to run commands inside the container

- While the bot is running, you can open a new terminal window and run
  this command: `docker-compose <service-name> command`

```bash
docker-compose exec bot yarn test
```

- To run a command intereractively with a command prompt inside the
  container, run this comand: `docker-compose <service-name> bash`

```bash
docker-compose exec bot bash
```

- The service name is defined within the [docker-compose.yml](/docker-compose.yml) file.

---

## Filling in ENV files for the discord bot

- The `.env` can be ignored for now.
- The `.env.docker` file needs to be filled in with these values:
  - `DB_HOST`: db
  - `DB_USER`, `DB_PASSWORD`, `DB`: You can fill in whatever you like with these,
    since it only affects your local dev environment. But please keep it
    consistent since if you lose it, you will lose access to your local
    database and will need to re-create it.
  - `TOKEN`: You will need to create your own app and bot for the token.
    Follow the instructions on
    [discord.js guide on setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html "Discord js guide")
    on how to create a Discord Bot, with its token and client ID. When
    you're done, we will add your bot into a test server so you can test it
    out.

---

## DB migration for backend bot

```shell
docker-compose exec bot yarn prisma:migrate
docker-compose exec bot yarn prisma:gen
```

## Running tests

```shell
docker-compose up -d
docker-compose exec bot yarn test
docker-compose stop
```
