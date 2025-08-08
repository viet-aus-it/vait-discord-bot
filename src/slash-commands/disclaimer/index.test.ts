import { EmbedBuilder } from 'discord.js';
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { getDisclaimer } from '.';
import { DISCLAIMER_EN, DISCLAIMER_VI, FINANCIAL_DISCLAIMER_EN, FINANCIAL_DISCLAIMER_VI } from './meta';

const getEmbed = (content: string) => {
  return new EmbedBuilder({
    author: {
      name: 'VAIT',
    },
    description: content,
  });
};

describe('get disclaimer test', () => {
  chatInputCommandInteractionTest('Should return the general disclaimer text in Vietnamese', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('general').mockReturnValueOnce('vi');

    await getDisclaimer(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(DISCLAIMER_VI)],
    });
  });

  chatInputCommandInteractionTest('Should return the general disclaimer text in English', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('general').mockReturnValueOnce('en');

    await getDisclaimer(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(DISCLAIMER_EN)],
    });
  });

  chatInputCommandInteractionTest('Should return the financial disclaimer text in Vietnamese', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('financial').mockReturnValueOnce('vi');

    await getDisclaimer(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(FINANCIAL_DISCLAIMER_VI)],
    });
  });

  chatInputCommandInteractionTest('Should return the financial disclaimer text in English', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('financial').mockReturnValueOnce('en');

    await getDisclaimer(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(FINANCIAL_DISCLAIMER_EN)],
    });
  });
});
