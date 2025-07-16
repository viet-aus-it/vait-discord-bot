import { z } from 'zod';

export const Member = z
  .looseObject({
    id: z.coerce.number(),
    name: z.string().nullish(),
    local_score: z.number(),
  })
  .transform((m): typeof m & { name: string } => {
    if (!m.name) {
      return {
        ...m,
        name: `(anonymous user ${m.id})`,
      };
    }

    return m as typeof m & { name: string };
  });
export type Member = z.infer<typeof Member>;

export const AocLeaderboard = z
  .looseObject({
    event: z.coerce.number(),
    members: z.record(z.string(), Member),
  })
  .transform((board) => {
    const sortedMembers = Object.values(board.members)
      .toSorted((prev, next) => next.local_score - prev.local_score)
      .reduce(
        (accum, member) => {
          accum[member.id] = member;
          return accum;
        },
        {} as Record<string, Member>
      );
    return {
      ...board,
      members: sortedMembers,
    };
  });
export type AocLeaderboard = z.infer<typeof AocLeaderboard>;
