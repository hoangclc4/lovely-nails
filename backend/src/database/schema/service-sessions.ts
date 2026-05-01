import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees';
import { bookings } from './bookings';
import { SESSION_STATUS } from '../../common/constants/session.constants';

export const sessionStatusEnum = pgEnum('session_status', [
  SESSION_STATUS.IN_PROGRESS,
  SESSION_STATUS.COMPLETED,
  SESSION_STATUS.CANCELLED,
]);

export const serviceSessions = pgTable('service_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionNumber: text('session_number').unique(),
  bookingId: uuid('booking_id').references(() => bookings.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  customerId: uuid('customer_id'),
  customerName: text('customer_name'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  status: sessionStatusEnum('status').default(SESSION_STATUS.IN_PROGRESS).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ServiceSessionRecord = typeof serviceSessions.$inferSelect;
export type NewServiceSessionRecord = typeof serviceSessions.$inferInsert;
