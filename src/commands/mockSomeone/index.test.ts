import { it, describe, expect } from 'vitest';
import { mock, mockDeep, mockReset } from 'vitest-mock-extended';
import { ChatInputCommandInteraction, Collection, Message } from 'discord.js';
import { faker } from '@faker-js/faker';
import { mockSomeone } from '.';

const mockInteraction = mockDeep<ChatInputCommandInteraction<'raw'>>();
const mockMessage = mock<Message<true>>();

describe('mockSomeone test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockReset(mockMessage);
  });

  it('Should mock text if it was called by /mock', async () => {
    mockInteraction.options.getString.mockReturnValueOnce(
      faker.lorem.words(25)
    );

    await mockSomeone(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });

  describe('For /mock call with blank content', () => {
    describe('Fetching previous message', () => {
      beforeEach(() => {
        mockInteraction.options.getString.mockReturnValueOnce('');
      });

      it('Should reply with error if previous message cannot be retrieved', async () => {
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockInteraction.options.getString.mockReturnValueOnce('');
        mockInteraction.channel?.messages.fetch.mockResolvedValueOnce(
          mockMessageCollection
        );

        await mockSomeone(mockInteraction);
        expect(mockInteraction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toHaveBeenCalledWith(
          'Cannot fetch latest message. Please try again later.'
        );
      });

      it('Should reply with error if previous message is blank', async () => {
        mockMessage.content = '';
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockInteraction.options.getString.mockReturnValueOnce('');
        mockInteraction.channel?.messages.fetch.mockResolvedValueOnce(
          mockMessageCollection
        );

        await mockSomeone(mockInteraction);
        expect(mockInteraction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toHaveBeenCalledWith(
          'Cannot fetch latest message. Please try again later.'
        );
      });

      it('Should mock the previous message', async () => {
        mockMessage.content = faker.lorem.words(25);
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockInteraction.options.getString.mockReturnValueOnce('');
        mockInteraction.channel?.messages.fetch.mockResolvedValueOnce(
          mockMessageCollection
        );

        await mockSomeone(mockInteraction);
        expect(mockInteraction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toHaveBeenCalledOnce();
      });
    });
  });
});
