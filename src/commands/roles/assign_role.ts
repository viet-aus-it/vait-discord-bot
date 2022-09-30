import {
  GuildMemberRoleManager,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { AutocompleteHandler, CommandHandler } from '../command';
import { roles, searchRoles } from './roles';

export const data = new SlashCommandSubcommandBuilder()
  .setName('assign')
  .setDescription('Assign new role to yourself')
  .addStringOption((option) =>
    option
      .setName('role')
      .setDescription('role from the role list')
      .setRequired(true)
      .setAutocomplete(true)
  );

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('role', true);

  const options = searchRoles(searchTerm);
  interaction.respond(options);
};

export const execute: CommandHandler = async (interaction) => {
  const roleId = interaction.options.getString('role', true).toLowerCase();

  (interaction.member?.roles as GuildMemberRoleManager).add(roleId);

  const roleName = roles.find((role) => role.value === roleId)?.name;
  await interaction.reply(`Role ${roleName} has been assigned to you`);
};
