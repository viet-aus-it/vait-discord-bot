#!/bin/bash

echo "Setting up git-hooks"
git config core.hooksPath githooks

echo "Please enter your discord bot token if you have one, or leave it blank:"
read BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
  echo "Remember to create your discord bot app and bot, and fill in the TOKEN field in the .env.docker file later."
else
  echo "Token registered. This will be filled in your local env file."
fi

echo "Creating env files for discord-bot"
cd discord-bot
cp .env.docker.dist .env.docker

sed -i'' -e "s/TOKEN=YOUR_BOT_TOKEN_HERE/TOKEN=${BOT_TOKEN}/g" .env.docker

NODE_VER=$(node --version)
if [[ $NODE_VER != *"14"* ]]; then
  echo "Please ensure you are using the correct version of Node (v14+) or else you cannot install the dependencies."
else
  echo "Installing node dependencies"
  yarn install
fi

echo "Building docker services"
docker-compose build

echo "Going back to root directory"
cd ..

echo "Onboarding script finished."
if [ -z "$BOT_TOKEN"]; then
  echo "Remember to create your discord bot app and bot, and fill in the TOKEN field in the .env.docker file for the discord bot service to run."
  echo "After that, you should be able to run the bot service using docker-compose up."
else
  echo "You should now be able to run the bot service using 'docker-compose up'."
fi
