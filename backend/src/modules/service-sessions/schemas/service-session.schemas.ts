import { z } from 'zod';
import { SESSION_STATUS } from '../../../common/constants/session.constants';

export const createSessionSchema = z.object({
  employeeId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  bookingId: z.string().uuid().optional(),
  serviceIds: z.array(z.string().uuid()).min(1),
  addOns: z.array(z.object({ name: z.string().min(1), price: z.number().positive() })).optional().default([]),
  notes: z.string().optional(),
  startTime: z.string().datetime().optional(),
});

export const addSessionServiceSchema = z.object({
  serviceId: z.string().uuid(),
});

export const addSessionAddOnSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export const addTimeExtensionSchema = z.object({
  extraMinutes: z.number().int().positive(),
  reason: z.string().min(1),
});

export const sessionListParamsSchema = z.object({
  employeeId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: z.enum([SESSION_STATUS.IN_PROGRESS, SESSION_STATUS.COMPLETED, SESSION_STATUS.CANCELLED]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const updateSessionCustomerSchema = z.object({
  customerId: z.string().uuid(),
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type AddSessionServiceDto = z.infer<typeof addSessionServiceSchema>;
export type AddSessionAddOnDto = z.infer<typeof addSessionAddOnSchema>;
export type AddTimeExtensionDto = z.infer<typeof addTimeExtensionSchema>;
export type SessionListParams = z.infer<typeof sessionListParamsSchema>;
export type UpdateSessionCustomerDto = z.infer<typeof updateSessionCustomerSchema>;
