import fetch from 'node-fetch';

const WEATHER_URL = 'https://wttr.in/';

const ARGUMENTS = '?0mMT';

const fetchWeather = async (where: string): Promise<string | undefined> => {
  try {
    // Download weather info from the site
    const response = await fetch(WEATHER_URL + where + ARGUMENTS);

    return await response.text();
  } catch (error) {
    console.error(error);
  }
};

export default fetchWeather;
