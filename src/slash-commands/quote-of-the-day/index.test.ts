import { HttpResponse, http } from 'msw';
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { server } from '../../../test/mocks/msw/server';
import { getQuoteOfTheDay } from '.';
import { ZEN_QUOTES_URL } from './fetch-quote';

describe('Get quote of the day test', () => {
  chatInputCommandInteractionTest('Should reply with error if it downloaded a blank array', async ({ interaction }) => {
    const endpoint = http.get(ZEN_QUOTES_URL, () => {
      return HttpResponse.json([]);
    });
    server.use(endpoint);

    await getQuoteOfTheDay(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();
    expect(interaction.editReply).toHaveBeenCalledWith('Error getting quotes');
  });

  chatInputCommandInteractionTest('Should reply with error message if it error while downloading quotes', async ({ interaction }) => {
    const endpoint = http.get(ZEN_QUOTES_URL, () => {
      return HttpResponse.error();
    });
    server.use(endpoint);

    await getQuoteOfTheDay(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();
    expect(interaction.editReply).toHaveBeenCalledWith('Error getting quotes');
  });

  chatInputCommandInteractionTest('Should reply with a random quote', async ({ interaction }) => {
    await getQuoteOfTheDay(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();
  });
});
