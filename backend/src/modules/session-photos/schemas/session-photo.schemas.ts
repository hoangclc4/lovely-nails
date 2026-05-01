import { z } from 'zod';

export const createSessionPhotoSchema = z.object({
  photoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().optional(),
  isPortfolio: z.boolean().optional(),
});

export const sessionPhotoListParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const portfolioParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  isPortfolio: z.preprocess(
    (v) => {
      if (v === undefined || v === '') return undefined;
      return v === 'true' || v === true;
    },
    z.boolean().optional(),
  ),
});

export type CreateSessionPhotoDto = z.infer<typeof createSessionPhotoSchema>;
export type SessionPhotoListParams = z.infer<typeof sessionPhotoListParamsSchema>;
export type PortfolioParams = z.infer<typeof portfolioParamsSchema>;
