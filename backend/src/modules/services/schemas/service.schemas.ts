import { z } from 'zod';

export interface Service {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  durationMinutes: z.number().int().positive(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional().default(true),
  imageUrl: z.string().url().nullable().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const serviceListParamsSchema = z.object({
  categoryId: z.string().uuid().optional(),
  isActive: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
export type ServiceListParams = z.infer<typeof serviceListParamsSchema>;
