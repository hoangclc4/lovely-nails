import { z } from 'zod';

export const addSessionPhotoSchema = z.object({
  photoUrl: z.string().url({ message: 'Enter a valid photo URL' }),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  caption: z.string().max(200).optional(),
  isPortfolio: z.boolean().optional(),
});

export type AddSessionPhotoDto = z.infer<typeof addSessionPhotoSchema>;
