import { faker } from '@faker-js/faker';
import { Collection, type Message } from 'discord.js';
import { describe, expect } from 'vitest';
import { allCapExpandText } from '.';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';

describe('All caps test', () => {
  chatInputCommandInteractionTest('Should return text app cap and expanded', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('aaa');

    await allCapExpandText(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toBeCalledWith('A A A ');
  });

  describe('All cap with no content', () => {
    describe('Fetch the previous message', () => {
      chatInputCommandInteractionTest('Should refer to previous message', async ({ interaction, message }) => {
        message.content = 'aaa';
        const messageCollection = new Collection<string, Message<true>>();
        messageCollection.set(faker.string.nanoid(), message);
        interaction.options.getString.mockReturnValueOnce('');
        interaction.channel?.messages.fetch.mockResolvedValueOnce(messageCollection);

        await allCapExpandText(interaction);
        expect(interaction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(interaction.reply).toBeCalledWith('A A A ');
      });

      chatInputCommandInteractionTest('Should show error message if there is no previous message', async ({ interaction }) => {
        const messageCollection = new Collection<string, Message<true>>();
        interaction.options.getString.mockReturnValueOnce('');
        interaction.channel?.messages.fetch.mockResolvedValueOnce(messageCollection);

        await allCapExpandText(interaction);
        expect(interaction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(interaction.reply).toBeCalledWith('Cannot fetch latest message. Please try again later.');
      });
    });
  });
});
