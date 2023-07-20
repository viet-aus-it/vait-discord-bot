import { it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset, mock } from 'vitest-mock-extended';
import { ChatInputCommandInteraction, Message, Collection } from 'discord.js';
import { faker } from '@faker-js/faker';
import { allCapExpandText } from '.';

const mockInteraction = mockDeep<ChatInputCommandInteraction<'raw'>>();
const mockMessage = mock<Message<true>>();

describe('All caps test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockReset(mockMessage);
  });

  it('Should return text app cap and expanded', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('aaa');

    await allCapExpandText(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toBeCalledWith('A A A ');
  });

  describe('All cap with no content', () => {
    describe('Fetch the previous message', () => {
      it('Should refer to previous message', async () => {
        mockMessage.content = 'aaa';
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockMessageCollection.set(faker.string.nanoid(), mockMessage);
        mockInteraction.options.getString.mockReturnValueOnce('');
        mockInteraction.channel?.messages.fetch.mockResolvedValueOnce(
          mockMessageCollection
        );

        await allCapExpandText(mockInteraction);
        expect(mockInteraction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toBeCalledWith('A A A ');
      });

      it('Should show error message if there is no previous message', async () => {
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockInteraction.options.getString.mockReturnValueOnce('');
        mockInteraction.channel?.messages.fetch.mockResolvedValueOnce(
          mockMessageCollection
        );

        await allCapExpandText(mockInteraction);
        expect(mockInteraction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toBeCalledWith(
          'Cannot fetch latest message. Please try again later.'
        );
      });
    });
  });
});
