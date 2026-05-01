import { z } from 'zod';

export const publicBookingSchema = z.object({
  serviceIds: z.array(z.string()).min(1, 'Select at least one service'),
  bookingDate: z.string().min(1, 'Select a date'),
  startTime: z.string().min(1, 'Select a time'),
  employeeId: z.string().optional(),
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(1, 'Phone is required'),
  notes: z.string().optional(),
});

export type PublicBookingFormData = z.infer<typeof publicBookingSchema>;
