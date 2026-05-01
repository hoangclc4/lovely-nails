import { pgTable, uuid, decimal, integer } from 'drizzle-orm/pg-core';
import { serviceSessions } from './service-sessions';
import { services } from './services';

export const sessionServices = pgTable('session_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => serviceSessions.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  priceAtTime: decimal('price_at_time', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
});

export type SessionServiceRecord = typeof sessionServices.$inferSelect;
export type NewSessionServiceRecord = typeof sessionServices.$inferInsert;
