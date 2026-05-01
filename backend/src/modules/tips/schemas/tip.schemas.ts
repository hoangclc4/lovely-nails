import { z } from 'zod';
import { TIP_PAYMENT_METHOD } from '../../../common/constants/tip.constants';

const paymentMethodValues = [
  TIP_PAYMENT_METHOD.CASH,
  TIP_PAYMENT_METHOD.CARD,
  TIP_PAYMENT_METHOD.TRANSFER,
  TIP_PAYMENT_METHOD.INCLUDED_IN_BILL,
] as const;

export const createTipSchema = z.object({
  sessionId: z.string().uuid(),
  employeeId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(paymentMethodValues),
  note: z.string().optional(),
});

export const updateTipSchema = z.object({
  amount: z.number().positive().optional(),
  paymentMethod: z.enum(paymentMethodValues).optional(),
  note: z.string().optional(),
});

export const tipListParamsSchema = z.object({
  employeeId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  paymentMethod: z.enum(paymentMethodValues).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const tipSummaryParamsSchema = z.object({
  employeeId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type CreateTipDto = z.infer<typeof createTipSchema>;
export type UpdateTipDto = z.infer<typeof updateTipSchema>;
export type TipListParams = z.infer<typeof tipListParamsSchema>;
export type TipSummaryParams = z.infer<typeof tipSummaryParamsSchema>;
