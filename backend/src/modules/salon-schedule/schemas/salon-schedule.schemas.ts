import { z } from 'zod';
import { DAYS_OF_WEEK } from '../../../common/constants/booking.constants';

const TIME_REGEX = /^\d{2}:\d{2}$/;

const MIN_DAY_OF_WEEK = DAYS_OF_WEEK.SUNDAY;
const MAX_DAY_OF_WEEK = DAYS_OF_WEEK.SATURDAY;

export const upsertSalonScheduleSchema = z.object({
  openTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  closeTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  isClosed: z.boolean().optional(),
});

export const dayOfWeekParamSchema = z.coerce
  .number()
  .int()
  .min(MIN_DAY_OF_WEEK)
  .max(MAX_DAY_OF_WEEK);

export type UpsertSalonScheduleDto = z.infer<typeof upsertSalonScheduleSchema>;
