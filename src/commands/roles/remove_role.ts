import {
  GuildMemberRoleManager,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { AutocompleteHandler, CommandHandler } from '../command';
import { roles, searchRoles } from './roles';

export const data = new SlashCommandSubcommandBuilder()
  .setName('remove')
  .setDescription('remove your existing role')
  .addStringOption((option) =>
    option
      .setName('role')
      .setDescription('role from your role list')
      .setRequired(true)
      .setAutocomplete(true)
  );

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const roleIds = Array.from(
    (interaction.member?.roles as GuildMemberRoleManager).cache
  ).map(([id]) => id);

  const userRoles = roles.filter((role) => roleIds.includes(role.value));

  const searchTerm = interaction.options.getString('role', true);
  const options = searchRoles(searchTerm, userRoles);

  interaction.respond(options);
};

export const execute: CommandHandler = async (interaction) => {
  const roleId = interaction.options.getString('role', true).toLowerCase();

  (interaction.member?.roles as GuildMemberRoleManager).remove(roleId);

  const roleName = roles.find((role) => role.value === roleId)?.name;
  await interaction.reply(`Role ${roleName} has been removed from you`);
};
