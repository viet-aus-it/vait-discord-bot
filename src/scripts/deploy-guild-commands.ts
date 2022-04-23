import 'dotenv/config';
import 'dotenv-expand/config';
import { deployGuildCommands } from '../commands/command';
import { commandList } from '../commands';

const deploy = async () => {
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';

  try {
    await deployGuildCommands(commandList, { token, clientId, guildId });
    process.exit();
  } catch (error) {
    console.error('Cannot deploy commands', error);
  }
};

deploy();
process.on('SIGTERM', () => process.exit());
