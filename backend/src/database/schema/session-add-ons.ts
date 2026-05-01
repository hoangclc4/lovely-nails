import { pgTable, uuid, decimal, varchar } from 'drizzle-orm/pg-core';
import { serviceSessions } from './service-sessions';

export const sessionAddOns = pgTable('session_add_ons', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => serviceSessions.id),
  name: varchar('name', { length: 100 }).notNull(),
  priceAtTime: decimal('price_at_time', { precision: 10, scale: 2 }).notNull(),
});

export type SessionAddOnRecord = typeof sessionAddOns.$inferSelect;
export type NewSessionAddOnRecord = typeof sessionAddOns.$inferInsert;
