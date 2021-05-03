import { Client } from 'discord.js';

import danhSomeone from './danhSomeone';
import { processMessage } from './messageProcessor';
import { getDefaultConfig, initializeConfig } from './utils/config';

const { TOKEN } = process.env;
const client = new Client();
let botId: string | undefined;

const config = initializeConfig(getDefaultConfig());

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  botId = client.user?.id;
});

client.on('message', (msg) => {
  danhSomeone(msg, botId as any);
  processMessage(msg, config);
});

client.login(TOKEN);
process.on('SIGTERM', () => process.exit());
