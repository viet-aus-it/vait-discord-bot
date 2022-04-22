import 'dotenv/config';
import 'dotenv-expand/config';
import { deployCommands } from './commands/command';
import { commandList } from './commands';

const deploy = async () => {
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';

  try {
    await deployCommands(commandList, { token, clientId, guildId });
  } catch (error) {
    console.error('Cannot deploy commands', error);
  }
};

deploy();
process.on('SIGTERM', () => process.exit());
