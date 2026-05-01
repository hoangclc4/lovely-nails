import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { serviceSessions } from './service-sessions';
import { employees } from './employees';

export const sessionTimeExtensions = pgTable('session_time_extensions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => serviceSessions.id),
  extraMinutes: integer('extra_minutes').notNull(),
  reason: text('reason').notNull(),
  addedBy: uuid('added_by').references(() => employees.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SessionTimeExtensionRecord = typeof sessionTimeExtensions.$inferSelect;
export type NewSessionTimeExtensionRecord = typeof sessionTimeExtensions.$inferInsert;
