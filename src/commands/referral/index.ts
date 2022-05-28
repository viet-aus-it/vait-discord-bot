import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteHandler, Command, CommandHandler } from '../command';

import * as referralNew from './referralNew';
import * as referralRandom from './referralRandom';
// referral new $SERVICE_NAME $LINK/CODE $EXPIRY_DATE(DD/MM/YYYY)
// referral random $SERVICE_NAME

const subcommands = [referralNew, referralRandom];

const getData = () => {
  const data = new SlashCommandBuilder()
    .setName('referral')
    .setDescription('Get referral code or link for services')
    .addSubcommand(referralNew.data)
    .addSubcommand(referralRandom.data);

  return data;
};

const autocomplete: AutocompleteHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(
    ({ data: { name } }) => name === requestedSubcommand
  );
  return subcommand?.autocomplete?.(interaction);
};

const execute: CommandHandler = async (interaction) => {
  const requestedSubcommand = interaction.options.getSubcommand(true);
  const subcommand = subcommands.find(
    ({ data: { name } }) => name === requestedSubcommand
  );
  return subcommand?.execute?.(interaction);
};

const command: Command = {
  data: getData(),
  execute,
  autocomplete,
};

export default command;
