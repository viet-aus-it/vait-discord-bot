import { getUnixTime, isAfter, isEqual } from 'date-fns';
import { getDbClient } from '../../clients';
import type { Reminder } from '../../clients/prisma/generated/client/client';
import { tracer } from '../../utils/tracer';

type SaveReminderInput = {
  userId: string;
  guildId: string;
  message: string;
  timestamp: number;
};
export const saveReminder = async ({ userId, guildId, message, timestamp }: SaveReminderInput) => {
  return tracer.startActiveSpan('db.reminder.save', async (span) => {
    try {
      const currentDate = getUnixTime(new Date());
      if (isAfter(currentDate, timestamp) || isEqual(currentDate, timestamp)) {
        throw new Error('EXPIRED DATE');
      }

      const db = getDbClient();
      const reminder = await db.reminder.create({
        data: {
          userId,
          guildId,
          onTimestamp: timestamp,
          message,
        },
      });

      return reminder;
    } finally {
      span.end();
    }
  });
};

type UpdateReminderInput = {
  userId: string;
  guildId: string;
  reminderId: string;
  message?: string;
  timestamp?: number;
};
export const updateReminder = async ({ userId, guildId, reminderId, message, timestamp }: UpdateReminderInput) => {
  return tracer.startActiveSpan('db.reminder.update', async (span) => {
    try {
      const currentDate = getUnixTime(new Date());
      if (timestamp && (isAfter(currentDate, timestamp) || isEqual(currentDate, timestamp))) {
        throw new Error('EXPIRED DATE');
      }

      const db = getDbClient();
      let reminder = await db.reminder.findFirstOrThrow({
        where: { id: reminderId, userId, guildId },
      });

      reminder = await db.reminder.update({
        where: {
          id: reminderId,
        },
        data: {
          message: message ?? reminder.message,
          onTimestamp: timestamp || reminder.onTimestamp,
        },
      });

      return reminder;
    } finally {
      span.end();
    }
  });
};

export const getUserReminders = async (userId: string, guildId: string) => {
  return tracer.startActiveSpan('db.reminder.getUserReminders', async (span) => {
    try {
      const db = getDbClient();
      const reminders = await db.reminder.findMany({
        where: {
          userId,
          guildId,
          onTimestamp: {
            gte: getUnixTime(new Date()),
          },
        },
      });

      return reminders;
    } finally {
      span.end();
    }
  });
};

type RemoveReminderInput = {
  userId: string;
  guildId: string;
  reminderId: string;
};
export const removeReminder = async ({ userId, guildId, reminderId }: RemoveReminderInput) => {
  return tracer.startActiveSpan('db.reminder.remove', async (span) => {
    try {
      const db = getDbClient();
      await db.reminder.deleteMany({
        where: {
          id: reminderId,
          userId,
          guildId,
        },
      });

      return;
    } finally {
      span.end();
    }
  });
};

export const formatReminderMessage = ({ userId, message, onTimestamp }: Reminder) => {
  return `Reminder for <@${userId}> on <t:${onTimestamp}> \nmessage: ${message}`;
};

export const getReminderByTime = async (timestamp: number) => {
  return tracer.startActiveSpan('db.reminder.getByTime', async (span) => {
    try {
      const db = getDbClient();
      const reminders = await db.reminder.findMany({
        where: {
          onTimestamp: {
            lte: timestamp,
          },
        },
      });

      return reminders;
    } finally {
      span.end();
    }
  });
};

export const removeReminders = async (reminders: Reminder[]) => {
  return tracer.startActiveSpan('db.reminder.removeMany', async (span) => {
    try {
      const db = getDbClient();
      await db.reminder.deleteMany({
        where: {
          id: {
            in: reminders.map((r) => r.id),
          },
        },
      });

      return;
    } finally {
      span.end();
    }
  });
};
