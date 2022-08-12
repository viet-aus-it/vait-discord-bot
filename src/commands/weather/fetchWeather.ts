import fetch from 'node-fetch';

const WEATHER_URL = 'https://wttr.in/';
const ARGUMENTS = '?0mMT';

export const getWeatherURL = (where: string) => WEATHER_URL + where + ARGUMENTS;

export const fetchWeather = async (
  where: string
): Promise<string | undefined> => {
  try {
    // Download weather info from the site
    const response = await fetch(getWeatherURL(where));
    if (response.statusText !== 'OK') {
      throw new Error(
        `ERROR IN FETCHING WEATHER: ERROR ${response.status}: ${response.statusText}`
      );
    }
    return await response.text();
  } catch (error) {
    console.error(error);
  }
};
