import { relations } from 'drizzle-orm/relations';

import { user, reputationLog, referralCode, reminder } from './schema';

export const reputationLogRelations = relations(reputationLog, ({ one }) => ({
  user_fromUserId: one(user, {
    fields: [reputationLog.fromUserId],
    references: [user.id],
    relationName: 'reputationLog_fromUserId_user_id',
  }),
  user_toUserId: one(user, {
    fields: [reputationLog.toUserId],
    references: [user.id],
    relationName: 'reputationLog_toUserId_user_id',
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  reputationLogs_fromUserId: many(reputationLog, {
    relationName: 'reputationLog_fromUserId_user_id',
  }),
  reputationLogs_toUserId: many(reputationLog, {
    relationName: 'reputationLog_toUserId_user_id',
  }),
  referralCodes: many(referralCode),
  reminders: many(reminder),
}));

export const referralCodeRelations = relations(referralCode, ({ one }) => ({
  user: one(user, {
    fields: [referralCode.userId],
    references: [user.id],
  }),
}));

export const reminderRelations = relations(reminder, ({ one }) => ({
  user: one(user, {
    fields: [reminder.userId],
    references: [user.id],
  }),
}));
