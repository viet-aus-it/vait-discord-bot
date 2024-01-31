import { faker } from '@faker-js/faker';
import { ChatInputCommandInteraction } from 'discord.js';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { getQuoteOfTheDay } from '.';
import { server } from '../../mocks/server';
import { ZEN_QUOTES_URL } from './fetchQuote';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('Get quote of the day test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should reply with error if it downloaded a blank array', async () => {
    const endpoint = http.get(ZEN_QUOTES_URL, () => {
      return HttpResponse.json([]);
    });
    server.use(endpoint);

    await getQuoteOfTheDay(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Error getting quotes');
  });

  it('Should reply with error message if it error while downloading quotes', async () => {
    const endpoint = http.get(ZEN_QUOTES_URL, () => {
      return HttpResponse.error();
    });
    server.use(endpoint);

    await getQuoteOfTheDay(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Error getting quotes');
  });

  it('Should reply with a random quote', async () => {
    const fakeQuote = faker.lorem.words(25);
    const sampleQuote = {
      q: fakeQuote,
      a: 'Author',
      h: `<h1>${fakeQuote}</h1>`,
    };
    const endpoint = http.get(ZEN_QUOTES_URL, () => {
      return HttpResponse.json([sampleQuote]);
    });
    server.use(endpoint);

    await getQuoteOfTheDay(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
  });
});
