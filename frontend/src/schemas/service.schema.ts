import { z } from 'zod';

const NAME_MIN = 1;
const NAME_MAX = 100;
const DURATION_MIN = 1;
const SORT_ORDER_DEFAULT = 0;

export const createServiceCategorySchema = z.object({
  name: z.string().min(NAME_MIN).max(NAME_MAX),
  description: z.string().optional(),
  sortOrder: z.number().int().optional().default(SORT_ORDER_DEFAULT),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

export const createServiceSchema = z.object({
  name: z.string().min(NAME_MIN).max(NAME_MAX),
  description: z.string().optional(),
  price: z.number().positive(),
  durationMinutes: z.number().int().min(DURATION_MIN),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional().default(true),
  imageUrl: z.string().url().nullable().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createServiceAddOnSchema = z.object({
  name: z.string().min(NAME_MIN).max(NAME_MAX),
  price: z.number().positive(),
  durationMinutes: z.number().int().min(DURATION_MIN),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceAddOnSchema = createServiceAddOnSchema.partial();

export type CreateServiceCategoryDto = z.infer<typeof createServiceCategorySchema>;
export type UpdateServiceCategoryDto = z.infer<typeof updateServiceCategorySchema>;
export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
export type CreateServiceAddOnDto = z.infer<typeof createServiceAddOnSchema>;
export type UpdateServiceAddOnDto = z.infer<typeof updateServiceAddOnSchema>;
