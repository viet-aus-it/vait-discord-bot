import wretch from 'wretch';
import { z } from 'zod';

const ZenQuoteSchema = z.object({
  q: z.string(),
  a: z.string(),
  h: z.string(),
});

const ZenQuoteResponse = z.array(ZenQuoteSchema).min(1).max(1);

type ZenQuote = z.infer<typeof ZenQuoteSchema>;

export interface Quote {
  quote: string;
  author: string;
  html: string;
}

export const ZEN_QUOTES_URL = 'https://zenquotes.io/api/random/6a874c704a11dea9305fe58e145d51c218f9f143';
const quotesApi = wretch(ZEN_QUOTES_URL);

export const fetchQuote = async () => {
  const response = await quotesApi.get().json<ZenQuote[]>();
  const parsedBody = ZenQuoteResponse.parse(response);

  const { q, a, h } = parsedBody[0];
  const result: Quote = {
    quote: q,
    author: a,
    html: h,
  };
  return result;
};
