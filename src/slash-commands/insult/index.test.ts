import { faker } from '@faker-js/faker';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { insult } from '.';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { randomCreate } from './insult-generator';

describe('Insult someone test', () => {
  chatInputCommandInteractionTest('Should send an insult when the cmd is sent', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce('');

    await insult(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });

  chatInputCommandInteractionTest('Should insult the chat content', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce(faker.lorem.words(2));

    await insult(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });
});

describe('Insult Library test', () => {
  it('Should be able to generate a random insult', () => {
    const insultString = randomCreate();
    expectTypeOf(insultString).toBeString();
  });
});
