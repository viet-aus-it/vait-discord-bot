import 'dotenv/config';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const deploy = async () => {
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';

  const pingCommand = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!');

  const commands = [pingCommand].map((cmd) => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(token);
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log('Successfully register slash commands');
  } catch (error) {
    console.error('Cannot deploy commands', error);
  }
};

deploy();
