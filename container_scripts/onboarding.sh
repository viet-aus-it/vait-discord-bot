#!/bin/bash

echo "Please enter your discord bot token if you have one, or leave it blank:"
read BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
  echo "Remember to create your discord bot app and bot, and fill in the TOKEN field in the .env.docker file later."
else
  echo "Token registered. This will be filled in your local env file."
fi

echo "Creating env files for discord bot"
cp .env.docker.dist .env.docker

sed -i'' -e "s/TOKEN=YOUR_BOT_TOKEN_HERE/TOKEN=${BOT_TOKEN}/g" .env.docker

NODE_VER=$(node --version)
NPM_VER=$(npm --version)
if [[ $NODE_VER != *"16"* ]] || [[ $NPM_VER != *"8"* ]]; then
  echo "Please ensure you are using the correct version of Node (v16) or NPM (v8) or else you cannot install the dependencies."
else
  echo "Installing node dependencies"
  npm install
fi

echo "Building docker services"
docker-compose build

echo "Onboarding script finished."
if [ -z "$BOT_TOKEN" ]; then
  echo "Remember to create your discord bot app and bot, and fill in the TOKEN field in the .env.docker file for the discord bot service to run."
  echo "After that, you should be able to run the bot service using docker-compose up."
else
  echo "You should now be able to run the bot service using 'docker-compose up'."
fi
