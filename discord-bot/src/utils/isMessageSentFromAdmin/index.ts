import { Guild, GuildMember } from 'discord.js';

export const SERVER_ID = {
  MAIN: '784198833815027742',
  TEST: '836907335263060028',
};

export const findAdminRoleByGuild = ({ id }: Guild) => {
  switch (id) {
    case SERVER_ID.MAIN:
      return ['Admin', 'Moderator'];

    case SERVER_ID.TEST:
      return ['VAIT Devs'];

    default:
      console.error('ERROR! INVALID GUILD');
      return [];
  }
};

export const isMessageSentFromAdmin = ({
  guild,
  member,
}: {
  guild: Guild | null;
  member: GuildMember | null;
}) => {
  if (!guild || !member) return false;

  const { roles } = member;
  if (!roles) return false;

  const adminRoles = findAdminRoleByGuild(guild);
  const hasAdminRole = roles.cache.some(({ name: roleName }) =>
    adminRoles.includes(roleName)
  );
  return hasAdminRole;
};
