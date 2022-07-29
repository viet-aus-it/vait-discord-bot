import { it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { rest } from 'msw';
import { server } from '../../mocks/server.js';
import { fetchQuote, ZEN_QUOTES_URL } from './fetchQuote.js';

describe('Fetching quotes', () => {
  it('Should return undefined if it cannot get a quote', async () => {
    const endpoint = rest.get(ZEN_QUOTES_URL, (_, res, ctx) => {
      return res(ctx.status(200), ctx.json(undefined));
    });
    server.use(endpoint);

    const output = await fetchQuote();
    expect(output).toEqual(undefined);
  });

  it('Should return undefined if it downloaded a blank array', async () => {
    const endpoint = rest.get(ZEN_QUOTES_URL, (_, res, ctx) => {
      return res(ctx.status(200), ctx.json([]));
    });
    server.use(endpoint);

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
    const endpoint = rest.get(ZEN_QUOTES_URL, (_, res, ctx) => {
      return res(ctx.status(200), ctx.json([sampleQuote]));
    });
    server.use(endpoint);

    const output = await fetchQuote();
    expect(output).toEqual({
      quote: sampleQuote.q,
      author: sampleQuote.a,
      html: sampleQuote.h,
    });
  });
});
