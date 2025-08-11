import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { AutocompleteHandler, SlashCommand, SlashCommandHandler } from '../builder';

import * as referralList from './referral-list';
import * as referralNew from './referral-new';
import * as referralRandom from './referral-random';
import * as referralRemove from './referral-remove';
import * as referralUpdate from './referral-update';

// referral new $SERVICE_NAME $LINK/CODE $EXPIRY_DATE(DD/MM/YYYY)
// referral random $SERVICE_NAME
// referral list
// referral update $ID $LINK/CODE $EXPIRY_DATE(DD/MM/YYYY)
// referral remove $ID

const subcommands = [referralNew, referralRandom, referralList, referralUpdate, referralRemove];

const getData = () => {
  const data = new SlashCommandBuilder()
    .setName('referral')
    .setDescription('Get referral code or link for services')
    .addSubcommand(referralNew.data)
    .addSubcommand(referralRandom.data)
    .addSubcommand(referralList.data)
    .addSubcommand(referralUpdate.data)
    .addSubcommand(referralRemove.data)
    .setContexts(InteractionContextType.Guild);

  return data;
};

const execute: SlashCommandHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(({ data: { name } }) => name === requestedSubcommand);
  return subcommand?.execute?.(interaction);
};

const autocomplete: AutocompleteHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(({ data: { name } }) => name === requestedSubcommand);
  // Only call autocomplete if the subcommand has it
  if (subcommand && 'autocomplete' in subcommand && typeof subcommand.autocomplete === 'function') {
    return (subcommand.autocomplete as AutocompleteHandler)(interaction);
  }
};

const command: SlashCommand = {
  data: getData(),
  execute,
  autocomplete,
};

export default command;
