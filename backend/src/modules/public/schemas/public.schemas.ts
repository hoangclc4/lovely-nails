import { z } from 'zod';

const TIME_REGEX = /^\d{2}:\d{2}$/;

export const publicAvailabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  startTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  endTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
});

export const publicCreateBookingSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(1).max(20),
  serviceIds: z.array(z.string().uuid()).min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(TIME_REGEX),
  endTime: z.string().regex(TIME_REGEX),
  employeeId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
}

export interface PublicEmployee {
  id: string;
  fullName: string;
}

export interface PublicBookingResult {
  bookingNumber: string;
  status: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
}

export type PublicAvailabilityQueryDto = z.infer<typeof publicAvailabilityQuerySchema>;
export type PublicCreateBookingDto = z.infer<typeof publicCreateBookingSchema>;
