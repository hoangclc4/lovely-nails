import { z } from 'zod';
import { SALARY_STATUS, ADJUSTMENT_TYPE } from '../../../common/constants/salary.constants';

const salaryStatusValues = [
  SALARY_STATUS.DRAFT,
  SALARY_STATUS.CONFIRMED,
  SALARY_STATUS.PAID,
] as const;

const adjustmentTypeValues = [
  ADJUSTMENT_TYPE.BONUS,
  ADJUSTMENT_TYPE.DEDUCTION,
  ADJUSTMENT_TYPE.ADVANCE,
  ADJUSTMENT_TYPE.PENALTY,
  ADJUSTMENT_TYPE.OTHER,
] as const;

export const generateSalarySchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const salaryListParamsSchema = z.object({
  employeeId: z.string().uuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  status: z.enum(salaryStatusValues).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const updateSalarySchema = z.object({
  notes: z.string().optional(),
});

export const addAdjustmentSchema = z.object({
  type: z.enum(adjustmentTypeValues),
  amount: z.number().positive(),
  reason: z.string().min(1),
});

export type GenerateSalaryDto = z.infer<typeof generateSalarySchema>;
export type SalaryListParams = z.infer<typeof salaryListParamsSchema>;
export type UpdateSalaryDto = z.infer<typeof updateSalarySchema>;
export type AddAdjustmentDto = z.infer<typeof addAdjustmentSchema>;
