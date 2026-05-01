import { pgTable, uuid, varchar, text, integer, decimal, boolean, date, timestamp } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 100 }),
  dateOfBirth: date('date_of_birth'),
  notes: text('notes'),
  totalVisits: integer('total_visits').default(0).notNull(),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0').notNull(),
  lastVisitDate: date('last_visit_date'),
  noShowCount: integer('no_show_count').default(0).notNull(),
  lateCancelCount: integer('late_cancel_count').default(0).notNull(),
  isFlagged: boolean('is_flagged').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CustomerRecord = typeof customers.$inferSelect;
export type NewCustomerRecord = typeof customers.$inferInsert;
