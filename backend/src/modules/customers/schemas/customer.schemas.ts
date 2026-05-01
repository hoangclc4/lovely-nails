import { z } from 'zod';

export const createCustomerSchema = z.object({
  fullName: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  email: z.string().email().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerListParamsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const mergeCustomersSchema = z.object({
  keepId: z.string().uuid(),
  mergeId: z.string().uuid(),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
export type CustomerListParams = z.infer<typeof customerListParamsSchema>;
export type MergeCustomersDto = z.infer<typeof mergeCustomersSchema>;
