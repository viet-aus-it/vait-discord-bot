import fetch from 'node-fetch';
import { z } from 'zod';

const ZenQuoteSchema = z.object({
  q: z.string(),
  a: z.string(),
  h: z.string(),
});

const ZenQuoteResponse = z.array(ZenQuoteSchema);

type ZenQuote = z.infer<typeof ZenQuoteSchema>;

export interface Quote {
  quote: string;
  author: string;
  html: string;
}

export const ZEN_QUOTES_URL =
  'https://zenquotes.io/api/random/6a874c704a11dea9305fe58e145d51c218f9f143';

export const fetchQuote = async (): Promise<Quote | undefined> => {
  try {
    const response = await fetch(ZEN_QUOTES_URL); // download quotes from this site
    const body = await response.json();
    const parsedBody: ZenQuote[] = ZenQuoteResponse.parse(body);
    if (parsedBody.length === 0) throw new Error('No quote downloaded');

    const { q, a, h } = parsedBody[0];
    return {
      quote: q,
      author: a,
      html: h,
    };
  } catch (error) {
    console.error('THERE IS AN ERROR DOWNLOADING QUOTES', error);
  }
};
