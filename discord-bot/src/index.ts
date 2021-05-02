import { Client } from 'discord.js';
import { PrismaClient } from '@prisma/client';

import danhSomeone from './danhSomeone';
import mockSomeone from './mockSomeone';
import thanks from './thanks';
import ask8Ball from './8ball';

const { TOKEN } = process.env;
const client = new Client();
const prisma = new PrismaClient();
let botId: string | undefined;

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  botId = client.user?.id;
});

client.on('message', (msg) => {
  danhSomeone(msg, botId as any);
  mockSomeone(msg);
  ask8Ball(msg);
  thanks(msg, botId as any, prisma);
});

client.login(TOKEN);
process.on('SIGTERM', () => process.exit());
