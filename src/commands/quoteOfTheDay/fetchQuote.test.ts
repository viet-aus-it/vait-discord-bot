import faker from 'faker';
import fetch from 'node-fetch';
import { mocked } from 'jest-mock';
import { fetchQuote } from './fetchQuote';

jest.mock('node-fetch');
const mockFetch = mocked(fetch);

describe('Fetching quotes', () => {
  it('Should return undefined if it cannot get a quote', async () => {
    const mockedQuote: any = undefined;
    mockFetch.mockImplementationOnce(async () => mockedQuote);
    const output = await fetchQuote();
    expect(output).toEqual(undefined);
  });

  it('Should return undefined if it downloaded a blank array', async () => {
    const mockedQuote: any = { json: async () => [] };
    mockFetch.mockImplementationOnce(async () => mockedQuote);
    const output = await fetchQuote();
    expect(output).toEqual(undefined);
  });

  it('Should return the quote when it finally got it', async () => {
    const fakeQuote = faker.lorem.words(25);
    const sampleQuote = {
      q: fakeQuote,
      a: 'Author',
      h: `<h1>${fakeQuote}</h1>`,
    };
    const mockedQuote: any = { json: async () => [sampleQuote] };
    mockFetch.mockImplementationOnce(async () => mockedQuote);
    const output = await fetchQuote();
    expect(output).toEqual({
      quote: sampleQuote.q,
      author: sampleQuote.a,
      html: sampleQuote.h,
    });
  });
});
