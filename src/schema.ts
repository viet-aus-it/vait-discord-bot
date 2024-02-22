import { sql } from 'drizzle-orm';
import { foreignKey, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const prismaMigrations = pgTable('_prisma_migrations', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'string' }),
  migrationName: varchar('migration_name', { length: 255 }).notNull(),
  logs: text('logs'),
  rolledBackAt: timestamp('rolled_back_at', { withTimezone: true, mode: 'string' }),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  appliedStepsCount: integer('applied_steps_count').default(0).notNull(),
});

export const user = pgTable('User', {
  id: text('id').primaryKey().notNull(),
  reputation: integer('reputation').default(0).notNull(),
});

export const reputationLog = pgTable('ReputationLog', {
  id: text('id').primaryKey().notNull(),
  fromUserId: text('fromUserId')
    .notNull()
    .references(() => user.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  toUserId: text('toUserId')
    .notNull()
    .references(() => user.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'string' }).defaultNow().notNull(),
  operation: jsonb('operation').default({}).notNull(),
});

export const referralCode = pgTable(
  'ReferralCode',
  {
    id: text('id').primaryKey().notNull(),
    service: text('service').notNull(),
    code: text('code').notNull(),
    expiryDate: timestamp('expiry_date', { precision: 3, mode: 'string' }).notNull(),
  },
  (table) => {
    return {
      codeKey: uniqueIndex('ReferralCode_code_key').on(table.code),
    };
  }
);

export const serverChannelsSettings = pgTable(
  'ServerChannelsSettings',
  {
    guildId: text('guildId').notNull(),
    reminderChannel: text('reminderChannel'),
    autobumpThreads: text('autobumpThreads').default('RRAY[').array(),
  },
  (table) => {
    return {
      guildIdKey: uniqueIndex('ServerChannelsSettings_guildId_key').on(table.guildId),
      reminderChannelKey: uniqueIndex('ServerChannelsSettings_reminderChannel_key').on(table.reminderChannel),
      guildIdIdx: index('ServerChannelsSettings_guildId_idx').on(table.guildId),
    };
  }
);

export const reminder = pgTable(
  'Reminder',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    onTimestamp: integer('onTimestamp').notNull(),
    message: text('message').notNull(),
    guildId: text('guildId').notNull(),
  },
  (table) => {
    return {
      idIdx: index('Reminder_id_idx').on(table.id),
      userIdIdx: index('Reminder_userId_idx').on(table.userId),
    };
  }
);
