import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { getPrismaClient } from '../../clients';
import { AutocompleteHandler, CommandHandler } from '../command';
import { parseDate } from './parseDate';
import { searchServices, services } from './services';

export const data = new SlashCommandSubcommandBuilder()
  .setName('new')
  .setDescription('add new referral code/link for service')
  .addStringOption((option) =>
    option
      .setName('service')
      .setDescription(
        'service to refer(type more than 3 characters to see suggestion)'
      )
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option
      .setName('link_or_code')
      .setDescription('referral link or code')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('expiry_date')
      .setDescription('when the code/link expired (MM/DD/YYYY)')
      .setRequired(true)
  );

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('service', true);
  if (searchTerm.length < 4) return;

  const options = searchServices(searchTerm);
  interaction.respond(options);
};

export const execute: CommandHandler = async (interaction) => {
  const code = interaction.options.getString('link_or_code', true);

  const service = interaction.options.getString('service', true).toLowerCase();
  const hasService = services.find(
    (option) => option.toLowerCase() === service
  );
  if (!hasService) {
    return interaction.reply(
      `No service named ${service}, ask the admin to add it`
    );
  }

  const expiredDate = interaction.options.getString('expiry_date', true);
  const [parseDateCase, parsedExpiryDate] = parseDate(expiredDate);

  if (parseDateCase === 'INVALID_DATE') {
    return interaction.reply(
      'expiry_date is invalid date try format MM/DD/YYYY'
    );
  }
  if (parseDateCase === 'EXPIRED_DATE') {
    return interaction.reply('expiry_date has already expired');
  }

  const prisma = getPrismaClient();
  const newReferralCode = await prisma.referralCode.create({
    data: {
      service,
      code,
      expiry_date: parsedExpiryDate,
    },
  });

  await interaction.reply(
    `new ${newReferralCode.code} in ${
      newReferralCode.service
    } expired on ${newReferralCode.expiry_date.toDateString()}`
  );
};
