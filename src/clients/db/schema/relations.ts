import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  referralCode: {
    user: r.one.user({
      from: r.referralCode.userId,
      to: r.user.id,
    }),
  },
  user: {
    referralCodes: r.many.referralCode(),
    reminders: r.many.reminder(),
  },
  reminder: {
    user: r.one.user({
      from: r.reminder.userId,
      to: r.user.id,
    }),
  },
}));
