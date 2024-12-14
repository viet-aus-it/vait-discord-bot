import { z } from 'zod';

export const Member = z
  .object({
    id: z.coerce.number(),
    name: z.string().nullish(),
    local_score: z.number(),
  })
  .passthrough()
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
  .object({
    event: z.coerce.number(),
    members: z.record(z.string(), Member),
  })
  .passthrough()
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
