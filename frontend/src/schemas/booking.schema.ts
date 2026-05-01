import { z } from 'zod';
import { BOOKING_STATUS } from '@/constants/booking.constants';

export const bookingStatusSchema = z.enum([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.NO_SHOW,
]);

export const createBookingSchema = z
  .object({
    employeeId: z.string().uuid('Please select a technician'),
    serviceIds: z.array(z.string().uuid('Must be a valid service ID')).min(1, 'At least one service required'),
    bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
    notes: z.string().optional(),
    customerId: z.string().uuid('Must be a valid customer ID').optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const updateBookingStatusSchema = z.object({
  status: bookingStatusSchema,
});

export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusFormData = z.infer<typeof updateBookingStatusSchema>;
