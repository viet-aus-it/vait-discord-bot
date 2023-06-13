import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { deployGuildCommands } from '../commands/builder';

const env = dotenv.config();
dotenvExpand.expand(env);

const deploy = async () => {
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';

  try {
    await deployGuildCommands([], [], { token, clientId, guildId });
    process.exit();
  } catch (error) {
    console.error('Cannot delete commands', error);
  }
};

deploy();
process.on('SIGTERM', () => process.exit());
