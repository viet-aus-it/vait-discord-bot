import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { ask8Ball } from '.';

describe('ask 8Ball test', () => {
  chatInputCommandInteractionTest('Should return yes or no randomly for any question', async ({ interaction }) => {
    interaction.options.getString.mockReturnValueOnce(faker.lorem.words(25));

    await ask8Ball(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
  });
});
