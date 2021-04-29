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
cp dashboard/.env.sample dashboard/.env
docker-compose build
docker-compose up
```

To migrate db

```shell
docker-compose exec bot yarn prisma:migrate
docker-compose exec bot yarn prisma:generate
```
