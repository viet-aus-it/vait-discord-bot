import { Result } from 'oxide.ts';
import { deployGlobalCommands } from '../commands/deploy-command';
import { loadEnv } from '../utils/loadEnv';

const deploy = async () => {
  loadEnv();
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';

  const op = await Result.safe(
    deployGlobalCommands([], [], {
      token,
      clientId,
    })
  );
  if (op.isOk()) {
    process.exit(0);
  }

  console.error('Cannot delete commands', op.unwrapErr());
  process.exit(1);
};

deploy();
