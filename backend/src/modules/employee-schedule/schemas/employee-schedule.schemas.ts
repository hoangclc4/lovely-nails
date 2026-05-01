import { z } from 'zod';
import { DAYS_OF_WEEK } from '../../../common/constants/booking.constants';

const TIME_REGEX = /^\d{2}:\d{2}$/;

const MIN_DAY_OF_WEEK = DAYS_OF_WEEK.SUNDAY;
const MAX_DAY_OF_WEEK = DAYS_OF_WEEK.SATURDAY;

export const upsertEmployeeScheduleSchema = z.object({
  startTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  endTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  isOff: z.boolean().optional(),
});

export const dayOfWeekParamSchema = z.coerce
  .number()
  .int()
  .min(MIN_DAY_OF_WEEK)
  .max(MAX_DAY_OF_WEEK);

export const employeeScheduleListParamsSchema = z.object({
  employeeId: z.string().uuid().optional(),
});

export type UpsertEmployeeScheduleDto = z.infer<typeof upsertEmployeeScheduleSchema>;
export type EmployeeScheduleListParams = z.infer<typeof employeeScheduleListParamsSchema>;
