import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { getDiscordClient } from './clients';

const env = dotenv.config();
dotenvExpand.expand(env);

const autobump = async () => {
  const token = process.env.TOKEN ?? '';
  const client = await getDiscordClient({ token });
  process.exit(0);
  return undefined;
};

autobump();
