import type { User } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { danhSomeone } from '.';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { getRandomBoolean, getRandomIntInclusive } from '../../utils/random';

vi.mock('../../utils/random');
const mockRandomInt = vi.mocked(getRandomIntInclusive);
const mockRandomBoolean = vi.mocked(getRandomBoolean);

describe('danhSomeone', () => {
  chatInputCommandInteractionTest('should not allow user to hit bot', ({ interaction }) => {
    interaction.client.user.id = '1';
    interaction.member!.user.id = '2';
    interaction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '1' } as User;

      return null;
    });

    danhSomeone(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("<@2>, I'm your father, you can't hit me.");
  });

  chatInputCommandInteractionTest('should not allow user to hit themself', ({ interaction }) => {
    interaction.client.user.id = '1';
    interaction.member!.user.id = '2';
    interaction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '2' } as User;

      return null;
    });

    danhSomeone(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('Stop hitting yourself <@2>, hit someone else.');
  });

  chatInputCommandInteractionTest('should allow user to hit someone else', ({ interaction }) => {
    interaction.client.user.id = '1';
    interaction.member!.user.id = '2';
    interaction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '3' } as User;

      return null;
    });
    mockRandomInt.mockReturnValueOnce(1);
    mockRandomBoolean.mockReturnValueOnce(false);

    danhSomeone(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('<@3> takes 1 dmg.');
  });

  chatInputCommandInteractionTest('should allow user to hit someone else with a crit', ({ interaction }) => {
    interaction.client.user.id = '1';
    interaction.member!.user.id = '2';
    interaction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '3' } as User;

      return null;
    });
    mockRandomInt.mockReturnValueOnce(1);
    mockRandomBoolean.mockReturnValueOnce(true);

    danhSomeone(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('<@3> takes 1 dmg. Critical Hit!');
  });

  chatInputCommandInteractionTest('should allow user to hit many people', ({ interaction }) => {
    interaction.client.user.id = '1';
    interaction.member!.user.id = '2';
    interaction.options.getUser
      .mockReturnValueOnce({ id: '3' } as User)
      .mockReturnValueOnce({ id: '4' } as User)
      .mockReturnValueOnce({ id: '5' } as User)
      .mockReturnValueOnce({ id: '6' } as User)
      .mockReturnValueOnce({ id: '7' } as User)
      .mockReturnValueOnce({ id: '8' } as User)
      .mockReturnValueOnce({ id: '9' } as User)
      .mockReturnValueOnce({ id: '10' } as User)
      .mockReturnValueOnce({ id: '11' } as User)
      .mockReturnValueOnce({ id: '12' } as User);
    mockRandomInt.mockReturnValue(1);
    mockRandomBoolean.mockReturnValueOnce(false);

    danhSomeone(interaction);
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `<@3> takes 1 dmg.
<@4> takes 1 dmg.
<@5> takes 1 dmg.
<@6> takes 1 dmg.
<@7> takes 1 dmg.
<@8> takes 1 dmg.
<@9> takes 1 dmg.
<@10> takes 1 dmg.
<@11> takes 1 dmg.
<@12> takes 1 dmg.`
    );
  });
});
