import { faker } from '@faker-js/faker';
import type { ChatInputCommandInteraction } from 'discord.js';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { insult } from '.';
import { randomCreate } from './insult-generator';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('Insult someone test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should send an insult when the cmd is sent', async () => {
    mockInteraction.options.getString.mockReturnValueOnce('');

    await insult(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });

  it('Should insult the chat content', async () => {
    mockInteraction.options.getString.mockReturnValueOnce(faker.lorem.words(2));

    await insult(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });
});

describe('Insult Library test', () => {
  it('Should be able to generate a random insult', () => {
    const insultString = randomCreate();
    expectTypeOf(insultString).toBeString();
  });
});
