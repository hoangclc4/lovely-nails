import { z } from 'zod';
import {
  EMPLOYEE_REVENUE_SHARE_MAX,
  EMPLOYEE_REVENUE_SHARE_MIN,
  EMPLOYEE_ROLE,
  EMPLOYEE_STATUS,
  EMPLOYEE_WORK_STATUS,
} from '../../../common/constants/employee.constants';

export type EmployeeRole = (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE];
export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export type EmployeeWorkStatus = (typeof EMPLOYEE_WORK_STATUS)[keyof typeof EMPLOYEE_WORK_STATUS];

export interface Employee {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: EmployeeRole;
  status: EmployeeStatus;
  hireDate: string;
  avatarUrl: string | null;
  revenueSharePct: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithWorkStatus extends Employee {
  workStatus: EmployeeWorkStatus;
}

export interface EmployeeListParams {
  status?: EmployeeStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export const employeeRoleSchema = z.enum([EMPLOYEE_ROLE.TECHNICIAN]);

export const employeeStatusSchema = z.enum([
  EMPLOYEE_STATUS.ACTIVE,
  EMPLOYEE_STATUS.INACTIVE,
  EMPLOYEE_STATUS.ON_LEAVE,
]);

export const employeeWorkStatusSchema = z.enum([
  EMPLOYEE_WORK_STATUS.FREE,
  EMPLOYEE_WORK_STATUS.BUSY,
]);

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1).max(100),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
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

export interface EmployeeStatusSummary {
  id: string;
  fullName: string;
  status: EmployeeStatus;
  workStatus: EmployeeWorkStatus;
}

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type UpdateEmployeeStatusDto = z.infer<typeof updateEmployeeStatusSchema>;
export type EmployeeListParamsDto = z.infer<typeof employeeListParamsSchema>;
