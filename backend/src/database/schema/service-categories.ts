import { pgTable, uuid, varchar, text, integer, boolean } from 'drizzle-orm/pg-core';

export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export type ServiceCategoryRecord = typeof serviceCategories.$inferSelect;
export type NewServiceCategoryRecord = typeof serviceCategories.$inferInsert;
