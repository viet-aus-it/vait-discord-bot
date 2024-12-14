import ask8ball from './8ball';
import allCap from './all-cap';
import getAocLeaderboard from './aoc-leaderboard';
import autobumpThread from './autobump-threads';
import type { SlashCommand } from './builder';
import cowsayCommand from './cowsay';
import danhCommand from './danh-someone';
import getdisclaimer from './disclaimer';
import insultCommand from './insult';
import mockCommand from './mock-someone';
import removeUserByRole from './moderate-users';
import playPowerball from './powerball';
import quoteOfTheDay from './quote-of-the-day';
import referral from './referral';
import reminder from './reminder';
import reputation from './reputation';
import serverSettings from './server-settings';
import weatherCommand from './weather';

export const commands: SlashCommand[] = [
  allCap,
  ask8ball,
  autobumpThread,
  cowsayCommand,
  danhCommand,
  insultCommand,
  mockCommand,
  playPowerball,
  quoteOfTheDay,
  reputation,
  weatherCommand,
  getdisclaimer,
  referral,
  reminder,
  serverSettings,
  removeUserByRole,
  getAocLeaderboard,
];
