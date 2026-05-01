import { pgTable, uuid, varchar, decimal, timestamp, pgEnum, text, date } from 'drizzle-orm/pg-core';
import { EMPLOYEE_ROLE, EMPLOYEE_STATUS } from '../../common/constants/employee.constants';

export const employeeStatusEnum = pgEnum('employee_status', [
  EMPLOYEE_STATUS.ACTIVE,
  EMPLOYEE_STATUS.INACTIVE,
  EMPLOYEE_STATUS.ON_LEAVE,
]);

export const employeeRoleEnum = pgEnum('employee_role', [EMPLOYEE_ROLE.TECHNICIAN]);

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }),
  role: employeeRoleEnum('role').default(EMPLOYEE_ROLE.TECHNICIAN).notNull(),
  status: employeeStatusEnum('status').default(EMPLOYEE_STATUS.ACTIVE).notNull(),
  hireDate: date('hire_date').notNull(),
  avatarUrl: text('avatar_url'),
  revenueSharePct: decimal('revenue_share_pct', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type EmployeeRecord = typeof employees.$inferSelect;
export type NewEmployeeRecord = typeof employees.$inferInsert;
