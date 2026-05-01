import { pgTable, uuid, text, timestamp, pgEnum, numeric } from 'drizzle-orm/pg-core';
import { employees } from './employees';
import { serviceSessions } from './service-sessions';
import { TIP_PAYMENT_METHOD } from '../../common/constants/tip.constants';

export const tipPaymentMethodEnum = pgEnum('tip_payment_method', [
  TIP_PAYMENT_METHOD.CASH,
  TIP_PAYMENT_METHOD.CARD,
  TIP_PAYMENT_METHOD.TRANSFER,
  TIP_PAYMENT_METHOD.INCLUDED_IN_BILL,
]);

export const tips = pgTable('tips', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => serviceSessions.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  customerId: uuid('customer_id'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: tipPaymentMethodEnum('payment_method').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TipRecord = typeof tips.$inferSelect;
export type NewTipRecord = typeof tips.$inferInsert;
