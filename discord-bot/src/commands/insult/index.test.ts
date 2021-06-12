import insult from '.';
import { randomCreate, randomQuote } from './insultGenerator';

const replyMock = jest.fn(() => {});

describe('Insult someone test', () => {
  beforeEach(() => replyMock.mockClear());

  it('Should send an insult if there is -insult prefix', async () => {
    const mockMsg: any = {
      content: `-insult`,
      channel: { send: replyMock },
      author: { bot: false },
    };

    await insult(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should not insult if the author is a bot', async () => {
    const mockMsg: any = {
      content: `-insult`,
      channel: { send: replyMock },
      author: { bot: true },
    };

    await insult(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });
});

describe('Insult Library test', () => {
  beforeEach(() => replyMock.mockClear());

  it('Should be able to generate a random insult', () => {
    const insultString: any = randomCreate();
    expect(typeof insultString).toEqual('string');
  });

  it('Should be able to quote a random insult', () => {
    const insultString: any = randomQuote();
    expect(typeof insultString).toEqual('string');
  });
});
