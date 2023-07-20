import { it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { DISCLAIMER_VI, DISCLAIMER_EN, getDisclaimer } from '.';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();
const getEmbed = (content: string) => {
  return new EmbedBuilder({
    author: {
      name: 'VAIT',
    },
    description: content,
  });
};

describe('get disclaimer test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should return the disclaimer text', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('');

    await getDisclaimer(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(DISCLAIMER_VI)],
    });
  });

  it('Should return the EN disclaimer text', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('en');

    await getDisclaimer(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [getEmbed(DISCLAIMER_EN)],
    });
  });
});
