import wretch from 'wretch';
import { tracer } from '../../utils/tracer';

export const WEATHER_URL = 'https://wttr.in/';
export const ARGUMENTS = '?0mMT';

const constructWeatherLocation = (where: string) => {
  return where.replaceAll(' ', '+') + ARGUMENTS;
};

const weatherApi = wretch(WEATHER_URL);

export const fetchWeather = async (where: string) => {
  return tracer.startActiveSpan('http.weather', async (span) => {
    span.setAttribute('weather.location', where);
    try {
      const response = await weatherApi
        .headers({ 'User-Agent': 'curl', 'Content-Type': 'text/plain' })
        .get(constructWeatherLocation(where))
        .text()
        .catch((err) => {
          throw new Error(`ERROR IN FETCHING WEATHER: ERROR ${err.status}`, err);
        });

      return response;
    } finally {
      span.end();
    }
  });
};
