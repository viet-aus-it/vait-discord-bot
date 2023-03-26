#!/bin/bash

echo "Please enter your discord bot token if you have one, or leave it blank:"
read BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
  echo "Remember to create your discord bot app and bot, and fill in the TOKEN field in the .env file later."
else
  echo "Token registered. This will be filled in your local env file."
fi

# Function to prompt user for input and set up environment variable
function prompt_and_set {
  read -p "$1" value
  if [ -z "$value" ]; then
    echo "Please fill in the $2 field in the .env file later."
  else
    echo "$2 registered. This will be filled in your local env file."
    export "$2"="$value"
  fi
}

# Ask user for bot token, client id, guild id and public key
prompt_and_set "Please enter your client id if you have one, or leave it blank:" CLIENT_ID
prompt_and_set "Please enter your bot public key if you have one, or leave it blank:" PUBLIC_KEY
prompt_and_set "Please enter your guild id if you have one, or leave it blank:" GUILD_ID

echo "Creating env files for discord bot"
cp .env.dist .env
sed -i'' -e "s/TOKEN=YOUR_BOT_TOKEN_HERE/TOKEN=${BOT_TOKEN}/g" .env
sed -i'' -e "s/CLIENT_ID=CLIENT_ID_GOES_HERE/CLIENT_ID=${CLIENT_ID}/g" .env
sed -i'' -e "s/PUBLIC_KEY=PUBLIC_KEY_GOES_HERE/PUBLIC_KEY=${PUBLIC_KEY}/g" .env
sed -i'' -e "s/#GUILD_ID=FOR_DEVELOPMENT_ONLY/GUILD_ID=${GUILD_ID}/g" .env

NODE_VER=$(node --version)
PNPM_VER=$(pnpm --version)
if [[ $NODE_VER != *"16"* ]] || [[ $PNPM_VER != *"6"* ]]; then
  echo "Please ensure you are using the correct version of Node (v16) and/or PNPM (v6) or else you cannot install the dependencies."
else
  echo "Installing node dependencies"
  pnpm install
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
