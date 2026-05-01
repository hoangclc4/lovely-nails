import { z } from 'zod';
import {
  EMPLOYEE_REVENUE_SHARE_MAX,
  EMPLOYEE_REVENUE_SHARE_MIN,
  EMPLOYEE_ROLE,
  EMPLOYEE_STATUS,
  EMPLOYEE_WORK_STATUS,
} from '@/constants/employee.constants';

export const employeeRoleSchema = z.enum([EMPLOYEE_ROLE.TECHNICIAN]);

export const employeeStatusSchema = z.enum([
  EMPLOYEE_STATUS.ACTIVE,
  EMPLOYEE_STATUS.INACTIVE,
  EMPLOYEE_STATUS.ON_LEAVE,
]);

export const employeeWorkStatusSchema = z.enum([
  EMPLOYEE_WORK_STATUS.FREE,
  EMPLOYEE_WORK_STATUS.BUSY,
  EMPLOYEE_WORK_STATUS.ON_BREAK,
  EMPLOYEE_WORK_STATUS.OFF,
]);

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1).max(100),
  phone: z.string().min(8).max(20),
  email: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().email().nullable().optional(),
  ),
  avatarUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url().nullable().optional(),
  ),
  revenueSharePct: z.number().min(EMPLOYEE_REVENUE_SHARE_MIN).max(EMPLOYEE_REVENUE_SHARE_MAX),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const updateEmployeeStatusSchema = z.object({
  status: employeeStatusSchema,
});

export const employeeListParamsSchema = z.object({
  status: employeeStatusSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const employeeSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  role: employeeRoleSchema,
  status: employeeStatusSchema,
  hireDate: z.string(),
  avatarUrl: z.string().nullable(),
  revenueSharePct: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const employeeWithWorkStatusSchema = employeeSchema.extend({
  workStatus: employeeWorkStatusSchema,
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type UpdateEmployeeStatusDto = z.infer<typeof updateEmployeeStatusSchema>;
export type EmployeeListParamsDto = z.infer<typeof employeeListParamsSchema>;
