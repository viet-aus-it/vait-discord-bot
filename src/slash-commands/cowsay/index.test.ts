import { faker } from '@faker-js/faker';
import { Collection, type Message } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { cowsay, removeBacktick } from '.';

describe('Remove backtick test', () => {
  it("Should ignore when there's no backticks", () => {
    const input = faker.lorem.slug(25);
    const output = removeBacktick(input);
    expect(output).toEqual(input);
  });

  it('Should remove backtick if it exists', () => {
    const input = '```aaaaa```';
    const output = removeBacktick(input);
    expect(output).toEqual('aaaaa');
  });
});

describe('cowsay test', () => {
  chatInputCommandInteractionTest('It should reply for any text', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce(faker.lorem.words(25));

    await cowsay(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });

  chatInputCommandInteractionTest('Should be able to eliminate all backticks', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('```a lot of backticks```');

    await cowsay(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });

  chatInputCommandInteractionTest('Should be able to handle short text', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('short');

    await cowsay(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });

  chatInputCommandInteractionTest('Should be able to handle long text', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce(faker.lorem.slug(30));

    await cowsay(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });

  describe('For cowsay with no content', () => {
    describe('Fetch the previous message', () => {
      chatInputCommandInteractionTest('Should show error message if previous message cannot be retrieved', async ({ interaction }) => {
        const mockMessageCollection = new Collection<string, Message<true>>();
        interaction.options.getString.mockReturnValueOnce('');
        interaction.channel?.messages.fetch.mockResolvedValueOnce(mockMessageCollection);

        await cowsay(interaction);
        expect(interaction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(interaction.reply).toBeCalledWith('Cannot fetch latest message. Please try again later.');
      });

      chatInputCommandInteractionTest('It should refer to previous message', async ({ interaction, message }) => {
        message.content = faker.lorem.words(10);
        const mockMessageCollection = new Collection<string, Message<true>>();
        mockMessageCollection.set(faker.string.nanoid(), message);
        interaction.options.getString.mockReturnValueOnce('');
        interaction.channel?.messages.fetch.mockResolvedValueOnce(mockMessageCollection);

        await cowsay(interaction);
        expect(interaction.channel?.messages.fetch).toHaveBeenCalledOnce();
        expect(interaction.reply).toHaveBeenCalledOnce();
      });
    });
  });
});
