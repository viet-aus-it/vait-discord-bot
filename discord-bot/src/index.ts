import { Client } from 'discord.js';
import { PrismaClient } from '@prisma/client';

import pingPong from './pingPong';
import danhSomeone from './danhSomeone';
import thanks from './thanks';

const { TOKEN } = process.env;
const client = new Client();
const prisma = new PrismaClient();
let botId: string | undefined;

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  botId = client.user?.id;
});

client.on('message', (msg) => {
  pingPong(msg);
  danhSomeone(msg);
  thanks(msg, botId as any, prisma);
});

client.login(TOKEN);
process.on('SIGTERM', () => process.exit());
