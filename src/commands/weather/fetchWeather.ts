import fetch from 'node-fetch';

const WEATHER_URL = 'http://wttr.in/';

const ARGUMENTS = '?0mMT';

const fetchWeather = async (where: string): Promise<string | undefined> => {
  try {
    // Download weather info from the site
    const response = await fetch(WEATHER_URL + where + ARGUMENTS);

    const body = await response.text();

    return body;
  } catch (error) {
    console.error(error);
  }
};

export default fetchWeather;
