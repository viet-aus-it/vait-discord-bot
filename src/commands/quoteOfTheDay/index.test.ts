import faker from 'faker';
import { mocked } from 'jest-mock';
import getQuoteOfTheDay from '.';
import fetchQuote from './fetchQuote';

jest.mock('./fetchQuote');
const mockFetch = mocked(fetchQuote);

const replyMock = jest.fn(() => {});

describe('Get quote of the day test', () => {
  it('Should return if chat author is a bot', async () => {
    const mockMsg: any = {
      content: `-qotd`,
      channel: { send: replyMock },
      author: { bot: true },
    };
    await getQuoteOfTheDay(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });

  it('Should return a random quote if somebody sends the prefix', async () => {
    const mockMsg: any = {
      content: `-qotd`,
      channel: { send: replyMock },
      author: { bot: false },
    };
    const fakeQuote = faker.lorem.words(25);
    mockFetch.mockImplementationOnce(async () => ({
      quote: fakeQuote,
      author: 'Author',
      html: `<h1>${fakeQuote}</h1>`,
    }));
    await getQuoteOfTheDay(mockMsg);
    expect(replyMock).toHaveBeenCalledTimes(1);
  });

  it('Should return if no quote can be downloaded', async () => {
    const mockMsg: any = {
      content: `-qotd`,
      channel: { send: replyMock },
      author: { bot: false },
    };
    mockFetch.mockImplementationOnce(async () => undefined);
    await getQuoteOfTheDay(mockMsg);
    expect(replyMock).not.toHaveBeenCalled();
  });
});
