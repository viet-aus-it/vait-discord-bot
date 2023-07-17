import { it, describe, expect, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { rest } from 'msw';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ChatInputCommandInteraction } from 'discord.js';
import { getQuoteOfTheDay } from '.';
import { server } from '../../mocks/server';
import { ZEN_QUOTES_URL } from './fetchQuote';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('Get quote of the day test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should reply with error if it downloaded a blank array', async () => {
    const endpoint = rest.get(ZEN_QUOTES_URL, (_, res, ctx) => {
      return res(ctx.status(200), ctx.json([]));
    });
    server.use(endpoint);

    await getQuoteOfTheDay(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(
      'Error getting quotes'
    );
  });

  it('Should reply with error message if it error while downloading quotes', async () => {
    const endpoint = rest.get(ZEN_QUOTES_URL, (_, res, ctx) => {
      return res(ctx.status(500), ctx.json(undefined));
    });
    server.use(endpoint);

    await getQuoteOfTheDay(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(
      'Error getting quotes'
    );
  });

  it('Should reply with a random quote', async () => {
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

    await getQuoteOfTheDay(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
  });
});
