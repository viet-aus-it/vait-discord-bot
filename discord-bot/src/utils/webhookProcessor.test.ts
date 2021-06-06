import { Collection, Webhook } from 'discord.js';
import {
  fetchWebhook,
  createWebhook,
  fetchOrCreateWebhook,
} from './webhookProcessor';

describe('Test webhook processor', () => {
  it('should return an existing webhook', async () => {
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

    const result = await fetchWebhook(mockedChannel, 'VAIT-Hook');
    expect(mockedFetch).toHaveBeenCalled();
    expect(result).toEqual(mockedWebhook);
  });

  it('should create a new webhook', async () => {
    const mockedWebhook: any = {
      name: 'VAIT-Hook',
      channelID: 123456,
    };
    const mockCreate = jest.fn(async () => mockedWebhook);
    const mockedChannel: any = {
      id: 123456,
      createWebhook: mockCreate,
    };

    const result = await createWebhook(mockedChannel, 'VAIT-Hook');
    expect(mockCreate).toHaveBeenCalled();
    expect(result).toEqual(mockedWebhook);
  });

  it('should create a new webhook if cannot be fetched', async () => {
    const webhooks = new Collection<string, Webhook>();
    const mockedFetch = jest.fn(async () => webhooks);
    const mockedWebhook: any = {
      name: 'VAIT-Hook',
      channelID: 123456,
    };
    const mockCreate = jest.fn(async () => mockedWebhook);
    const mockedChannel: any = {
      id: 123456,
      fetchWebhooks: mockedFetch,
      createWebhook: mockCreate,
    };

    const result = await fetchOrCreateWebhook(mockedChannel, 'VAIT-Hook');
    expect(mockedFetch).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
    expect(result).toEqual(mockedWebhook);
  });

  it('Should return undefined if a webhook cannot be fetched and/or created', async () => {
    const webhooks = new Collection<string, Webhook>();
    const mockedFetch = jest.fn(async () => webhooks);
    const mockCreate = jest.fn(async () => undefined);
    const mockedChannel: any = {
      id: 123456,
      fetchWebhooks: mockedFetch,
      createWebhook: mockCreate,
    };

    const result = await fetchOrCreateWebhook(mockedChannel, 'VAIT-Hook');
    expect(mockedFetch).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
    expect(result).toEqual(undefined);
  });
});
