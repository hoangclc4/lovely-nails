import { pgTable, uuid, varchar, decimal, integer, boolean } from 'drizzle-orm/pg-core';

export const serviceAddOns = pgTable('service_add_ons', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export type ServiceAddOnRecord = typeof serviceAddOns.$inferSelect;
export type NewServiceAddOnRecord = typeof serviceAddOns.$inferInsert;
