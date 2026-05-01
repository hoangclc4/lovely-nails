import { z } from 'zod';
import { ADJUSTMENT_TYPE } from '@/constants/salary.constants';

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

export const addAdjustmentSchema = z.object({
  type: z.enum(adjustmentTypeValues),
  amount: z.number().positive(),
  reason: z.string().min(1, 'Reason is required'),
});

export type GenerateSalaryDto = z.infer<typeof generateSalarySchema>;
export type AddAdjustmentDto = z.infer<typeof addAdjustmentSchema>;
