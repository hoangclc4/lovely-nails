import { z } from 'zod';

export const updateSettingsSchema = z.object({
  salonName: z.string().min(1).optional(),
  salonAddress: z.string().optional(),
  salonPhone: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  tipPoolingEnabled: z.boolean().optional(),
  tipPoolPercentage: z.number().min(0).max(100).optional(),
  defaultBookingBuffer: z.number().int().min(0).optional(),
  autoLogoutMinutes: z.number().int().min(1).optional(),
  receiptFooterText: z.string().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
