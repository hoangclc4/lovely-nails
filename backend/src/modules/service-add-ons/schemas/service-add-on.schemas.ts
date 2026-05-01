import { z } from 'zod';

export interface ServiceAddOn {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  isActive: boolean;
}

export const createServiceAddOnSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  durationMinutes: z.number().int().positive(),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceAddOnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const serviceAddOnListParamsSchema = z.object({
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type CreateServiceAddOnDto = z.infer<typeof createServiceAddOnSchema>;
export type UpdateServiceAddOnDto = z.infer<typeof updateServiceAddOnSchema>;
export type ServiceAddOnListParams = z.infer<typeof serviceAddOnListParamsSchema>;
