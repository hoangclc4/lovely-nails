import { pgTable, uuid, timestamp, integer, text, date } from 'drizzle-orm/pg-core';
import { employees } from './employees';

export const workShifts = pgTable('work_shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  clockIn: timestamp('clock_in').notNull(),
  clockOut: timestamp('clock_out'),
  breakMinutes: integer('break_minutes').default(0).notNull(),
  date: date('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type WorkShiftRecord = typeof workShifts.$inferSelect;
export type NewWorkShiftRecord = typeof workShifts.$inferInsert;
