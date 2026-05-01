import { z } from 'zod';
import { BOOKING_STATUS, type BookingStatus } from '../../../common/constants/booking.constants';

const TIME_REGEX = /^\d{2}:\d{2}$/;

export interface Booking {
  id: string;
  customerId: string | null;
  employeeId: string;
  serviceIds: string[];
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailableEmployee {
  id: string;
  fullName: string;
  workStatus: string;
  available: boolean;
  busyUntil?: string;
}

export const bookingStatusSchema = z.enum([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.NO_SHOW,
]);

export const createBookingSchema = z.object({
  employeeId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  serviceIds: z.array(z.string().uuid()).min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  startTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  endTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  employeeId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  serviceIds: z.array(z.string().uuid()).min(1).optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  startTime: z.string().regex(TIME_REGEX, 'Must be HH:MM').optional(),
  endTime: z.string().regex(TIME_REGEX, 'Must be HH:MM').optional(),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: bookingStatusSchema,
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  startTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
  endTime: z.string().regex(TIME_REGEX, 'Must be HH:MM'),
});

export const bookingListParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  employeeId: z.string().uuid().optional(),
  status: bookingStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const calendarQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type UpdateBookingDto = z.infer<typeof updateBookingSchema>;
export type UpdateBookingStatusDto = z.infer<typeof updateBookingStatusSchema>;
export type AvailabilityQueryDto = z.infer<typeof availabilityQuerySchema>;
export type BookingListParams = z.infer<typeof bookingListParamsSchema>;
export type CalendarQueryDto = z.infer<typeof calendarQuerySchema>;
