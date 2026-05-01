import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const salonSettings = pgTable('salon_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SalonSettingRecord = typeof salonSettings.$inferSelect;
