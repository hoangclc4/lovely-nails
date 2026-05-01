import { pgTable, uuid, integer, decimal, timestamp, pgEnum, text } from 'drizzle-orm/pg-core';
import { employees } from './employees';
import { SALARY_STATUS } from '../../common/constants/salary.constants';

export const salaryStatusEnum = pgEnum('salary_status', [
  SALARY_STATUS.DRAFT,
  SALARY_STATUS.CONFIRMED,
  SALARY_STATUS.PAID,
]);

export const salaryRecords = pgTable('salary_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  totalServicesCount: integer('total_services_count').notNull().default(0),
  totalServiceRevenue: decimal('total_service_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  revenueSharePctSnapshot: decimal('revenue_share_pct_snapshot', { precision: 5, scale: 2 }).notNull(),
  technicianRevenueShare: decimal('technician_revenue_share', { precision: 12, scale: 2 }).notNull().default('0'),
  ownerRevenueShare: decimal('owner_revenue_share', { precision: 12, scale: 2 }).notNull().default('0'),
  totalTips: decimal('total_tips', { precision: 12, scale: 2 }).notNull().default('0'),
  bonuses: decimal('bonuses', { precision: 12, scale: 2 }).notNull().default('0'),
  deductions: decimal('deductions', { precision: 12, scale: 2 }).notNull().default('0'),
  grossPay: decimal('gross_pay', { precision: 12, scale: 2 }).notNull().default('0'),
  netPay: decimal('net_pay', { precision: 12, scale: 2 }).notNull().default('0'),
  status: salaryStatusEnum('status').notNull().default(SALARY_STATUS.DRAFT),
  notes: text('notes'),
  confirmedAt: timestamp('confirmed_at'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SalaryRecord = typeof salaryRecords.$inferSelect;
export type NewSalaryRecord = typeof salaryRecords.$inferInsert;
