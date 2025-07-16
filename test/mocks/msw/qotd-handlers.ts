import { faker } from '@faker-js/faker';
import { type HttpHandler, HttpResponse, http } from 'msw';
import { ZEN_QUOTES_URL } from '../../../src/slash-commands/quote-of-the-day/fetch-quote';

export const qotdHandlers: HttpHandler[] = [
  http.get(ZEN_QUOTES_URL, () => {
    const fakeQuote = faker.lorem.words(25);
    const sampleQuote = {
      q: fakeQuote,
      a: 'Author',
      h: `<h1>${fakeQuote}</h1>`,
    };
    return HttpResponse.json([sampleQuote]);
  }),
];
