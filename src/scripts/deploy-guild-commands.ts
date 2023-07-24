import { Result } from 'oxide.ts';
import { deployGuildCommands } from '../commands/deploy-command';
import { commandList, contextMenuCommandList } from '../commands';
import { loadEnv } from '../utils/loadEnv';

const deploy = async () => {
  loadEnv();
  const token = process.env.TOKEN ?? '';
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';

  const op = await Result.safe(
    deployGuildCommands(commandList, contextMenuCommandList, {
      token,
      clientId,
      guildId,
    })
  );
  if (op.isOk()) {
    process.exit(0);
  }

  console.error('Cannot deploy commands', op.unwrapErr());
  process.exit(1);
};

deploy();
