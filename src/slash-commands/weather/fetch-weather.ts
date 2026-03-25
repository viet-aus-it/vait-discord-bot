import wretch from 'wretch';

export const WEATHER_URL = 'https://wttr.in/';
export const ARGUMENTS = '?0mMT';

const constructWeatherLocation = (where: string) => {
  return where.replaceAll(' ', '+') + ARGUMENTS;
};

const weatherApi = wretch(WEATHER_URL);

export const fetchWeather = async (where: string) => {
  const response = await weatherApi
    .headers({ 'User-Agent': 'curl', 'Content-Type': 'text/plain' })
    .get(constructWeatherLocation(where))
    .text()
    .catch((err) => {
      throw new Error(`ERROR IN FETCHING WEATHER: ERROR ${err.status}`, err);
    });

  return response;
};
