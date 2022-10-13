import fetch from 'node-fetch';
import { getRandomIntInclusive } from '../../utils';

const XKCD_API_URL = 'https://xkcd.com/info.0.json';

export interface Comic {
  title: string;
  img: string;
  alt: string | null;
  date: string;
  source: string;
}

type GetRandomComicPayload =
  | { name: 'GetRandomComicSuccess'; comic: Comic }
  | { name: 'GetRandomComicFailed'; message: string };

export const getRandomComic = async (): Promise<GetRandomComicPayload> => {
  const getTodayNumberPayload = await getTodayNumber();
  if (getTodayNumberPayload.name === 'GetTodayNumberFailed') {
    return {
      name: 'GetRandomComicFailed',
      message: getTodayNumberPayload.message,
    };
  }

  const randomComicNumber = getRandomIntInclusive(
    1,
    getTodayNumberPayload.number
  );

  const todayComic = await getComic(randomComicNumber);

  if (todayComic.name === 'GetComicFailed') {
    return {
      name: 'GetRandomComicFailed',
      message: todayComic.message,
    };
  }

  return {
    name: 'GetRandomComicSuccess',
    comic: todayComic.comic,
  };
};

type GetTodayNumberPayload =
  | { name: 'GetTodayNumberSuccess'; number: number }
  | { name: 'GetTodayNumberFailed'; message: string };

const getTodayNumber = async (): Promise<GetTodayNumberPayload> => {
  // fetch today's comic number
  return fetch(XKCD_API_URL)
    .then((res) => res.json())
    .then((body) => {
      if (!body) throw new Error('There is something wrong!');

      return {
        name: 'GetTodayNumberSuccess' as any,
        number: Number(body.num),
      };
    })
    .catch((error) => {
      return {
        name: 'GetTodayNumberFailed',
        message: error.message,
      };
    });
};

type GetComicPayload =
  | { name: 'GetComicSuccess'; comic: Comic }
  | { name: 'GetComicFailed'; message: string };

const getComic = async (comicNumber: number): Promise<GetComicPayload> => {
  const comicURL = `https://xkcd.com/${comicNumber}/info.0.json`;
  try {
    const response = await fetch(comicURL); // fetch today's comic number
    const body = await response.json();
    if (!body) throw new Error('There is something wrong!');
    return {
      name: 'GetComicSuccess',
      comic: {
        img: body.img,
        title: body.title,
        alt: body.alt,
        date: `${body.day}/${body.month}/${body.year}`,
        source: `https://xkcd.com/${comicNumber}/`,
      },
    };
  } catch (error: any) {
    return {
      name: 'GetComicFailed',
      message: error.message,
    };
  }
};
