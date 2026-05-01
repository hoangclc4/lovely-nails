import { pgTable, uuid, integer, time, boolean } from 'drizzle-orm/pg-core';
import { employees } from './employees';

export const employeeSchedule = pgTable('employee_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  isOff: boolean('is_off').default(false).notNull(),
});

export type EmployeeScheduleRecord = typeof employeeSchedule.$inferSelect;
export type NewEmployeeScheduleRecord = typeof employeeSchedule.$inferInsert;
