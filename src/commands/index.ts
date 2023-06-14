import { Command, ContextMenuCommand } from './builder';
import allCap from './allCap';
import ask8ball from './8ball';
import autobumpThread from './autobump-threads';
import cowsayCommand from './cowsay';
import danhCommand from './danhSomeone';
import insultCommand from './insult';
import mockCommand from './mockSomeone';
import poll from './poll';
import quoteOfTheDay from './quoteOfTheDay';
import reputation from './reputation';
import weatherCommand from './weather';
import getdisclaimer from './disclaimer';
import referral from './referral';
import reminder from './reminder';
import roles from './roles';
import playPowerball from './powerball';
import pinMessageContextMenuCommand from './contextMenuCommands/pin';
import serverSettings from './serverSettings';
import removeUserByRole from './moderateUsers';

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
  roles,
  serverSettings,
  removeUserByRole,
];

export const contextMenuCommandList: ContextMenuCommand[] = [
  pinMessageContextMenuCommand,
];

export * from './reputation';
