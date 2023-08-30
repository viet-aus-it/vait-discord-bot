import { ChatInputCommandInteraction, Message } from 'discord.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { NUMBER_AS_STRING, createPoll } from '.';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();
type MockReplyMessage = ChatInputCommandInteraction['reply'];
const mockMessage = mockDeep<Message<false>>();

describe('Poll test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockReset(mockMessage);
    const mockReply = (() => mockMessage) as unknown as MockReplyMessage;
    mockInteraction.reply.mockImplementationOnce(mockReply);
  });

  it('Should send a poll as embeded message', async () => {
    mockInteraction.options.getString.mockImplementation((option: string) => option);

    await createPoll(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalled();
    expect(mockMessage.react).toHaveBeenCalledTimes(NUMBER_AS_STRING.length);
  });

  it('Should send a poll with fewer than 9 options', async () => {
    const maxOptions = 3;
    mockInteraction.options.getString.mockImplementation((option: string) => {
      if (option === 'question') return option;

      const index = Number(option.substring(6));
      return index <= maxOptions ? option : null;
    });

    await createPoll(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalled();
    expect(mockMessage.react).toHaveBeenCalledTimes(maxOptions);
  });
});
