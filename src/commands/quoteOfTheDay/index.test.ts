import { vi, it, describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { getQuoteOfTheDay } from '.';
import { rest } from 'msw';
import { server } from '../../mocks/server';
import { ZEN_QUOTES_URL } from './fetchQuote';

const deferReplyMock = vi.fn();
const editReplyMock = vi.fn();

describe('Get quote of the day test', () => {
  it('Should reply with error if it downloaded a blank array', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
    };
    const endpoint = rest.get(ZEN_QUOTES_URL, (_, res, ctx) => {
      return res(ctx.status(200), ctx.json([]));
    });
    server.use(endpoint);

    await getQuoteOfTheDay(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith('Error getting quotes');
  });

  it('Should reply with error message if it error while downloading quotes', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
    };
    const endpoint = rest.get(ZEN_QUOTES_URL, (_, res, ctx) => {
      return res(ctx.status(500), ctx.json(undefined));
    });
    server.use(endpoint);

    await getQuoteOfTheDay(mockInteraction);
    expect(editReplyMock).toHaveBeenCalledTimes(1);
    expect(editReplyMock).toHaveBeenCalledWith('Error getting quotes');
  });

  it('Should reply with a random quote', async () => {
    const mockInteraction: any = {
      deferReply: deferReplyMock,
      editReply: editReplyMock,
    };
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
    expect(editReplyMock).toHaveBeenCalledTimes(1);
  });
});
