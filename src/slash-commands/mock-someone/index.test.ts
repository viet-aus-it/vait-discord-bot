import { faker } from '@faker-js/faker';
import { Collection, type Message } from 'discord.js';
import { describe, expect } from 'vitest';
import { mockSomeone } from '.';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

describe('mockSomeone test', () => {
  chatInputCommandInteractionTest('Should mock text if it was called by /mock', async ({ interaction, message }) => {
    interaction.options.getString.mockReturnValueOnce(faker.lorem.words(25));

    await mockSomeone(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });

  describe('For /mock call with blank content', () => {
    describe('Fetching previous message', () => {
      chatInputCommandInteractionTest('Should reply with error if previous message cannot be retrieved', async ({ interaction, message }) => {
        const messageCollection = new Collection<string, Message<true>>();
        interaction.options.getString.mockReturnValueOnce('');
        interaction.channel?.messages.fetch.mockResolvedValueOnce(messageCollection);

        await mockSomeone(interaction);
        expect(interaction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(interaction.reply).toHaveBeenCalledOnce();
        expect(interaction.reply).toHaveBeenCalledWith('Cannot fetch latest message. Please try again later.');
      });

      chatInputCommandInteractionTest('Should reply with error if previous message is blank', async ({ interaction, message }) => {
        message.content = '';
        const messageCollection = new Collection<string, Message<true>>();
        interaction.options.getString.mockReturnValueOnce('');
        interaction.channel?.messages.fetch.mockResolvedValueOnce(messageCollection);

        await mockSomeone(interaction);
        expect(interaction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(interaction.reply).toHaveBeenCalledOnce();
        expect(interaction.reply).toHaveBeenCalledWith('Cannot fetch latest message. Please try again later.');
      });

      chatInputCommandInteractionTest('Should mock the previous message', async ({ interaction, message }) => {
        message.content = faker.lorem.words(25);
        const messageCollection = new Collection<string, Message<true>>();
        interaction.options.getString.mockReturnValueOnce('');
        interaction.channel?.messages.fetch.mockResolvedValueOnce(messageCollection);

        await mockSomeone(interaction);
        expect(interaction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(interaction.reply).toHaveBeenCalledOnce();
      });
    });
  });
});
