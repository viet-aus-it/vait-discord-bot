import 'dotenv/config';
import 'dotenv-expand/config';
import { processMessage } from './utils';
import { getDiscordClient } from './clients';
import { getConfigs } from './config';

const main = async () => {
  const client = await getDiscordClient({ token: process.env.TOKEN });

  if (!client.user) throw new Error('Something went wrong!');
  console.log(`Logged in as ${client.user.tag}!`);

  const configs = getConfigs(client.user);
  client.on('messageCreate', (msg) => processMessage(msg, configs));
};

main();
process.on('SIGTERM', () => process.exit());
