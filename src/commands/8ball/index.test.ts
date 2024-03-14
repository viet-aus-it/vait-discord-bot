import { faker } from '@faker-js/faker';
import type { ChatInputCommandInteraction } from 'discord.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ask8Ball } from '.';

const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('ask 8Ball test', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should return yes or no randomly for any question', async () => {
    mockInteraction.options.getString.mockReturnValueOnce(faker.lorem.words(25));

    await ask8Ball(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
  });
});
