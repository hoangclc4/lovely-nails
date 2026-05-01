import { pgTable, uuid, text, date, time, decimal, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { INCIDENT_TYPE } from '../../common/constants/incident.constants';
import { bookings } from './bookings';
import { customers } from './customers';
import { employees } from './employees';

export const incidentTypeEnum = pgEnum('incident_type', [
  INCIDENT_TYPE.NO_SHOW,
  INCIDENT_TYPE.LATE_CANCEL,
]);

export const bookingIncidents = pgTable('booking_incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  customerId: uuid('customer_id').references(() => customers.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  type: incidentTypeEnum('type').notNull(),
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: time('scheduled_time').notNull(),
  estimatedRevenueLost: decimal('estimated_revenue_lost', { precision: 10, scale: 2 }).default('0').notNull(),
  notes: text('notes'),
  excused: boolean('excused').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type BookingIncidentRecord = typeof bookingIncidents.$inferSelect;
export type NewBookingIncidentRecord = typeof bookingIncidents.$inferInsert;
