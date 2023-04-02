import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { deployGlobalCommands } from '../commands/command';

const env = dotenv.config();
dotenvExpand.expand(env);

const deploy = async () => {
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';

  try {
    await deployGlobalCommands([], [], { token, clientId });
    process.exit();
  } catch (error) {
    console.error('Cannot delete commands', error);
  }
};

deploy();
process.on('SIGTERM', () => process.exit());
