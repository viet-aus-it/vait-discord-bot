#!/bin/bash

echo "Please enter your discord bot token if you have one, or leave it blank:"
read BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
  echo "Remember to create your discord bot app and bot, and fill in the TOKEN field in the .env file later."
else
  echo "Token registered. This will be filled in your local env file."
fi

echo "Creating env files for discord bot"
cp .env.dist .env
sed -i'' -e "s/TOKEN=YOUR_BOT_TOKEN_HERE/TOKEN=${BOT_TOKEN}/g" .env

echo "Creating config file for discord bot"
cp config.dist.json config.json

NODE_VER=$(node --version)
PNPM_VER=$(pnpm --version)
if [[ $NODE_VER != *"16"* ]] || [[ $PNPM_VER != *"6"* ]]; then
  echo "Please ensure you are using the correct version of Node (v16) and/or PNPM (v6) or else you cannot install the dependencies."
else
  echo "Installing node dependencies"
  npm install
fi

echo "Pulling docker images"
docker compose pull --parallel

echo "Onboarding script finished."
if [ -z "$BOT_TOKEN" ]; then
  echo "Remember to create your discord bot app and bot, and fill in the TOKEN field in the .env file for the discord bot service to run."
  echo "After that, you should be able to run the bot service using 'npm run start'."
else
  echo "You should now be able to run the bot service using 'npm run start'."
fi
