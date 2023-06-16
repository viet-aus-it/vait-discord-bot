import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { deployGlobalCommands } from '../commands/deploy-command';

const env = dotenv.config();
dotenvExpand.expand(env);

const deploy = async () => {
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';

  const op = await deployGlobalCommands([], [], {
    token,
    clientId,
  });
  if (op.success) {
    process.exit();
    return;
  }

  console.error('Cannot delete commands', op.error);
};

deploy();
process.on('SIGTERM', () => process.exit());
