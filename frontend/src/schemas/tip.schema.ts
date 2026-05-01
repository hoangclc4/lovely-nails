import { z } from 'zod';
import { TIP_PAYMENT_METHOD } from '@/constants/tip.constants';

const paymentMethodValues = [
  TIP_PAYMENT_METHOD.CASH,
  TIP_PAYMENT_METHOD.CARD,
  TIP_PAYMENT_METHOD.TRANSFER,
  TIP_PAYMENT_METHOD.INCLUDED_IN_BILL,
] as const;

export const createTipSchema = z.object({
  sessionId: z.string().uuid({ message: 'Invalid session ID' }),
  employeeId: z.string().uuid({ message: 'Select an employee' }),
  customerId: z.string().uuid({ message: 'Invalid customer ID' }).optional(),
  amount: z.number().positive({ message: 'Amount must be positive' }),
  paymentMethod: z.enum(paymentMethodValues, { message: 'Select a payment method' }),
  note: z.string().optional(),
});

export const updateTipSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be positive' }).optional(),
  paymentMethod: z.enum(paymentMethodValues, { message: 'Select a payment method' }).optional(),
  note: z.string().optional(),
});

export type CreateTipDto = z.infer<typeof createTipSchema>;
export type UpdateTipDto = z.infer<typeof updateTipSchema>;
