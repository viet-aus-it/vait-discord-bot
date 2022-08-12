import type { GuildMember } from 'discord.js';
import { PermissionsBitField } from 'discord.js';

export const isAdmin = (member: GuildMember | null) => {
  if (!member) return false;

  return member.permissions.has(PermissionsBitField.Flags.Administrator);
};

export const isModerator = (member: GuildMember | null) => {
  if (!member) return false;

  return member.roles.cache.some(
    ({ name: roleName }) => roleName.toLowerCase() === 'moderator'
  );
};
