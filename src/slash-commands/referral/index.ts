import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { AutocompleteHandler, SlashCommand, SlashCommandHandler } from '../builder';

import * as referralDelete from './referral-delete';
import * as referralList from './referral-list';
import * as referralNew from './referral-new';
import * as referralRandom from './referral-random';
import * as referralUpdate from './referral-update';

// referral new $SERVICE_NAME $LINK/CODE $EXPIRY_DATE(DD/MM/YYYY)
// referral random $SERVICE_NAME

const subcommands = [referralNew, referralRandom, referralList, referralUpdate, referralDelete];

const getData = () => {
  const data = new SlashCommandBuilder()
    .setName('referral')
    .setDescription('Get referral code or link for services')
    .addSubcommand(referralNew.data)
    .addSubcommand(referralRandom.data)
    .addSubcommand(referralList.data)
    .addSubcommand(referralUpdate.data)
    .addSubcommand(referralDelete.data)
    .setContexts(InteractionContextType.Guild);

  return data;
};

const autocomplete: AutocompleteHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(({ data: { name } }) => name === requestedSubcommand);
  return subcommand?.autocomplete?.(interaction);
};

const execute: SlashCommandHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(({ data: { name } }) => name === requestedSubcommand);
  return subcommand?.execute?.(interaction);
};

const command: SlashCommand = {
  data: getData(),
  execute,
  autocomplete,
};

export default command;
