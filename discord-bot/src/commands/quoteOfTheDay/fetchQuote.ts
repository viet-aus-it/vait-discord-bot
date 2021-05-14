import fetch from 'node-fetch';

interface ZenQuote {
  q: string;
  a: string;
  h: string;
}

export interface Quote {
  quote: string;
  author: string;
  html: string;
}

const ZEN_QUOTES_URL =
  'https://zenquotes.io/api/random/6a874c704a11dea9305fe58e145d51c218f9f143';

const fetchQuote = async (): Promise<Quote | undefined> => {
  try {
    const response = await fetch(ZEN_QUOTES_URL); // download quotes from this site
    const body: ZenQuote[] = await response.json();
    if (body.length === 0) throw new Error('No quote downloaded');

    const { q, a, h } = body[0];
    return {
      quote: q,
      author: a,
      html: h,
    };
  } catch (error) {
    console.error('THERE IS AN ERROR DOWNLOADING QUOTES', error);
  }
};

export default fetchQuote;
