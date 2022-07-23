import { createPoll, NUMBER_AS_STRING } from '.';

const replyMock = jest.fn();
const getStringMock = jest.fn((option: string): string | undefined => option);
const errorSpy = jest.spyOn(console, 'error');

describe('Poll test', () => {
  it('Should send a poll as embeded message', async () => {
    const mockedReact = jest.fn();
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
    const mockedReact = jest.fn();
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

  it('Should handle error with console if message cannot be sent', async () => {
    const mockedReact = jest.fn();
    replyMock.mockReturnValueOnce(Promise.reject(new Error('Synthetic Error')));
    const mockInteraction: any = {
      reply: replyMock,
      options: {
        getString: getStringMock,
      },
    };

    try {
      await createPoll(mockInteraction);
    } catch (error: any) {
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(mockedReact).not.toHaveBeenCalled();
    }
  });
});
