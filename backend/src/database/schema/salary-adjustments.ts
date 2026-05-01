import { pgTable, uuid, decimal, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { salaryRecords } from './salary-records';
import { ADJUSTMENT_TYPE } from '../../common/constants/salary.constants';

export const adjustmentTypeEnum = pgEnum('salary_adjustment_type', [
  ADJUSTMENT_TYPE.BONUS,
  ADJUSTMENT_TYPE.DEDUCTION,
  ADJUSTMENT_TYPE.ADVANCE,
  ADJUSTMENT_TYPE.PENALTY,
  ADJUSTMENT_TYPE.OTHER,
]);

export const salaryAdjustments = pgTable('salary_adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  salaryId: uuid('salary_id').notNull().references(() => salaryRecords.id),
  type: adjustmentTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SalaryAdjustmentRecord = typeof salaryAdjustments.$inferSelect;
export type NewSalaryAdjustmentRecord = typeof salaryAdjustments.$inferInsert;
