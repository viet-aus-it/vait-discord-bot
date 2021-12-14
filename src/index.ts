import { processMessage } from './utils';
import { getDiscordClient } from './clients';
import { getConfigs } from './config';

const main = async () => {
  const { TOKEN } = process.env;
  const client = await getDiscordClient({
    token: TOKEN,
  });

  if (!client.user) throw new Error('Something went wrong!');
  console.log(`Logged in as ${client.user.tag}!`);

  const configs = getConfigs(client.user);
  client.on('message', (msg) => processMessage(msg, configs));
};

main();
process.on('SIGTERM', () => process.exit());
