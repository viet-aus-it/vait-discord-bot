import { HttpResponse, http } from 'msw';
import { describe, expect } from 'vitest';
import { captor } from 'vitest-mock-extended';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { server } from '../../../test/mocks/msw/server';
import { DEFAULT_LOCATION, weather } from '.';
import { WEATHER_URL } from './fetch-weather';

describe('Weather test', () => {
  chatInputCommandInteractionTest('Should reply command with weather data', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('Hanoi');

    await weather(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();

    const message = captor<string>();
    expect(interaction.editReply).toHaveBeenCalledWith(message);
    expect(message.value).toContain('Hanoi');
  });

  chatInputCommandInteractionTest('Should run with default input if no input is given', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('');

    await weather(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();

    const message = captor<string>();
    expect(interaction.editReply).toHaveBeenCalledWith(message);
    expect(message.value).toContain(DEFAULT_LOCATION);
  });

  chatInputCommandInteractionTest('Should construct the URL correctly if input has many words', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('Ho Chi Minh City');

    await weather(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();

    const message = captor<string>();
    expect(interaction.editReply).toHaveBeenCalledWith(message);
    expect(message.value).toContain('Ho+Chi+Minh+City');
  });

  chatInputCommandInteractionTest('Should reply with error if given an error location', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('ErrorLocation');

    await weather(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();
    expect(interaction.editReply).toHaveBeenCalledWith('Error getting weather data for location.');
  });

  chatInputCommandInteractionTest('Should reply with error if input is valid but weather data cannot be downloaded', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('Brisbane');
    const endpoint = http.get(`${WEATHER_URL}:location`, () => {
      return HttpResponse.error();
    });
    server.use(endpoint);

    await weather(interaction);
    expect(interaction.editReply).toHaveBeenCalledOnce();
    expect(interaction.editReply).toHaveBeenCalledWith('Error getting weather data for location.');
  });
});
