import { faker } from '@faker-js/faker';
import { type ChatInputCommandInteraction, Collection, type GuildMember } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { getRepLeaderboard } from './_helpers';
import { DEFAULT_LEADERBOARD, MAX_LEADERBOARD, getLeaderboard as getLeaderboardCommand } from './leaderboard';

vi.mock('./_helpers');
const mockGetRepLeaderboard = vi.mocked(getRepLeaderboard);

const mockInteraction = mockDeep<ChatInputCommandInteraction<'cached'>>();

describe('leaderboard', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should send reply error if it cannot retrieve the rep leaderboard', async () => {
    mockGetRepLeaderboard.mockResolvedValueOnce([]);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('No one has rep to be on the leaderboard, yet.');
  });

  it('Should create a leaderboard entry with nickname if it can be fetched', async () => {
    const userid = '1';
    mockGetRepLeaderboard.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockMembers.set(userid, { nickname: 'sam', displayName: 'sammy' } as GuildMember);
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1      sam   0
\`\`\``
    );
  });

  it('Should create a leaderboard entry with displayName if it can be fetched and nickname cannot be fetched', async () => {
    const userid = '1';
    mockGetRepLeaderboard.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockMembers.set(userid, { nickname: null, displayName: 'sammy' } as GuildMember);
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1    sammy   0
\`\`\``
    );
  });

  it('Should create a leaderboard entry with userid if it cannot retrieve the member', async () => {
    const userid = '1';
    mockGetRepLeaderboard.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1        1   0
\`\`\``
    );
  });

  it('Should send reply with leaderboard with more than 1 record in correct order', async () => {
    mockGetRepLeaderboard.mockResolvedValueOnce([
      {
        id: '3',
        reputation: 3,
      },
      {
        id: '2',
        reputation: 2,
      },
      {
        id: '1',
        reputation: 1,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockMembers.set('1', { nickname: 'sam' } as GuildMember);
    mockMembers.set('2', { nickname: null, displayName: 'sam2' } as GuildMember);
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1        3   3
 2     sam2   2
 3      sam   1
\`\`\``
    );
  });

  it(`should reject if it goes over MAX of ${MAX_LEADERBOARD}`, () => {
    mockInteraction.options.getNumber.mockReturnValueOnce(MAX_LEADERBOARD + 1);

    getLeaderboardCommand(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`The size is too big. Max is ${MAX_LEADERBOARD}`);
  });

  it('Should send reply with leaderboard with provided number', async () => {
    mockInteraction.options.getNumber.mockReturnValueOnce(3);
    mockGetRepLeaderboard.mockResolvedValueOnce([
      {
        id: '3',
        reputation: 3,
      },
      {
        id: '2',
        reputation: 2,
      },
      {
        id: '1',
        reputation: 1,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockMembers.set('1', { nickname: 'sam' } as GuildMember);
    mockMembers.set('2', { nickname: 'sam2' } as GuildMember);
    mockMembers.set('3', { nickname: 'sam3' } as GuildMember);
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1     sam3   3
 2     sam2   2
 3      sam   1
\`\`\``
    );
  });

  it(`should send reply leaderboard with a default of ${DEFAULT_LEADERBOARD}`, async () => {
    const mockRepLeaderboard: Awaited<ReturnType<typeof getRepLeaderboard>> = [];
    const mockMembers = new Collection<string, GuildMember>();
    for (let i = DEFAULT_LEADERBOARD; i >= 1; i--) {
      mockMembers.set(`${i}`, { nickname: `sam${i}` } as GuildMember);
      mockRepLeaderboard.push({
        id: `${i}`,
        reputation: i,
      });
    }
    mockGetRepLeaderboard.mockResolvedValueOnce(mockRepLeaderboard);
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1    sam10  10
 2     sam9   9
 3     sam8   8
 4     sam7   7
 5     sam6   6
 6     sam5   5
 7     sam4   4
 8     sam3   3
 9     sam2   2
10     sam1   1
\`\`\``
    );
  });
});
