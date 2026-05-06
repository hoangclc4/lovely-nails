import { z } from 'zod';

export const createSessionSchema = z.object({
  employeeId: z.string().uuid({ message: 'Select an employee' }),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  bookingId: z.string().uuid({ message: 'Invalid booking ID' }).optional(),
  serviceIds: z.array(z.string().uuid()).min(1, { message: 'Select at least one service' }),
  notes: z.string().optional(),
  startTime: z.string().optional(),
});

export const addSessionServiceSchema = z.object({
  serviceId: z.string().uuid({ message: 'Select a service' }),
});

export const addSessionAddOnSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  price: z.number().positive({ message: 'Price must be positive' }),
});

export const addTimeExtensionSchema = z.object({
  extraMinutes: z.number().int().positive({ message: 'Minutes must be positive' }),
  reason: z.string().min(1, { message: 'Reason is required' }),
});

export const updateSessionCustomerSchema = z.object({
  customerId: z.string().uuid({ message: 'Select a customer' }),
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type AddSessionServiceDto = z.infer<typeof addSessionServiceSchema>;
export type AddSessionAddOnDto = z.infer<typeof addSessionAddOnSchema>;
export type AddTimeExtensionDto = z.infer<typeof addTimeExtensionSchema>;
export type UpdateSessionCustomerDto = z.infer<typeof updateSessionCustomerSchema>;
