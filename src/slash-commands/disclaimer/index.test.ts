import { EmbedBuilder } from 'discord.js';
import { describe, expect } from 'vitest';
import { DISCLAIMER_EN, DISCLAIMER_VI, getDisclaimer } from '.';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

const getEmbed = (content: string) => {
  return new EmbedBuilder({
    author: {
      name: 'VAIT',
    },
    description: content,
  });
};

describe('get disclaimer test', () => {
  chatInputCommandInteractionTest('Should return the disclaimer text', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('');

    await getDisclaimer(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(DISCLAIMER_VI)],
    });
  });

  chatInputCommandInteractionTest('Should return the EN disclaimer text', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('en');

    await getDisclaimer(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(DISCLAIMER_EN)],
    });
  });
});
