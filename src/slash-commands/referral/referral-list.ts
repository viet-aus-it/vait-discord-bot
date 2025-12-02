import { format } from 'date-fns';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Result } from 'oxide.ts';
import type { ReferralCode } from '../../clients/prisma/generated/client/client';
import { logger } from '../../utils/logger';
import type { SlashCommandHandler } from '../builder';
import { getUserReferralCodes } from './utils';

export const data = new SlashCommandSubcommandBuilder().setName('list').setDescription('Get a list of your referral codes');

export const MAX_REFERRAL_CODE_LENGTH = 36;

export const buildReferralList = (referrals: ReferralCode[]) => {
  const serviceLength = Math.max(...referrals.map((referral) => referral.service.length), 'service'.length);
  let codeLength = Math.max(...referrals.map((referral) => referral.code.length), 'code'.length);
  codeLength = Math.min(codeLength, MAX_REFERRAL_CODE_LENGTH);
  const expiryLength = 'expiry date'.length;
  const header = `| ${'service'.padEnd(serviceLength, ' ')} | ${'code'.padEnd(codeLength, ' ')} | ${'expiry date'.padEnd(expiryLength, ' ')} |\n| ${'-'.repeat(serviceLength)} | ${'-'.repeat(codeLength)} | ${'-'.repeat(expiryLength)} |\n`;
  return referrals.reduce((accum, { service, code, expiry_date }) => {
    const paddedService = service.padEnd(serviceLength, ' ');
    const paddedCode = code.slice(0, MAX_REFERRAL_CODE_LENGTH).padEnd(codeLength, ' ');
    const formattedExpiry = format(expiry_date, 'dd/MM/yyyy');
    const paddedExpiry = formattedExpiry.padEnd(expiryLength, ' ');
    return `${accum}| ${paddedService} | ${paddedCode} | ${paddedExpiry} |\n`;
  }, header);
};

export const execute: SlashCommandHandler = async (interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;

  logger.info(`[referral-list]: Getting referral codes for user ${userId} in guild ${guildId}`);

  const op = await Result.safe(getUserReferralCodes({ userId, guildId }));
  if (op.isErr()) {
    logger.error('[referral-list]: Error while retrieving referral codes', op.unwrapErr());
    await interaction.reply('There is some error retrieving your referral codes. Please try again later.');
    return;
  }

  const referrals = op.unwrap();
  if (referrals.length === 0) {
    logger.info(`[referral-list]: No referral codes found for user ${userId}`);
    await interaction.reply("You currently don't have any referral codes set up.");
    return;
  }

  logger.info(`[referral-list]: Found ${referrals.length} referral codes for user ${userId}`);
  const table = buildReferralList(referrals);
  await interaction.reply(`\`\`\`\n${table}\`\`\``);
};
