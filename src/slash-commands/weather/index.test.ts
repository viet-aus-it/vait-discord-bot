import { faker } from '@faker-js/faker';
import type { ChatInputCommandInteraction } from 'discord.js';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { DEFAULT_LOCATION, weather } from '.';
import { server } from '../../../mocks/msw/server';
import { WEATHER_URL } from './fetch-weather';

const mockWeatherMessage = faker.lorem.words(10);

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('Weather test', () => {
  beforeEach(() => {
    const endpoint = http.get(`${WEATHER_URL}:location`, ({ params }) => {
      const { location } = params;
      if (location === 'ErrorLocation') {
        return HttpResponse.error();
      }

      return HttpResponse.text(location + mockWeatherMessage);
    });
    server.use(endpoint);

    mockReset(mockInteraction);
  });

  it('Should reply command with weather data', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('Hanoi');

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(`\`\`\`\nHanoi${mockWeatherMessage}\n\`\`\``);
  });

  it('Should run with default input if no input is given', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('');

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(`\`\`\`\n${DEFAULT_LOCATION}${mockWeatherMessage}\n\`\`\``);
  });

  it('Should construct the URL correctly if input has many words', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('Ho Chi Minh City');

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith(`\`\`\`\nHo+Chi+Minh+City${mockWeatherMessage}\n\`\`\``);
  });

  it('Should reply with error if given an error location', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('ErrorLocation');

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Error getting weather data for location.');
  });

  it('Should reply with error if input is valid but weather data cannot be downloaded', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('Brisbane');
    const endpoint = http.get(`${WEATHER_URL}:location`, () => {
      return HttpResponse.error();
    });
    server.use(endpoint);

    await weather(mockInteraction);
    expect(mockInteraction.editReply).toHaveBeenCalledOnce();
    expect(mockInteraction.editReply).toHaveBeenCalledWith('Error getting weather data for location.');
  });
});
