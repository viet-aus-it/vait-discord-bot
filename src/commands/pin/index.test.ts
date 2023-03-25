import { vi, it, describe, expect, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { Message } from 'discord.js';
import { MessageType } from 'discord-api-types/v10';
import { pinMessage } from '.';

const replyMock = vi.fn();

const getMockInteraction = ({
  getString,
  fetchCallback,
}: {
  getString?: Function;
  fetchCallback?: Function;
}): any => ({
  reply: replyMock,
  options: {
    getString,
  },
  channel: {
    messages: { fetch: fetchCallback },
  },
});

describe('pinMessage test', () => {
  beforeEach(() => {
    replyMock.mockClear();
  });

  describe('If given the message ID', () => {
    it('Should reply with error if it cannot fetch the message', async () => {
      const getString = vi.fn(() => faker.lorem.word(10));
      const fetchCallback = vi.fn(async () => {
        throw new Error('Synthetic Error: Cannot fetch message');
      });
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith(
        'Cannot retrieve message to pin. Please try again.'
      );
    });

    it('Should reply with error if the message is a system message', async () => {
      const pinMock = vi.fn(async () => {});
      const message = {
        content: faker.lorem.words(25),
        pin: pinMock,
        type: MessageType.ChannelPinnedMessage,
      } as unknown as Message;
      const getString = vi.fn(() => faker.lorem.word(10));
      const fetchCallback = vi.fn(async () => message);
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(pinMock).toHaveBeenCalledTimes(0);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith(
        'Cannot pin a system message. Skipping...'
      );
    });

    it('Should reply with error if message is already pinned', async () => {
      const pinned = true;
      const pinMock = vi.fn(async () => {});
      const message = {
        content: faker.lorem.words(25),
        pinned,
        pin: pinMock,
        type: MessageType.ChatInputCommand,
      } as unknown as Message;
      const getString = vi.fn(() => faker.lorem.word(10));
      const fetchCallback = vi.fn(async () => message);
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(pinMock).toHaveBeenCalledTimes(0);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith(
        'Message is already pinned. Skipping...'
      );
    });

    it('Should pin the message given by the ID', async () => {
      let pinned = false;
      const pinMock = vi.fn(async () => {
        pinned = !pinned;
      });
      const message = {
        content: faker.lorem.words(25),
        pinned,
        pin: pinMock,
        type: MessageType.ChatInputCommand,
      } as unknown as Message;
      const getString = vi.fn(() => faker.lorem.word(10));
      const fetchCallback = vi.fn(async () => message);
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(pinMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith('Message is now pinned!');
    });
  });

  describe('If not given the message ID', () => {
    it('Should reply with error if it cannot fetch the message before the pin command', async () => {
      const getString = vi.fn(() => null);
      const fetchCallback = vi.fn(async () => {
        throw new Error('Cannot fetch message');
      });
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith(
        'Cannot retrieve message to pin. Please try again.'
      );
    });

    it('Should reply with error if the message is a system message', async () => {
      const pinMock = vi.fn(async () => {});
      const message = {
        content: faker.lorem.words(25),
        pin: pinMock,
        type: MessageType.ChannelPinnedMessage,
      } as unknown as Message;
      const getString = vi.fn(() => faker.lorem.word(10));
      const fetchCallback = vi.fn(async () => ({
        first: () => message,
      }));
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(pinMock).toHaveBeenCalledTimes(0);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith(
        'Cannot pin a system message. Skipping...'
      );
    });

    it('Should reply with error if the message is already pinned', async () => {
      const pinned = true;
      const pinMock = vi.fn(async () => {});
      const message = {
        content: faker.lorem.words(25),
        pinned,
        pin: pinMock,
        type: MessageType.ChatInputCommand,
      } as unknown as Message;
      const getString = vi.fn(() => null);
      const fetchCallback = vi.fn(async () => ({
        first: () => message,
      }));
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(pinMock).toHaveBeenCalledTimes(0);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith(
        'Message is already pinned. Skipping...'
      );
    });

    it('Should pin the message right before the pin command was called if no ID was given', async () => {
      let pinned = false;
      const pinMock = vi.fn(async () => {
        pinned = !pinned;
      });
      const message = {
        content: faker.lorem.words(25),
        pinned,
        pin: pinMock,
        type: MessageType.ChatInputCommand,
      } as unknown as Message;
      const getString = vi.fn(() => null);
      const fetchCallback = vi.fn(async () => ({
        first: () => message,
      }));
      const mockInteraction = getMockInteraction({
        getString,
        fetchCallback,
      });

      await pinMessage(mockInteraction);
      expect(pinMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledTimes(1);
      expect(replyMock).toHaveBeenCalledWith('Message is now pinned!');
    });
  });
});
