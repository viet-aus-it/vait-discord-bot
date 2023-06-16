import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { deployGuildCommands } from '../commands/deploy-command';

const env = dotenv.config();
dotenvExpand.expand(env);

const deploy = async () => {
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';

  const op = await deployGuildCommands([], [], {
    token,
    clientId,
    guildId,
  });
  if (op.success) {
    process.exit();
    return;
  }

  console.error('Cannot delete commands', op.error);
};

deploy();
process.on('SIGTERM', () => process.exit());
