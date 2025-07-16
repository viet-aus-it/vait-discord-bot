import { faker } from '@faker-js/faker';
import { type HttpHandler, HttpResponse, http } from 'msw';
import { WEATHER_URL } from '../../../src/slash-commands/weather/fetch-weather';

export const weatherHandlers: HttpHandler[] = [
  http.get(`${WEATHER_URL}:location`, ({ params }) => {
    const { location } = params;
    if (location === 'ErrorLocation') {
      return HttpResponse.error();
    }

    return HttpResponse.text(location + faker.lorem.words(10));
  }),
];
