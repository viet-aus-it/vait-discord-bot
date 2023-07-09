import { vi, it, describe, expect } from 'vitest';
import { createPoll, NUMBER_AS_STRING } from '.';

const replyMock = vi.fn();
const getStringMock = vi.fn((option: string): string | undefined => option);
const errorSpy = vi.spyOn(console, 'error');

describe('Poll test', () => {
  it('Should send a poll as embeded message', async () => {
    const mockedReact = vi.fn();
    replyMock.mockReturnValueOnce({
      react: mockedReact,
    });
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: getStringMock,
      },
    };
    await createPoll(mockInteraction);
    expect(mockedReact).toHaveBeenCalledTimes(NUMBER_AS_STRING.length);
  });

  it('Should send a poll with fewer than 9 options', async () => {
    const mockedReact = vi.fn();
    replyMock.mockReturnValueOnce({
      react: mockedReact,
    });
    const maxOptions = 3;
    getStringMock.mockImplementation((option: string) => {
      if (option === 'question') return option;

      const index = Number(option.substring(6));
      return index <= maxOptions ? option : undefined;
    });
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: getStringMock,
      },
    };
    await createPoll(mockInteraction);

    expect(replyMock).toHaveBeenCalled();
    expect(mockedReact).toHaveBeenCalledTimes(maxOptions);
  });
});
