import ask8ball from './8ball';
import allCap from './allCap';
import autobumpThread from './autobump-threads';
import type { Command, ContextMenuCommand } from './builder';
import pinMessageContextMenuCommand from './contextMenuCommands/pin';
import cowsayCommand from './cowsay';
import danhCommand from './danhSomeone';
import getdisclaimer from './disclaimer';
import insultCommand from './insult';
import mockCommand from './mockSomeone';
import removeUserByRole from './moderateUsers';
import poll from './poll';
import playPowerball from './powerball';
import quoteOfTheDay from './quoteOfTheDay';
import referral from './referral';
import reminder from './reminder';
import reputation from './reputation';
import serverSettings from './serverSettings';
import weatherCommand from './weather';

export const commandList: Command[] = [
  allCap,
  ask8ball,
  autobumpThread,
  cowsayCommand,
  danhCommand,
  insultCommand,
  mockCommand,
  poll,
  playPowerball,
  quoteOfTheDay,
  reputation,
  weatherCommand,
  getdisclaimer,
  referral,
  reminder,
  serverSettings,
  removeUserByRole,
];

export const contextMenuCommandList: ContextMenuCommand[] = [pinMessageContextMenuCommand];

export * from './reputation';
