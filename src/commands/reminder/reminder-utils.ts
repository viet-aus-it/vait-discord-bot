import { Reminder } from '@prisma/client';
import { isAfter, isEqual } from 'date-fns';
import { getPrismaClient } from '../../clients';
import { OpResult } from '../../utils/opResult';

type SaveReminderInput = {
  userId: string;
  guildId: string;
  message: string;
  timestamp: number;
};
export const saveReminder = async ({
  userId,
  guildId,
  message,
  timestamp,
}: SaveReminderInput): OpResult<Reminder> => {
  try {
    const currentDate = new Date();
    if (isAfter(currentDate, timestamp) || isEqual(currentDate, timestamp)) {
      throw new Error('EXPIRED DATE');
    }

    const prisma = getPrismaClient();
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        guildId,
        onTimestamp: timestamp,
        message,
      },
    });

    return {
      success: true,
      data: reminder,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error,
    };
  }
};
