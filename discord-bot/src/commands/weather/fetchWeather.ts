import fetch from 'node-fetch';

const WEATHER_URL = 'http://wttr.in/';

const ARGUMENTS = '?0pmMT';

export interface Weather {
  weather: string;
}

const fetchWeather = async (where: string): Promise<Weather | undefined> => {
  try {
    // Download weather infor from the site
    const response = await fetch(WEATHER_URL + where + ARGUMENTS);

    const body = await response.text();
    if (body.length === 0) throw new Error('Cannot fetch weather!');

    return {
      weather: body,
    };
  } catch (error) {
    console.error(error);
  }
};

export default fetchWeather;
