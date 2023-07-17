import { it, describe, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset, mock } from 'vitest-mock-extended';
import { ChatInputCommandInteraction, Message, Collection } from 'discord.js';
import { faker } from '@faker-js/faker';
import { cowsay, removeBacktick } from '.';

const mockInteraction = mockDeep<ChatInputCommandInteraction<'raw'>>();
const mockMessage = mock<Message<true>>();

describe('Remove backtick test', () => {
  it("Should ignore when there's no backticks", () => {
    const input = faker.lorem.slug(25);
    const output = removeBacktick(input);
    expect(output).toEqual(input);
  });

  it('Should remove backtick if it exists', () => {
    const input = '```aaaaa```';
    const output = removeBacktick(input);
    expect(output).toEqual('aaaaa');
  });
});

describe('cowsay test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('It should reply for any text', async () => {
    mockInteraction.options.getString.mockReturnValueOnce(
      faker.lorem.words(25)
    );

    await cowsay(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });

  it('Should be able to eliminate all backticks', async () => {
    mockInteraction.options.getString.mockReturnValueOnce(
      '```a lot of backticks```'
    );

    await cowsay(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });

  it('Should be able to handle short text', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('short');

    await cowsay(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });

  it('Should be able to handle long text', async () => {
    mockInteraction.options.getString.mockReturnValueOnce(faker.lorem.slug(30));

    await cowsay(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });

  describe('For cowsay with no content', () => {
    describe('Fetch the previous message', () => {
      it('Should show error message if previous message cannot be retrieved', async () => {
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockInteraction.options.getString.mockReturnValueOnce('');
        mockInteraction.channel?.messages.fetch.mockResolvedValueOnce(
          mockMessageCollection
        );

        await cowsay(mockInteraction);
        expect(mockInteraction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toBeCalledWith(
          'Cannot fetch latest message. Please try again later.'
        );
      });

      it('It should refer to previous message', async () => {
        mockMessage.content = faker.lorem.words(10);
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockMessageCollection.set(faker.string.nanoid(), mockMessage);
        mockInteraction.options.getString.mockReturnValueOnce('');
        mockInteraction.channel?.messages.fetch.mockResolvedValueOnce(
          mockMessageCollection
        );

        await cowsay(mockInteraction);
        expect(mockInteraction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(mockInteraction.reply).toHaveBeenCalledOnce();
      });
    });
  });
});
