import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { Result } from 'oxide.ts';
import { deployGuildCommands } from '../commands/deploy-command';
import { commandList, contextMenuCommandList } from '../commands';

const env = dotenv.config();
dotenvExpand.expand(env);

const deploy = async () => {
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
