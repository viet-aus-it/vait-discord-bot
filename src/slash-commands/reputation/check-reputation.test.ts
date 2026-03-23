import { describe, expect } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { checkReputation } from './check-reputation';

describe('checkReputation', () => {
  chatInputCommandInteractionTest('should send reply with user rep', async ({ interaction }) => {
    interaction.member!.user.id = '1';

    await checkReputation(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('<@1>: 0 Rep');
  });
});
