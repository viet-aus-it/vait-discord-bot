import { addDays, getUnixTime } from 'date-fns';
import { Guild, SlashCommandSubcommandBuilder } from 'discord.js';
import { getDbClient } from '../../clients';
import { logger } from '../../utils/logger';
import { AutocompleteHandler, CommandHandler } from '../builder';
import { getOrCreateUser } from '../reputation/_helpers';
import { parseDate } from './parseDate';
import { searchServices, services } from './services';

export const DEFAULT_EXPIRY_DAYS_FROM_NOW = 30;

export const data = new SlashCommandSubcommandBuilder()
  .setName('new')
  .setDescription('add new referral code/link for service')
  .addStringOption((option) =>
    option.setName('service').setDescription('service to refer(type more than 3 characters to see suggestion)').setRequired(true).setAutocomplete(true)
  )
  .addStringOption((option) => option.setName('link_or_code').setDescription('referral link or code').setRequired(true))
  .addStringOption((option) =>
    option
      .setName('expiry_date')
      .setDescription(`when the code/link expired (DD/MM//YYYY). By default, it's ${DEFAULT_EXPIRY_DAYS_FROM_NOW} days from now.`)
      .setRequired(false)
  );

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('service', true);

  const options = searchServices(searchTerm);
  interaction.respond(options);
};

export const execute: CommandHandler = async (interaction) => {
  const code = interaction.options.getString('link_or_code', true);
  const service = interaction.options.getString('service', true).toLowerCase();
  logger.info(`[referral-new]: Adding new referral code for ${service} with code/link: ${code}`);

  const hasService = services.find((option) => option.toLowerCase() === service);
  if (!hasService) {
    logger.info(`[referral-new]: No service named ${service}.`);
    await interaction.reply(`No service named ${service}, ask the admin to add it`);
    return;
  }

  const expiryDateInput = interaction.options.getString('expiry_date', false);
  let expiryDate: Date;

  if (expiryDateInput) {
    const [parseDateCase, parsedExpiryDate] = parseDate(expiryDateInput);

    if (parseDateCase === 'INVALID_DATE') {
      logger.info(`[referral-new]: expiry_date is invalid date format input:${expiryDateInput}`);
      await interaction.reply('expiry_date is invalid date try format DD/MM/YYYY');
      return;
    }
    if (parseDateCase === 'EXPIRED_DATE') {
      logger.info(`[referral-new]: expiry_date is already expired input:${expiryDateInput}`);
      await interaction.reply('expiry_date has already expired');
      return;
    }

    expiryDate = parsedExpiryDate;
  } else {
    expiryDate = addDays(new Date(), 30);
  }

  const db = getDbClient();
  const guildId = (interaction.guild as Guild).id;
  const userId = interaction.user.id;
  const nickname = interaction.user.displayName;

  const existingReferralCode = await db.referralCode.findFirst({
    where: {
      service,
      userId,
      guildId,
    },
  });
  if (existingReferralCode) {
    logger.error(`[referral-new]: Referral code for ${service} by ${nickname} already exists.`);
    await interaction.reply(`You have already entered the referral code for ${service}.`);
    return;
  }

  try {
    const user = await getOrCreateUser(userId);
    const newReferralCode = await db.referralCode.create({
      data: {
        service,
        code,
        expiry_date: expiryDate,
        userId: user.id,
        guildId,
      },
    });

    await interaction.reply(
      `${nickname} just added referral code ${newReferralCode.code} in ${newReferralCode.service} expired on <t:${getUnixTime(newReferralCode.expiry_date)}:D>`
    );
  } catch (error) {
    logger.error('[referral-new]: Failed to add referral code.', error);
    await interaction.reply(
      'Failed to add referral code. This might be an error with the database, or the referral code already exists. Please try again later.'
    );
  }
};
