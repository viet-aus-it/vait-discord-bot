import { processMessage } from './utils/messageProcessor';
import { getDiscordClient } from './clients/discord';
import { getConfigs } from './config';

const { TOKEN } = process.env;
getDiscordClient({
  token: TOKEN,
}).then((client) => {
  if (!client.user) throw new Error('Something went wrong!');
  console.log(`Logged in as ${client.user.tag}!`);

  const configs = getConfigs(client.user);
  client.on('message', (msg) => processMessage(msg, configs));
});

process.on('SIGTERM', () => process.exit());
