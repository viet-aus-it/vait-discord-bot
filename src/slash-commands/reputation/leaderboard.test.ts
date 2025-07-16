import { Collection, type GuildMember } from 'discord.js';
import { describe, expect, vi } from 'vitest';
import { chatInputCommandInteractionTest } from '../../../test/fixtures/chat-input-command-interaction';
import { DEFAULT_LEADERBOARD, getLeaderboard as getLeaderboardCommand, MAX_LEADERBOARD } from './leaderboard';
import { getRepLeaderboard } from './utils';

vi.mock('./utils');
const mockGetRepLeaderboard = vi.mocked(getRepLeaderboard);

describe('leaderboard', () => {
  chatInputCommandInteractionTest('Should send reply error if it cannot retrieve the rep leaderboard', async ({ interaction }) => {
    mockGetRepLeaderboard.mockResolvedValueOnce([]);

    await getLeaderboardCommand(interaction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith('No one has rep to be on the leaderboard, yet.');
  });

  chatInputCommandInteractionTest('Should create a leaderboard entry with nickname if it can be fetched', async ({ interaction }) => {
    const userid = '1';
    mockGetRepLeaderboard.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    mockMembers.set(userid, { nickname: 'sam', displayName: 'sammy' } as GuildMember);
    interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(interaction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1      sam   0
\`\`\``
    );
  });

  chatInputCommandInteractionTest(
    'Should create a leaderboard entry with displayName if it can be fetched and nickname cannot be fetched',
    async ({ interaction }) => {
      const userid = '1';
      mockGetRepLeaderboard.mockResolvedValueOnce([
        {
          id: userid,
          reputation: 0,
        },
      ]);
      const mockMembers = new Collection<string, GuildMember>();
      mockMembers.set(userid, { nickname: null, displayName: 'sammy' } as GuildMember);
      interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

      await getLeaderboardCommand(interaction);

      expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
      expect(interaction.reply).toHaveBeenCalledOnce();
      expect(interaction.reply).toHaveBeenCalledWith(
        `\`\`\`
 # username rep
 1    sammy   0
\`\`\``
      );
    }
  );

  chatInputCommandInteractionTest('Should create a leaderboard entry with userid if it cannot retrieve the member', async ({ interaction }) => {
    const userid = '1';
    mockGetRepLeaderboard.mockResolvedValueOnce([
      {
        id: userid,
        reputation: 0,
      },
    ]);
    const mockMembers = new Collection<string, GuildMember>();
    interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(interaction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1        1   0
\`\`\``
    );
  });

  chatInputCommandInteractionTest('Should send reply with leaderboard with more than 1 record in correct order', async ({ interaction }) => {
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
    interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(interaction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1        3   3
 2     sam2   2
 3      sam   1
\`\`\``
    );
  });

  chatInputCommandInteractionTest(`should reject if it goes over MAX of ${MAX_LEADERBOARD}`, async ({ interaction }) => {
    interaction.options.getNumber.mockReturnValueOnce(MAX_LEADERBOARD + 1);

    getLeaderboardCommand(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(`The size is too big. Max is ${MAX_LEADERBOARD}`);
  });

  chatInputCommandInteractionTest('Should send reply with leaderboard with provided number', async ({ interaction }) => {
    interaction.options.getNumber.mockReturnValueOnce(3);
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
    interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(interaction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      `\`\`\`
 # username rep
 1     sam3   3
 2     sam2   2
 3      sam   1
\`\`\``
    );
  });

  chatInputCommandInteractionTest(`should send reply leaderboard with a default of ${DEFAULT_LEADERBOARD}`, async ({ interaction }) => {
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
    interaction.guild!.members.fetch.mockResolvedValueOnce(mockMembers);

    await getLeaderboardCommand(interaction);

    expect(mockGetRepLeaderboard).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
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
