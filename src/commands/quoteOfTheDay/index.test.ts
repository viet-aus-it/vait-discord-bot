import { it, describe, expect, jest } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { getQuoteOfTheDay } from '.';
import { fetchQuote } from './fetchQuote';

jest.mock('./fetchQuote');
const mockFetch = jest.mocked(fetchQuote);

const deferReplyMock = jest.fn();
const editReplyMock = jest.fn();

describe('Get quote of the day test', () => {
  it('Should return a random quote when requested', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
    };

    const fakeQuote = faker.lorem.words(25);
    mockFetch.mockImplementationOnce(async () => ({
      quote: fakeQuote,
      author: 'Author',
      html: `<h1>${fakeQuote}</h1>`,
    }));

    await getQuoteOfTheDay(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
  });

  it('Should reply with error message if no quote can be downloaded', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
    };
    mockFetch.mockImplementationOnce(async () => undefined);
    await getQuoteOfTheDay(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith('Error getting quotes');
  });
});
