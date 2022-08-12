import { Command } from './command.js';
import allCap from './allCap/index.js';
import ask8ball from './8ball/index.js';
import cowsayCommand from './cowsay/index.js';
import danhCommand from './danhSomeone/index.js';
import insultCommand from './insult/index.js';
import mockCommand from './mockSomeone/index.js';
import poll from './poll/index.js';
import quoteOfTheDay from './quoteOfTheDay/index.js';
import reputation from './reputation/index.js';
import weatherCommand from './weather/index.js';
import getdisclaimer from './disclaimer/index.js';
import referral from './referral/index.js';

export const commandList: Command[] = [
  allCap,
  ask8ball,
  cowsayCommand,
  danhCommand,
  insultCommand,
  mockCommand,
  poll,
  quoteOfTheDay,
  reputation,
  weatherCommand,
  getdisclaimer,
  referral,
];

export * from './reputation/index.js';
