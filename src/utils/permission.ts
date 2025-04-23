import type { GuildMember } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

export const isAdmin = (member: GuildMember | null) => {
  if (!member) return false;

  return member.permissions.has(PermissionFlagsBits.Administrator);
};

export const isModerator = (member: GuildMember | null) => {
  if (!member) return false;

  return member.roles.cache.some(({ name: roleName }) => roleName.toLowerCase() === 'moderator');
};
