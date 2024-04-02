import { type ChatInputCommandInteraction, Collection, type GuildMember } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { getTop10 } from './_helpers';
import { getLeaderboard as getLeaderboardCommand } from './leaderboard';

vi.mock('./_helpers');
const mockGetTop10 = vi.mocked(getTop10);

const mockInteraction = mockDeep<ChatInputCommandInteraction<'cached'>>();

describe('leaderboard', () => {
  beforeEach(() => {
    mockReset(mockInteraction);
  });

  it('Should send reply error if it cannot retrieve the top 10', async () => {
    mockGetTop10.mockResolvedValueOnce([]);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetTop10).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith('No one has rep to be on the leaderboard, yet.');
  });

  it('Should create a leaderboard entry with nickname if it can be fetched', async () => {
    const userid = '1';
    mockGetTop10.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockMembers.set(userid, { nickname: 'sam', displayName: 'sammy' } as GuildMember);
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetTop10).toHaveBeenCalledOnce();
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
    mockGetTop10.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockMembers.set(userid, { nickname: null, displayName: 'sammy' } as GuildMember);
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetTop10).toHaveBeenCalledOnce();
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
    mockGetTop10.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockInteraction.guild.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(mockInteraction);

    expect(mockGetTop10).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledOnce();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1        1   0
\`\`\``
    );
  });

  it('Should send reply with leaderboard with more than 1 record in correct order', async () => {
    mockGetTop10.mockResolvedValueOnce([
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

    expect(mockGetTop10).toHaveBeenCalledOnce();
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
});
