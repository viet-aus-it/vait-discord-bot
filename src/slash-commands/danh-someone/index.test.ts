import type { ChatInputCommandInteraction, User } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { danhSomeone } from '.';
import { getRandomBoolean, getRandomIntInclusive } from '../../utils/random';

vi.mock('../../utils/random');
const mockRandomInt = vi.mocked(getRandomIntInclusive);
const mockRandomBoolean = vi.mocked(getRandomBoolean);
const mockInteraction = mockDeep<ChatInputCommandInteraction>();

describe('danhSomeone', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
    mockInteraction.client.user.id = '1';
    mockInteraction.member!.user.id = '2';
  });

  it('should not allow user to hit bot', () => {
    mockInteraction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '1' } as User;

      return null;
    });

    danhSomeone(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith("<@2>, I'm your father, you can't hit me.");
  });

  it('should not allow user to hit themself', () => {
    mockInteraction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '2' } as User;

      return null;
    });

    danhSomeone(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('Stop hitting yourself <@2>, hit someone else.');
  });

  it('should allow user to hit someone else', () => {
    mockInteraction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '3' } as User;

      return null;
    });
    mockRandomInt.mockReturnValueOnce(1);
    mockRandomBoolean.mockReturnValueOnce(false);

    danhSomeone(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('<@3> takes 1 dmg.');
  });

  it('should allow user to hit someone else with a crit', () => {
    mockInteraction.options.getUser.mockImplementationOnce((param: string) => {
      if (param === 'target1') return { id: '3' } as User;

      return null;
    });
    mockRandomInt.mockReturnValueOnce(1);
    mockRandomBoolean.mockReturnValueOnce(true);

    danhSomeone(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('<@3> takes 1 dmg. Critical Hit!');
  });

  it('should allow user to hit many people', () => {
    mockInteraction.options.getUser
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

    danhSomeone(mockInteraction);
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
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
