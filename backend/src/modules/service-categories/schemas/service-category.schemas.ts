import { z } from 'zod';
import { SERVICE_SORT_ORDER_DEFAULT } from '../../../common/constants/service.constants';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export const createServiceCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  sortOrder: z.number().int().optional().default(SERVICE_SORT_ORDER_DEFAULT),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const serviceCategoryListParamsSchema = z.object({
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type CreateServiceCategoryDto = z.infer<typeof createServiceCategorySchema>;
export type UpdateServiceCategoryDto = z.infer<typeof updateServiceCategorySchema>;
export type ServiceCategoryListParams = z.infer<typeof serviceCategoryListParamsSchema>;
