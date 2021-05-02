# VAIT Discord Bot Project

## Requirements

- Node 14+
- NPM 6+
- Yarn 1.22+
- Docker 20+, docker-compose 1.28+

## Contributions

For Contributions, please have a look at our [CONTRIBUTORS.md](.github/CONTRIBUTING.md)

## Working with this repo

Note: After copying out the .env file, remember to FILL IT IN for the bot to
work.

```shell
git clone https://github.com/viet-aus-it/vait-discord-bot.git
cd vait-discord-bot
nvm use # If you have nvm
cp discord-bot/.env.sample discord-bot/.env
cp discord-bot/.env.docker.sample discord-bot/.env.docker
cp dashboard/.env.sample dashboard/.env
docker-compose build
docker-compose up
```

## Filling in ENV files for the discord bot

- The `.env` can be ignored for now.
- The `.env.docker` file needs to be filled in with these values:
  - DB_HOST: db
  - DB_USER, DB_PASSWORD, DB: You can fill in whatever you like with these,
    since it only affects your local dev environment. But please keep it
    consistent since if you lose it, you will lose access to your local
    database and will need to re-create it.
  - TOKEN: You will need to create your own app and bot for the token.
    Follow the instructions on
    [discord.js guide on setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html "Discord js guide")
    on how to create a Discord Bot, with its token and client ID. When
    you're done, we will add your bot into a test server so you can test it
    out. :D

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
