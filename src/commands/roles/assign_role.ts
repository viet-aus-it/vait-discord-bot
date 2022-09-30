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
  const roleName = roles.find((role) => role.value === roleId)?.name;

  if (!roleName) {
    await interaction.reply('Please select a role from the provided list');
    return;
  }

  (interaction.member?.roles as GuildMemberRoleManager)
    .add(roleId)
    .then(async () => {
      await interaction.reply(`Role ${roleName} has been assigned to you`);
    })
    .catch(async (error) => {
      if (error.rawError.code === 10011) {
        return interaction.reply(`Role ${roleName} does not exist`);
      }

      await interaction.reply(
        `${error.rawError.code}: ${error.rawError.message}`
      );
    });
};

// role does not exist
// something wrong
// ok
