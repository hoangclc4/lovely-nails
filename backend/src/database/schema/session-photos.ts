import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { employees } from './employees';
import { serviceSessions } from './service-sessions';
import { customers } from './customers';

export const sessionPhotos = pgTable('session_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => serviceSessions.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  customerId: uuid('customer_id').references(() => customers.id),
  photoUrl: text('photo_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  isPortfolio: boolean('is_portfolio').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SessionPhotoRecord = typeof sessionPhotos.$inferSelect;
export type NewSessionPhotoRecord = typeof sessionPhotos.$inferInsert;
