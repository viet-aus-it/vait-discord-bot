import { createId } from '@paralleldrive/cuid2';
import { sql, type InferSelectModel } from 'drizzle-orm';
import { foreignKey, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const aocLeaderboard = pgTable(
  'AocLeaderboard',
  {
    guildId: text().notNull(),
    result: jsonb().notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('AocLeaderboard_guildId_idx').using('btree', table.guildId.asc().nullsLast()),
    uniqueIndex('AocLeaderboard_guildId_key').using('btree', table.guildId.asc().nullsLast()),
  ]
);

export const referralCode = pgTable(
  'ReferralCode',
  {
    id: text()
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    service: text().notNull(),
    code: text().notNull(),
    expiryDate: timestamp('expiry_date', { precision: 3, mode: 'date' }).notNull(),
    guildId: text().notNull(),
    userId: text().notNull(),
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [user.id], name: 'ReferralCode_userId_fkey' })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);

export const reminder = pgTable(
  'Reminder',
  {
    id: text()
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    onTimestamp: integer().notNull(),
    message: text().notNull(),
    guildId: text().notNull(),
  },
  (table) => [
    index('Reminder_id_idx').using('btree', table.id.asc().nullsLast()),
    index('Reminder_userId_idx').using('btree', table.userId.asc().nullsLast()),
    foreignKey({ columns: [table.userId], foreignColumns: [user.id], name: 'Reminder_userId_fkey' })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);

export const reputationLog = pgTable(
  'ReputationLog',
  {
    id: text()
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    fromUserId: text().notNull(),
    toUserId: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    operation: jsonb().default({}).notNull(),
  },
  (table) => [
    foreignKey({ columns: [table.fromUserId], foreignColumns: [user.id], name: 'ReputationLog_fromUserId_fkey' })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({ columns: [table.toUserId], foreignColumns: [user.id], name: 'ReputationLog_toUserId_fkey' })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);

export const serverChannelsSettings = pgTable(
  'ServerChannelsSettings',
  {
    guildId: text().notNull(),
    reminderChannel: text(),
    autobumpThreads: text()
      .array()
      .default(sql`ARRAY[]::text[]`),
    aocKey: text(),
    aocLeaderboardId: text(),
    honeypotChannel: text(),
  },
  (table) => [
    index('ServerChannelsSettings_guildId_idx').using('btree', table.guildId.asc().nullsLast()),
    uniqueIndex('ServerChannelsSettings_guildId_key').using('btree', table.guildId.asc().nullsLast()),
    uniqueIndex('ServerChannelsSettings_reminderChannel_key').using('btree', table.reminderChannel.asc().nullsLast()),
  ]
);

export const user = pgTable('User', {
  id: text().primaryKey().notNull(),
  reputation: integer().default(0).notNull(),
});

export type UserSelect = InferSelectModel<typeof user>;
export type ReputationLogSelect = InferSelectModel<typeof reputationLog>;
export type ReferralCodeSelect = InferSelectModel<typeof referralCode>;
export type ReminderSelect = InferSelectModel<typeof reminder>;
export type ServerChannelsSettingsSelect = InferSelectModel<typeof serverChannelsSettings>;
export type AocLeaderboardSelect = InferSelectModel<typeof aocLeaderboard>;
