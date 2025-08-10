import { getUnixTime } from 'date-fns';
import { type Guild, SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler } from '../builder';
import { getUserReferralCodes } from './utils';

export const data = new SlashCommandSubcommandBuilder().setName('list').setDescription('List all your current referral codes/links');

export const execute: SlashCommandHandler = async (interaction) => {
  const guildId = (interaction.guild as Guild).id;
  const userId = interaction.user.id;
  const nickname = interaction.user.displayName;

  logger.info(`[referral-list]: Getting referral codes for user ${nickname} (${userId})`);

  const op = await Result.safe(getUserReferralCodes({ userId, guildId }));
  if (op.isErr()) {
    logger.error('[referral-list]: Error while getting user referral codes', op.unwrapErr());
    await interaction.reply('This might be an error with the database. Please try again later.');
    return;
  }

  const referrals = op.unwrap();
  if (referrals.length === 0) {
    logger.info(`[referral-list]: User ${nickname} has no referral codes.`);
    await interaction.reply('You have no referral codes in the system.');
    return;
  }

  // Create a table format message
  const tableHeader = '```\n| ID       | Service Name\n|----------|-------------';
  const tableRows = referrals
    .map((referral: any) => {
      const shortId = referral.id.substring(0, 8); // Show first 8 characters of ID
      const serviceName = referral.service.length > 20 ? `${referral.service.substring(0, 17)}...` : referral.service;
      return `| ${shortId} | ${serviceName}`;
    })
    .join('\n');
  const table = `${tableHeader}\n${tableRows}\n\`\`\``;

  // Add additional info with full details
  const detailsHeader = '\n**Full Details:**';
  const details = referrals
    .map((referral: any) => {
      const expiryTimestamp = getUnixTime(referral.expiry_date);
      return `• **${referral.service}** (ID: \`${referral.id}\`)\n  Code: \`${referral.code}\`\n  Expires: <t:${expiryTimestamp}:D>`;
    })
    .join('\n\n');

  const fullMessage = `**Your Referral Codes:**\n${table}${detailsHeader}\n${details}`;

  // Discord has a 2000 character limit for messages, so we need to handle that
  if (fullMessage.length <= 2000) {
    await interaction.reply(fullMessage);
  } else {
    // If message is too long, send table first, then details
    await interaction.reply(`**Your Referral Codes:**\n${table}`);

    // Split details into chunks if needed
    const detailsMessage = `${detailsHeader}\n${details}`;
    if (detailsMessage.length <= 2000) {
      await interaction.followUp(detailsMessage);
    } else {
      // Send each referral detail separately if still too long
      await interaction.followUp(detailsHeader);
      for (const referral of referrals) {
        const expiryTimestamp = getUnixTime(referral.expiry_date);
        const singleDetail = `**${referral.service}** (ID: \`${referral.id}\`)\nCode: \`${referral.code}\`\nExpires: <t:${expiryTimestamp}:D>`;
        await interaction.followUp(singleDetail);
      }
    }
  }
};
