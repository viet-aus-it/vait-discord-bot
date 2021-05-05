import faker from 'faker';
import getQuoteOfTheDay from '.';

const replyMock = jest.fn(() => {});

describe('Get quote of the day test', () => {
  it('Should return if chat author is a bot', async () => {
    const mockMsg: any = {
      content: `-qotd`,
      channel: { send: replyMock },
      author: { bot: true },
    };
    await getQuoteOfTheDay(mockMsg);
    expect(replyMock.mock.calls.length).toBe(0);
  });

  it('Should return a random quote if somebody sends the prefix', async () => {
    const mockMsg: any = {
      content: `-qotd`,
      channel: { send: replyMock },
      author: { bot: false },
    };
    await getQuoteOfTheDay(mockMsg);
    expect(replyMock.mock.calls.length).toBe(1);
  });
});
