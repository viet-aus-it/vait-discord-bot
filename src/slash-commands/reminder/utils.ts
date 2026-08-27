import { getUnixTime, isAfter, isEqual } from 'date-fns';
import { and, eq, gte, inArray, lte, type InferSelectModel } from 'drizzle-orm';

import { getDbClient } from '../../clients';
import { reminder } from '../../clients/database/schema/schema';

type SaveReminderInput = {
  userId: string;
  guildId: string;
  message: string;
  timestamp: number;
};
export const saveReminder = async ({ userId, guildId, message, timestamp }: SaveReminderInput) => {
  const currentDate = getUnixTime(new Date());
  if (isAfter(currentDate, timestamp) || isEqual(currentDate, timestamp)) {
    throw new Error('EXPIRED DATE');
  }

  const db = getDbClient();
  const [row] = await db.insert(reminder).values({ userId, guildId, onTimestamp: timestamp, message }).returning();

  return row;
};

type UpdateReminderInput = {
  userId: string;
  guildId: string;
  reminderId: string;
  message?: string;
  timestamp?: number;
};
export const updateReminder = async ({ userId, guildId, reminderId, message, timestamp }: UpdateReminderInput) => {
  const currentDate = getUnixTime(new Date());
  if (timestamp && (isAfter(currentDate, timestamp) || isEqual(currentDate, timestamp))) {
    throw new Error('EXPIRED DATE');
  }

  const db = getDbClient();
  const found = await db
    .select()
    .from(reminder)
    .where(and(eq(reminder.id, reminderId), eq(reminder.userId, userId), eq(reminder.guildId, guildId)))
    .limit(1);
  const foundReminder = found[0];
  if (!foundReminder) {
    throw new Error('Reminder not found');
  }

  const [row] = await db
    .update(reminder)
    .set({
      message: message ?? foundReminder.message,
      onTimestamp: timestamp || foundReminder.onTimestamp,
    })
    .where(eq(reminder.id, reminderId))
    .returning();

  return row;
};

export const getUserReminders = async (userId: string, guildId: string) => {
  const db = getDbClient();
  const rows = await db
    .select()
    .from(reminder)
    .where(and(eq(reminder.userId, userId), eq(reminder.guildId, guildId), gte(reminder.onTimestamp, getUnixTime(new Date()))));

  return rows;
};

type RemoveReminderInput = {
  userId: string;
  guildId: string;
  reminderId: string;
};
export const removeReminder = async ({ userId, guildId, reminderId }: RemoveReminderInput) => {
  const db = getDbClient();
  await db.delete(reminder).where(and(eq(reminder.userId, userId), eq(reminder.guildId, guildId), eq(reminder.id, reminderId)));

  return;
};

export const formatReminderMessage = ({ userId, message, onTimestamp }: InferSelectModel<typeof reminder>) => {
  return `Reminder for <@${userId}> on <t:${onTimestamp}> \nmessage: ${message}`;
};

export const getReminderByTime = async (timestamp: number) => {
  const db = getDbClient();
  const rows = await db.select().from(reminder).where(lte(reminder.onTimestamp, timestamp));

  return rows;
};

export const removeReminders = async (reminders: InferSelectModel<typeof reminder>[]) => {
  const db = getDbClient();
  await db.delete(reminder).where(
    inArray(
      reminder.id,
      reminders.map((r) => r.id)
    )
  );

  return;
};
