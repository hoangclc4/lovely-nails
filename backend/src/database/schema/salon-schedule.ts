import { pgTable, uuid, integer, time, boolean } from 'drizzle-orm/pg-core';

export const salonSchedule = pgTable('salon_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(),
  openTime: time('open_time').notNull(),
  closeTime: time('close_time').notNull(),
  isClosed: boolean('is_closed').default(false).notNull(),
});

export type SalonScheduleRecord = typeof salonSchedule.$inferSelect;
export type NewSalonScheduleRecord = typeof salonSchedule.$inferInsert;
