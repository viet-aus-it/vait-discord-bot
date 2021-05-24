import { Collection, Webhook } from 'discord.js';
import { fetchWebhook, createWebhook } from './webhookProcessor';

describe('Test webhook processor', () => {
  it('It should return a valid webhook', async () => {
    const mockedWebhook: any = {
      name: 'VAIT-Hook',
      channelID: 123456,
    };
    const webhooks = new Collection<string, Webhook>();
    webhooks.set('0', mockedWebhook);
    const mockedFetch = jest.fn(async () => webhooks);
    const mockedChannel: any = {
      id: 123456,
      fetchWebhooks: mockedFetch,
    };

    const result = await fetchWebhook(mockedChannel);
    expect(mockedFetch).toHaveBeenCalled();
    expect(result).toEqual(mockedWebhook);
  });

  it('It should return a new webhook', async () => {
    const mockedWebhook: any = {
      name: 'VAIT-Hook',
      channelID: 123456,
    };
    const mockCreate = jest.fn(async () => mockedWebhook);
    const mockedChannel: any = {
      id: 123456,
      createWebhook: mockCreate,
    };

    const result = await createWebhook(mockedChannel);
    expect(mockCreate).toHaveBeenCalled();
    expect(result).toEqual(mockedWebhook);
  });
});
