import { pgTable, uuid, text, date, time, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { employees } from './employees';
import { BOOKING_STATUS } from '../../common/constants/booking.constants';

export const bookingStatusEnum = pgEnum('booking_status', [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.NO_SHOW,
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingNumber: text('booking_number').notNull().unique(),
  customerId: uuid('customer_id'),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  serviceIds: text('service_ids').array().notNull().default([]),
  bookingDate: date('booking_date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  status: bookingStatusEnum('status').default(BOOKING_STATUS.PENDING).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type BookingRecord = typeof bookings.$inferSelect;
export type NewBookingRecord = typeof bookings.$inferInsert;
